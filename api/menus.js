// Vercel serverless function — fetches Gaming Admissions pre-order items
// Tries booking-type-specific menus first, falls back to venue-level.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const VENUE_ID = '67bf4d0ed1dd963cdd235894';
  const TYPE_ID  = '6a69cc733e19f21bdf3b2bf5';
  const API_AUTH = '6a6a039157dfd8826153639b:691ccae4707eea11a947ee1b';

  const headers = { 'Authorization': API_AUTH };

  try {
    // Try booking-type-specific menus first
    const r1 = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}/booking-types/${TYPE_ID}/preorder-menus`,
      { headers }
    );
    if (r1.ok) {
      const data = await r1.json();
      return res.status(200).json(data);
    }

    // Fallback: all venue menus
    const r2 = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}/preorder-menus`,
      { headers }
    );
    const data2 = await r2.json();
    return res.status(r2.status).json(data2);
  } catch (err) {
    return res.status(500).json({ error: 'Menus proxy error', detail: err.message });
  }
}
