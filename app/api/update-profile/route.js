export async function POST(request) {
  try {
    const { uid, fields } = await request.json();

    if (!uid || !fields) {
      return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
    }

    const url = `${process.env.PIANO_API_URL}/publisher/user/update`;
    console.log('[update-profile] POST', url, { uid, fields });

    const payload = {
      aid: process.env.PIANO_AID,
      api_token: process.env.PIANO_API_TOKEN,
      uid,
      custom_fields: fields,
    };
    console.log('[update-profile] Sending payload:', JSON.stringify(payload));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log('[update-profile] Piano status:', response.status, 'body:', text);

    const data = JSON.parse(text);
    return Response.json(data);
  } catch (err) {
    console.error('[update-profile] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
