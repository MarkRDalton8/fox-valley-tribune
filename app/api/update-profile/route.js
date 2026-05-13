export async function POST(request) {
  try {
    const { uid, tinytoken, fields } = await request.json();

    if (!uid || !fields) {
      return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
    }

    const aid = process.env.PIANO_AID;
    const publisherToken = process.env.PIANO_API_TOKEN;
    const url = 'https://api.piano.io/api/v3/publisher/user/update';

    const params = new URLSearchParams();
    params.append('aid', aid);
    params.append('uid', uid);
    Object.entries(fields).forEach(([k, v]) => params.append(`custom_fields[${k}]`, v));

    // Try with user_token (tinytoken from browser) first — this uses the user's own auth
    // Fall back to api_token (publisher auth) if not available
    if (tinytoken) {
      params.append('user_token', tinytoken);
      console.log('[update-profile] Using user_token (tinytoken)');
    } else {
      params.append('api_token', publisherToken);
      console.log('[update-profile] Falling back to api_token');
    }

    console.log('[update-profile] POST', url);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const body = await res.text();
    console.log('[update-profile] response:', body.substring(0, 300));

    const data = JSON.parse(body);

    // Verify with user/get using publisher token
    const verifyParams = new URLSearchParams({ aid, api_token: publisherToken, uid });
    const verifyRes = await fetch(`https://api.piano.io/api/v3/publisher/user/get?${verifyParams}`);
    const verifyData = JSON.parse(await verifyRes.text());
    const verifiedFields = (verifyData?.user?.custom_fields || [])
      .filter(f => Object.keys(fields).includes(f.fieldName))
      .map(f => ({ fieldName: f.fieldName, value: f.value }));

    console.log('[update-profile] verified:', JSON.stringify(verifiedFields));
    const saved = verifiedFields.some(f => f.value !== null);

    return Response.json({ success: data?.code === 0 && saved, code: data?.code, verifiedFields });
  } catch (err) {
    console.error('[update-profile] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
