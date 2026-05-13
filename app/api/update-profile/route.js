export async function POST(request) {
  try {
    const { uid, fields } = await request.json();

    if (!uid || !fields) {
      return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
    }

    const url = `${process.env.PIANO_API_URL}/publisher/user/update`;
    console.log('[update-profile] POST', url, { uid, fields });

    const params = new URLSearchParams();
    params.append('aid', process.env.PIANO_AID);
    params.append('api_token', process.env.PIANO_API_TOKEN);
    params.append('uid', uid);
    Object.entries(fields).forEach(([key, value], i) => {
      params.append(`custom_fields[${i}][field_name]`, key);
      params.append(`custom_fields[${i}][value]`, value);
    });
    console.log('[update-profile] Sending:', params.toString());

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
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
