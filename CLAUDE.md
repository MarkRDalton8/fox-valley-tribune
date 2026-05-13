# Fox Valley Tribune — Claude Session Guide

## What This Is
A Piano demo news site for the Fox Valley region of northeastern Illinois. Built entirely to showcase Piano's Composer, Analytics, ESP, Content, Insight, and Audience products in a realistic local newspaper context. Deployed on Vercel at **https://fox-valley-tribune.vercel.app**.

## Tech Stack
- **Next.js 14** (App Router, static site generation)
- **Vercel** — auto-deploys on every push to `main`
- **Piano** — Composer, Analytics, ESP SDK loaded globally
- **loremflickr.com** — section-specific article images
- **Claude API (Piano OpenWebUI endpoint)** — daily AI content generation

---

## Architecture

### Content System
All content lives in **`lib/data.js`** as a single exported `ARTICLES` array. There is no database or CMS. Adding content = appending an object to that array and pushing to GitHub.

Article shape:
```js
{
  id: 33,                          // must be unique, increment from highest existing
  slug: 'kebab-case-url',          // used in URL and as loremflickr image seed
  section: 'news',                 // news | sports | opinion | local-politics | lifestyle
  title: 'Headline',
  byline: 'Tribune Staff',
  date: 'May 8, 2026',             // display string; parsed to ISO for OG tags
  category: 'Government',          // short label shown on article card
  excerpt: 'One sentence summary.',
  body: ['Para 1', 'Para 2', ...], // array of plain-text paragraphs
  tags: ['news', 'government'],    // kebab-case; first tag should match section
  locked: true,                    // true = Piano paywall after 2 paragraphs
  featured: false,                 // true = used as section hero on homepage
}
```

### Sections
| Slug | Label | Color | Piano Container on Articles |
|------|-------|-------|----------------------------|
| `news` | News | `#0D3B6E` | — |
| `sports` | Sports | `#1B5E20` | `piano-sports-newsletter` |
| `opinion` | Opinion | `#4A148C` | — |
| `local-politics` | Local Politics | `#92400E` | `piano-politics-signup` |
| `lifestyle` | Lifestyle | `#0F766E` | `piano-lifestyle-newsletter` |

To **add a new section**: update `COLORS`, `SECTION_COLORS`, `SECTION_LABELS`, `SECTION_TAGLINES` in `lib/data.js`, add to `VALID_SECTIONS` in `app/[section]/page.jsx`, add to nav in `components/Header.jsx`, add to footer in `app/layout.jsx`, add a Piano container in `components/ArticleContent.jsx`, add to `SECTION_KEYWORDS` in both `components/ArticleContent.jsx` and `app/[section]/[slug]/page.jsx`, and add to the `SECTIONS` array in `scripts/publish-daily.js`.

---

## Piano Integration

### Three Scripts (loaded globally in `app/layout.jsx`)
1. **Composer** — `experience.tinypass.com` — AID: `QiNgMM49pu`
2. **Analytics** — `tag.aticdn.net/piano-analytics.js` — Site ID: `639124`
3. **ESP SDK** — `api-esp.piano.io` — Hash: `E684A334-071D-4AFE-9F03-1C2EC0C7F2EA`

These load on **every page** automatically. No per-page script tags needed.

### Per-Page Piano Setup
Every page renders `<PianoInit section="..." />` which calls `tp.push(['setContentSection', ...])` then `tp.experience.execute()`. Article pages also pass `tags` and `contentCreator` (byline).

### Piano Config (`lib/data.js`)
```js
export const PIANO_CONFIG = {
  AID: 'QiNgMM49pu',
  OFFER_ID: 'OFSKQS2JDQIS',
  SUBSCRIBER_RESOURCE_ID: null,   // set this to enable paywall access checks
};
```

### Named Piano Containers
Empty divs that Piano Composer injects experiences into. Add new ones in `components/ArticleContent.jsx` and register them in the Composer UI.

| Class | Location | Purpose |
|-------|----------|---------|
| `piano-container` | Locked articles | Paywall gate (2-para fade) |
| `piano-home-sports` | Home page | Marketing placement |
| `piano-sports-newsletter` | Sports articles | Newsletter signup |
| `piano-politics-signup` | Local Politics articles | Email signup |
| `piano-lifestyle-newsletter` | Lifestyle articles | Newsletter signup |

### OG + Meta Tags (article pages)
All set in `generateMetadata` in `app/[section]/[slug]/page.jsx`:
- `og:title`, `og:description`, `og:url`, `og:type`, `og:image`
- `article:published_time`, `article:modified_time`, `article:author`, `article:section`, `article:tag`
- `cXenseParse:image` (via `other` field — renders as `name=`, which is correct Cxense format)

---

## Daily Content Publishing

### How It Works
`scripts/publish-daily.js` rotates through all 5 sections daily, calls the Piano OpenWebUI LLM endpoint to generate a full AP-style article, appends it to `lib/data.js`, commits, and pushes. Vercel auto-deploys on push.

### Trigger Manually
```bash
launchctl start com.foxvalleytribune.publish
tail -f /tmp/fvt-publish.log
```

### Schedule
Runs at **5:00 AM daily** via launchd:
`~/Library/LaunchAgents/com.foxvalleytribune.publish.plist`

### State File
`scripts/.publish-state.json` tracks `lastSection` and `lastId`. If you need to reset or adjust the rotation, edit this file. It is committed to git.

### LLM Endpoint
Configured in `.env` (gitignored — never committed):
```
OPENWEBUI_API_KEY=...
OPENWEBUI_ENDPOINT=https://llm.de-prod.cxense.com/
OPENWEBUI_MODEL=us.anthropic.claude-opus-4-6-v1
```
Credentials live in `~/code/spiffy-cli/.env` under the `OPENWEBUI` section if you need to recreate the `.env` file.

---

## Images
Images are pulled from **loremflickr.com** using section-specific keywords and the article ID as a lock (so the same article always gets the same photo).

| Section | Keywords |
|---------|----------|
| news | city,community |
| sports | sports,athletics |
| opinion | newspaper,writing |
| local-politics | government,politics |
| lifestyle | lifestyle,home |

- **Article display**: 160×160, float left, text wraps
- **OG / cXenseParse**: 1200×630 (same keyword + lock)

The keyword map lives in two places — keep them in sync if adding sections:
- `components/ArticleContent.jsx` — `SECTION_KEYWORDS`
- `app/[section]/[slug]/page.jsx` — `SECTION_KEYWORDS`

---

## Homepage Layout
```
[ Latest News (2/3) — 2 most recently added articles ] [ Sports sidebar (1/3) ]
─────────────────────────────────────────────────────────────────────────────
[ Opinion (1/2) ] [ Local Politics (1/2) ]
```
"Latest News" auto-updates — it always shows the 2 highest-ID articles regardless of section.

---

## Key Files
| File | Purpose |
|------|---------|
| `lib/data.js` | All content, section config, Piano config |
| `app/layout.jsx` | Root layout — Piano scripts, header, footer |
| `app/page.jsx` | Homepage layout |
| `app/[section]/page.jsx` | Section landing pages |
| `app/[section]/[slug]/page.jsx` | Article metadata (OG tags) |
| `components/ArticleContent.jsx` | Article display, image, Piano containers |
| `components/PianoInit.jsx` | Sets Piano context + fires experience.execute() |
| `components/Header.jsx` | Nav, login/logout, Piano event handlers |
| `components/SubscribeRibbon.jsx` | Bottom slide-up banner (3s delay) |
| `scripts/publish-daily.js` | Daily AI content generation script |
| `scripts/.publish-state.json` | Rotation state — last section + last article ID |
| `.env` | LLM credentials (gitignored) |

---

## Common Tasks

**Add an article manually** — append to `ARTICLES` in `lib/data.js`, increment the ID, commit and push.

**Change homepage layout** — edit `app/page.jsx`.

**Add a Piano named container** — add an empty `<div className="piano-xyz" />` in `ArticleContent.jsx`, then create the experience in Piano Composer targeting that class.

**Enable the paywall** — set `SUBSCRIBER_RESOURCE_ID` in `PIANO_CONFIG` to a valid Piano resource ID.

**Check publish logs** — `cat /tmp/fvt-publish.log` or `cat /tmp/fvt-publish-error.log`.

**Reload the launchd job after editing the plist** — `launchctl unload ~/Library/LaunchAgents/com.foxvalleytribune.publish.plist && launchctl load ~/Library/LaunchAgents/com.foxvalleytribune.publish.plist`

---

## Piano API — Writing Custom Fields

The `publisher/user/update` endpoint has a non-obvious transport requirement that Piano's docs don't clearly explain.

**The working format** (confirmed via testing):
- Method: `POST https://api.piano.io/api/v3/publisher/user/update`
- Body: `application/x-www-form-urlencoded` with `api_token`, `aid`, `uid`, and `custom_fields` all as form fields
- `custom_fields` must be a **JSON-encoded map string**: `{"FIELD_NAME": "value"}`
- `api_token` must be in the **form body** (not just the Authorization/api_token header)

**Select field values** (`SINGLE_SELECT_LIST`, `MULTI_SELECT_LIST`) must be wrapped as JSON arrays: `'["Male"]'` not `"Male"`. Plain strings silently fail with a 200 response.

**Things that don't work** (all return 200 but silently drop the update):
- Sending `custom_fields` as a JSON array of `{field_name, value}` objects in the request body
- Sending `custom_fields` as form-encoded key-value pairs (e.g. `custom_fields[COMPANY]=Foo`)
- `Content-Type: application/json` with a JSON body
- `api_token` in the header only (without also including it in the form body)

**Node.js implementation** (see `app/api/piano-profile/route.js`):
```js
const body = new URLSearchParams({
  api_token: TOKEN,
  aid: AID,
  uid,
  custom_fields: JSON.stringify(fields), // fields = { COMPANY: "Foo", job_level: '["CEO"]' }
});
await fetch('https://api.piano.io/api/v3/publisher/user/update', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: body.toString(),
});
```

**CLI tool** — `scripts/piano_id_cf.py` can get/set/list-fields from the terminal:
```bash
FOXVALLEY_API_TOKEN=... FOXVALLEY_AID=... python3 scripts/piano_id_cf.py list-fields --uid <any-uid>
FOXVALLEY_API_TOKEN=... FOXVALLEY_AID=... python3 scripts/piano_id_cf.py set <uid> -f COMPANY=Foo -f gender=Male
```
