import { NextResponse } from 'next/server';

const AID = process.env.PIANO_AID;
const TOKEN = process.env.PIANO_API_TOKEN;
const BASE = 'https://api.piano.io';

export async function GET(request) {
  const uid = request.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

  const res = await fetch(`${BASE}/api/v3/publisher/user/get?aid=${AID}&uid=${uid}`, {
    method: 'POST',
    headers: { 'api_token': TOKEN, 'Accept': 'application/json' },
  });
  const data = await res.json();

  const cf = {};
  for (const f of data?.user?.custom_fields || []) {
    if (f.value != null) cf[f.fieldName || f.field_name] = f.value;
  }
  return NextResponse.json({ custom_fields: cf });
}

export async function POST(request) {
  const { uid, fields } = await request.json();
  if (!uid || !fields) {
    return NextResponse.json({ error: 'uid and fields required' }, { status: 400 });
  }

  const body = new URLSearchParams({
    api_token: TOKEN,
    aid: AID,
    uid,
    custom_fields: JSON.stringify(fields),
  });

  const res = await fetch(`${BASE}/api/v3/publisher/user/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: body.toString(),
  });

  const data = await res.json();
  if (data.code !== 0) {
    return NextResponse.json({ error: data }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
