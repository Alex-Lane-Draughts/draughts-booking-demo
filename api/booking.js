// Vercel serverless function — proxies booking creation to DMN API
// Runs server-side, so no CORS issues.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const API_AUTH = '6a6a039157dfd8826153639b:691ccae4707eea11a947ee1b';

  try {
    const upstream = await fetch(
      'https://api.designmynight.com/v4/bookings',
      {
        method: 'POST',
        headers: {
          'Authorization': API_AUTH,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    const data = await upstream.json();
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', detail: err.message });
  }
}
