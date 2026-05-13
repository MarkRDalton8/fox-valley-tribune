export async function POST(request) {
  try {
    const { uid, fields } = await request.json();

    if (!uid || !fields) {
      return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
    }

    const aid = process.env.PIANO_AID;
    const token = process.env.PIANO_API_TOKEN;

    // Try both Piano API base URLs
    const endpoints = [
      `https://api.piano.io/api/v3/publisher/user/update`,
      `https://buy.tinypass.com/api/v3/publisher/user/update`,
    ];

    const results = [];

    for (const url of endpoints) {
      const params = new URLSearchParams();
      params.append('aid', aid);
      params.append('api_token', token);
      params.append('uid', uid);
      Object.entries(fields).forEach(([k, v]) => params.append(`custom_fields[${k}]`, v));

      console.log(`[update-profile] POST ${url} params: ${params.toString()}`);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const body = await res.text();
      console.log(`[update-profile] ${url} → ${res.status}: ${body}`);
      results.push({ url, status: res.status, body: JSON.parse(body) });
    }

    // Verify: call user/get to see actual field values after update
    const verifyParams = new URLSearchParams({ aid, api_token: token, uid });
    const verifyRes = await fetch(`https://api.piano.io/api/v3/publisher/user/get?${verifyParams}`);
    const verifyBody = await verifyRes.text();
    const verifyData = JSON.parse(verifyBody);
    const verifiedFields = (verifyData?.user?.custom_fields || [])
      .filter(f => Object.keys(fields).includes(f.fieldName))
      .map(f => ({ fieldName: f.fieldName, value: f.value }));

    console.log('[update-profile] verified fields after update:', JSON.stringify(verifiedFields));

    const anySuccess = results.some(r => r.body?.code === 0);
    const saved = verifiedFields.some(f => f.value !== null);

    return Response.json({ success: anySuccess && saved, results, verifiedFields });
  } catch (err) {
    console.error('[update-profile] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
