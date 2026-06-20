// /api/jamendo — Vercel Serverless Function
// Proxies requests to the Jamendo Music API (https://developer.jamendo.com)
// Jamendo hosts full-length tracks (not 30s previews) under free/CC licenses.
// This endpoint hides the client_id and forwards any query params to Jamendo's
// /tracks/ endpoint, returning the JSON response as-is to the frontend.

export default async function handler(req, res) {
  // CORS (in case the front-end is ever served from a different origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Default Jamendo client_id (free, provided by you). You can override it
  // anytime in Vercel → Project Settings → Environment Variables → JAMENDO_CLIENT_ID
  const CLIENT_ID = process.env.JAMENDO_CLIENT_ID || '9e986b95';

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    format: 'json',
    include: 'musicinfo',
    audioformat: 'mp32', // 192kbps mp3 — full track, not a preview
  });

  // Forward whitelisted query params from the client request
  const allowed = ['search', 'limit', 'offset', 'order', 'tags', 'fuzzytags', 'id', 'artist_name', 'namesearch'];
  for (const key of allowed) {
    if (req.query[key] !== undefined) params.set(key, req.query[key]);
  }
  if (!params.has('limit')) params.set('limit', '24');

  const url = `https://api.jamendo.com/v3.0/tracks/?${params.toString()}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Jamendo upstream error', status: upstream.status });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed', detail: String(err) });
  }
}
