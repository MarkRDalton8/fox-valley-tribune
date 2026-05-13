export async function POST(request) {
  const { uid, fields } = await request.json();

  if (!uid || !fields) {
    return Response.json({ error: 'Missing uid or fields' }, { status: 400 });
  }

  const params = new URLSearchParams({
    aid: process.env.PIANO_AID,
    api_token: process.env.PIANO_API_TOKEN,
    uid,
    custom_fields: JSON.stringify(fields),
  });

  const response = await fetch(`${process.env.PIANO_API_URL}/publisher/user/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await response.json();
  return Response.json(data);
}
