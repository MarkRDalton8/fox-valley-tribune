#!/usr/bin/env python3
"""
piano_id_cf.py — Piano ID custom fields CLI

Three commands:
  get <uid>                                  read user + custom fields
  set <uid> --field NAME=VALUE [...]         update custom fields, with verification
  list-fields                                list custom field definitions in the tenant

Env vars required:
  FOXVALLEY_API_TOKEN  Piano Publisher API token
  FOXVALLEY_AID        Piano application ID

Quick examples:
  python piano_id_cf.py get ABC123
  python piano_id_cf.py set ABC123 --field phone_number=5551234567
  python piano_id_cf.py set ABC123 -f phone_number=5551234567 -f gender=Male
  python piano_id_cf.py list-fields
"""
import argparse
import json
import logging
import os
import sys
import time
from typing import Any, Dict, List, Optional, Tuple

import requests

BASE_URL = "https://api.piano.io"
TIMEOUT = 30
RETRY_DELAYS = [1, 4, 16]

log = logging.getLogger("piano_id_cf")


# ---------- HTTP helpers ----------

def _session(api_token: str) -> requests.Session:
    s = requests.Session()
    s.headers.update({
        "api_token": api_token,
        "Accept": "application/json",
        "User-Agent": "piano-id-cf/0.1",
    })
    s._piano_api_token = api_token  # stored for form-body calls
    return s


def _request(session: requests.Session, method: str, path: str,
             params: Dict[str, Any], json_body: Optional[Any] = None,
             form_body: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Send a request with retries on 5xx/network errors. Never logs the token."""
    url = BASE_URL + path
    last_err: Optional[str] = None

    for attempt, delay in enumerate([0] + RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            r = session.request(method, url, params=params, json=json_body,
                                data=form_body, timeout=TIMEOUT)
        except requests.RequestException as e:
            last_err = f"network error: {e}"
            log.warning("attempt %d: %s", attempt + 1, last_err)
            continue

        if r.status_code in (401, 403):
            sys.stderr.write(
                f"\nAuth failed ({r.status_code}). "
                f"Check FOXVALLEY_API_TOKEN and FOXVALLEY_AID.\n"
                f"Response: {r.text[:500]}\n"
            )
            sys.exit(2)
        if r.status_code == 404:
            return {"_status": 404, "_body": _safe_json(r)}
        if r.status_code >= 500:
            last_err = f"{r.status_code} {r.text[:200]}"
            log.warning("attempt %d: server error %s", attempt + 1, last_err)
            continue
        if not r.ok:
            sys.stderr.write(f"\nRequest failed: {r.status_code}\n{r.text[:1000]}\n")
            sys.exit(1)

        return _safe_json(r)

    sys.stderr.write(f"\nRequest failed after retries: {last_err}\n")
    sys.exit(1)


def _safe_json(r: requests.Response) -> Dict[str, Any]:
    try:
        return r.json()
    except ValueError:
        return {"_raw": r.text}


# ---------- API operations ----------

def get_user(session: requests.Session, aid: str, uid: str) -> Optional[Dict[str, Any]]:
    """GET a user. Returns None on 404."""
    resp = _request(session, "POST", "/api/v3/publisher/user/get",
                    params={"aid": aid, "uid": uid})
    if resp.get("_status") == 404:
        return None
    user = resp.get("user")
    if not user:
        sys.stderr.write(f"Unexpected response shape: {json.dumps(resp)[:500]}\n")
        sys.exit(1)
    return user


def list_field_definitions(session: requests.Session, aid: str,
                           sample_uid: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    List all custom field definitions configured in the tenant.

    Piano doesn't expose a standalone field-definitions endpoint accessible with
    publisher credentials. The user/get response includes the full schema for every
    defined field (type, title, options, validators) — populated or not — so we fetch
    that if a sample_uid is provided, otherwise fall back to the /id/api/v1/publisher/customField
    endpoint which may work in some Piano environments.
    """
    if sample_uid:
        resp = _request(session, "POST", "/api/v3/publisher/user/get",
                        params={"aid": aid, "uid": sample_uid})
        user = resp.get("user") or {}
        fields = user.get("custom_fields") or []
        if fields:
            # Normalise to have field_name key for consistency
            for f in fields:
                if "fieldName" in f and "field_name" not in f:
                    f["field_name"] = f["fieldName"]
            return fields

    # Fallback — try the dedicated endpoint
    resp = _request(session, "POST", "/id/api/v1/publisher/customField",
                    params={"aid": aid})
    if isinstance(resp, list):
        return resp
    for key in ("customFields", "custom_fields", "data", "fields"):
        if key in resp and isinstance(resp[key], list):
            return resp[key]
    for v in resp.values():
        if isinstance(v, list):
            return v
    sys.stderr.write(f"Could not parse field definitions: {json.dumps(resp)[:500]}\n")
    sys.exit(1)


def update_custom_fields(session: requests.Session, aid: str, uid: str,
                         fields: Dict[str, str]) -> Dict[str, Any]:
    """
    THE CRITICAL CALL.

    Piano's /api/v3/publisher/user/update requires everything in a form-encoded
    body, with custom_fields as a JSON-encoded map string {"FIELD_NAME": "value"}.

    Sending custom_fields as a JSON array (field_name/value pairs) or as a
    Content-Type: application/json body both return 400 or silent no-ops.
    The api_token must also be in the form body (not just the header).
    """
    cf_map = {name: value for name, value in fields.items()}
    form = {
        "api_token": session._piano_api_token,
        "aid": aid,
        "uid": uid,
        "custom_fields": json.dumps(cf_map),
    }
    return _request(session, "POST", "/api/v3/publisher/user/update",
                    params={}, form_body=form)


# ---------- Pretty-printing ----------

def _cf_dict(user: Dict[str, Any]) -> Dict[str, str]:
    """Extract custom_fields from a user response as {name: value}. Skips null values."""
    out: Dict[str, str] = {}
    for cf in user.get("custom_fields") or []:
        name = cf.get("field_name") or cf.get("fieldName")
        value = cf.get("value")
        if name is not None and value is not None:
            out[name] = str(value)
    return out


def _field_type_map(defs: List[Dict[str, Any]]) -> Dict[str, str]:
    """Return {field_name: data_type} from a list of field definitions."""
    return {
        (d.get("field_name") or d.get("fieldName")): (d.get("data_type") or d.get("dataType") or "TEXT")
        for d in defs
        if (d.get("field_name") or d.get("fieldName"))
    }


def _encode_field_value(value: str, data_type: str) -> str:
    """Encode a field value for the Piano update API.

    SELECT_LIST fields store values as JSON-array strings (e.g. '["Male"]').
    All other types use plain strings.
    """
    if data_type in ("SINGLE_SELECT_LIST", "MULTI_SELECT_LIST"):
        return json.dumps([value])
    return value


def _decode_field_value(raw: str, data_type: str) -> str:
    """Decode a stored field value back to a plain string for comparison."""
    if data_type in ("SINGLE_SELECT_LIST", "MULTI_SELECT_LIST"):
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list) and parsed:
                return str(parsed[0])
        except (ValueError, TypeError):
            pass
    return raw


def print_user(user: Dict[str, Any]) -> None:
    name = " ".join(filter(None, [user.get("first_name"), user.get("last_name")])) or "(no name)"
    print(f"{name}  (uid: {user.get('uid')})")
    if user.get("email"):
        print(user["email"])
    if user.get("create_date"):
        print(f"Registered: {user['create_date']}")
    cf = _cf_dict(user)
    type_map = _field_type_map(user.get("custom_fields") or [])
    if not cf:
        print("\nNo custom fields set.")
        return
    print(f"\nCustom fields ({len(cf)}):")
    width = max(len(k) for k in cf) + 2
    for k in sorted(cf):
        v = _decode_field_value(cf[k], type_map.get(k, "TEXT"))
        if len(v) > 100:
            v = v[:97] + "..."
        print(f"  {k:<{width}} = {v}")


def print_field_definitions(defs: List[Dict[str, Any]], raw: bool = False) -> None:
    if raw:
        print(json.dumps(defs, indent=2))
        return
    if not defs:
        print("(no custom fields defined)")
        return
    print(f"{len(defs)} custom field definitions:\n")
    width = max(len(d.get("field_name") or d.get("fieldName") or "") for d in defs) + 2
    for d in sorted(defs, key=lambda x: (x.get("field_name") or x.get("fieldName") or "")):
        fname = d.get("field_name") or d.get("fieldName") or "?"
        title = d.get("title") or ""
        dtype = d.get("data_type") or d.get("dataType") or ""
        marker = ""
        if d.get("archived"):
            marker = " [archived]"
        print(f"  {fname:<{width}} {dtype:<12} {title}{marker}")


# ---------- Commands ----------

def cmd_get(args: argparse.Namespace, session: requests.Session) -> int:
    user = get_user(session, args.aid, args.uid)
    if user is None:
        sys.stderr.write(f"User not found: {args.uid}\n")
        return 1
    if args.json:
        print(json.dumps(user, indent=2))
    else:
        print_user(user)
    return 0


def cmd_list_fields(args: argparse.Namespace, session: requests.Session) -> int:
    defs = list_field_definitions(session, args.aid, sample_uid=getattr(args, "uid", None))
    print_field_definitions(defs, raw=args.raw)
    return 0


def cmd_set(args: argparse.Namespace, session: requests.Session) -> int:
    # Parse --field args into {name: value}
    fields: Dict[str, str] = {}
    for spec in args.field:
        if "=" not in spec:
            sys.stderr.write(f"Bad --field syntax (need NAME=VALUE): {spec}\n")
            return 1
        name, value = spec.split("=", 1)
        name = name.strip()
        if not name:
            sys.stderr.write(f"Empty field name in: {spec}\n")
            return 1
        fields[name] = value

    if not fields:
        sys.stderr.write("No fields to set.\n")
        return 1

    # Fetch field definitions (needed for type-aware encoding and validation)
    defs = list_field_definitions(session, args.aid, sample_uid=args.uid)
    type_map = _field_type_map(defs)

    # Validate field names unless --no-validate
    if not args.no_validate:
        valid_names = set(type_map.keys())
        unknown = [n for n in fields if n not in valid_names]
        if unknown:
            sys.stderr.write(f"\nUnknown field name(s): {', '.join(unknown)}\n\n")
            sys.stderr.write("Valid field names in this tenant:\n")
            for n in sorted(valid_names):
                sys.stderr.write(f"  {n}\n")
            sys.stderr.write("\nUse --no-validate to skip this check.\n")
            return 1

    # Encode values for the Piano API (select fields need JSON-array wrapping)
    encoded_fields = {
        name: _encode_field_value(value, type_map.get(name, "TEXT"))
        for name, value in fields.items()
    }

    # Read current state so we can show before/after
    before_user = get_user(session, args.aid, args.uid)
    if before_user is None:
        sys.stderr.write(f"User not found: {args.uid}\n")
        return 1
    before_cf = _cf_dict(before_user)

    # Show plan (decoded for readability)
    print(f"Setting {len(fields)} custom field(s) on uid {args.uid}:\n")
    width = max(len(k) for k in fields) + 2
    for name, new_value in fields.items():
        raw_old = before_cf.get(name)
        old = _decode_field_value(raw_old, type_map.get(name, "TEXT")) if raw_old else "(unset)"
        print(f"  {name:<{width}} : {old}  →  {new_value}")
    print()

    if args.dry_run:
        print("(--dry-run — not sending)")
        return 0

    # Send update with encoded values
    update_custom_fields(session, args.aid, args.uid, encoded_fields)
    print("✓ Update call returned 200. Verifying...")

    # Verification GET — guards against silent no-ops
    after_user = get_user(session, args.aid, args.uid)
    if after_user is None:
        sys.stderr.write("Verification GET returned 404 (?!)\n")
        return 1
    after_cf = _cf_dict(after_user)

    mismatches = []
    for name, expected_encoded in encoded_fields.items():
        actual_raw = after_cf.get(name, "")
        # Compare decoded values (handles array-wrapped select fields)
        actual_decoded = _decode_field_value(actual_raw, type_map.get(name, "TEXT"))
        expected_decoded = fields[name]  # original plain-string value
        if actual_decoded != expected_decoded:
            mismatches.append((name, expected_decoded, actual_decoded))

    if mismatches:
        sys.stderr.write("\n✗ VERIFICATION FAILED. Update returned 200 but values didn't change:\n")
        for name, expected, actual in mismatches:
            sys.stderr.write(f"  {name}: expected {expected!r}, got {actual!r}\n")
        sys.stderr.write(
            "\nThis usually means the field name doesn't exist as a custom field "
            "definition (check `list-fields`), OR Piano silently rejected the value "
            "(e.g. not in the field's option list).\n"
        )
        return 1

    print("✓ Verified — all values updated.")
    return 0


# ---------- Main ----------

def main() -> int:
    p = argparse.ArgumentParser(prog="piano_id_cf",
                                description="Piano ID custom fields management")
    p.add_argument("--api-token", default=os.environ.get("FOXVALLEY_API_TOKEN"),
                   help="Piano API token (default: env FOXVALLEY_API_TOKEN)")
    p.add_argument("--aid", default=os.environ.get("FOXVALLEY_AID"),
                   help="Piano AID (default: env FOXVALLEY_AID)")
    p.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")

    sub = p.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("get", help="Get a user and their custom fields")
    g.add_argument("uid")
    g.add_argument("--json", action="store_true", help="Output raw JSON")

    s = sub.add_parser("set", help="Set custom fields on a user (with verification)")
    s.add_argument("uid")
    s.add_argument("-f", "--field", action="append", default=[],
                   metavar="NAME=VALUE",
                   help="Field to set (repeatable)")
    s.add_argument("--dry-run", action="store_true",
                   help="Print what would be sent, don't send")
    s.add_argument("--no-validate", action="store_true",
                   help="Skip checking field names against tenant definitions")

    lf = sub.add_parser("list-fields", help="List custom field definitions in the tenant")
    lf.add_argument("--uid", default=None,
                    help="Sample user UID to pull field schema from (recommended)")
    lf.add_argument("--raw", action="store_true", help="Print full DTOs as JSON")

    args = p.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.WARNING,
        format="%(levelname)s %(message)s",
    )

    if not args.api_token:
        sys.stderr.write("Missing API token. Set FOXVALLEY_API_TOKEN or pass --api-token.\n")
        return 2
    if not args.aid:
        sys.stderr.write("Missing AID. Set FOXVALLEY_AID or pass --aid.\n")
        return 2

    session = _session(args.api_token)

    if args.cmd == "get":
        return cmd_get(args, session)
    if args.cmd == "set":
        return cmd_set(args, session)
    if args.cmd == "list-fields":
        return cmd_list_fields(args, session)

    p.print_help()
    return 1


if __name__ == "__main__":
    sys.exit(main())
