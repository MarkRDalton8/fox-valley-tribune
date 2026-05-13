export async function POST(request) {
  try {
    const { uid, fields } = await request.json();

    if (!uid || !fields) {
      return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
    }

    const base = process.env.PIANO_API_URL;
    const aid = process.env.PIANO_AID;
    const token = process.env.PIANO_API_TOKEN;

    console.log('[update-profile] uid:', uid, 'fields:', JSON.stringify(fields));

    // Try all three formats in sequence and log each result
    const formats = [
      // Format A: simple bracket key=value
      () => {
        const p = new URLSearchParams();
        p.append('aid', aid); p.append('api_token', token); p.append('uid', uid);
        Object.entries(fields).forEach(([k, v]) => p.append(`custom_fields[${k}]`, v));
        return p;
      },
      // Format B: JSON string value
      () => {
        const p = new URLSearchParams();
        p.append('aid', aid); p.append('api_token', token); p.append('uid', uid);
        p.append('custom_fields', JSON.stringify(fields));
        return p;
      },
      // Format C: array of objects
      () => {
        const p = new URLSearchParams();
        p.append('aid', aid); p.append('api_token', token); p.append('uid', uid);
        Object.entries(fields).forEach(([k, v], i) => {
          p.append(`custom_fields[${i}][field_name]`, k);
          p.append(`custom_fields[${i}][value]`, v);
        });
        return p;
      },
    ];

    const results = [];
    for (let i = 0; i < formats.length; i++) {
      const params = formats[i]();
      console.log(`[update-profile] Format ${String.fromCharCode(65 + i)}:`, params.toString());
      const res = await fetch(`${base}/publisher/user/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const txt = await res.text();
      console.log(`[update-profile] Format ${String.fromCharCode(65 + i)} response:`, txt);
      results.push({ format: String.fromCharCode(65 + i), status: res.status, body: JSON.parse(txt) });
    }

    // Now call user/get to see actual current state
    const getParams = new URLSearchParams();
    getParams.append('aid', aid);
    getParams.append('api_token', token);
    getParams.append('uid', uid);
    const getRes = await fetch(`${base}/publisher/user/get?${getParams.toString()}`);
    const getBody = await getRes.text();
    console.log('[update-profile] user/get after updates:', getBody);

    return Response.json({ updateResults: results, currentUser: JSON.parse(getBody) });
  } catch (err) {
    console.error('[update-profile] Error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
