// /api/audius — Vercel Serverless Function
// Proxies requests to the Audius API (https://docs.audius.org), a decentralized
// music platform with a fully open, keyless API. Used together with Jamendo to
// give AsterTune a much bigger free, full-length catalog.

const APP_NAME = 'AsterTune';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const type = req.query.type === 'trending' ? 'trending' : 'search';
  const params = new URLSearchParams({ app_name: APP_NAME });

  if (type === 'search') {
    params.set('query', req.query.query || '');
  } else {
    if (req.query.genre) params.set('genre', req.query.genre);
    if (req.query.time) params.set('time', req.query.time); // week | month | allTime
  }
  if (req.query.limit) params.set('limit', req.query.limit);

  const url = `https://api.audius.co/v1/tracks/${type}?${params.toString()}`;

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'Audius upstream error', status: upstream.status });
    }
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Fetch failed', detail: String(err) });
  }
}
