// Vercel serverless function — fetches Gaming Admissions pre-order items
// Tries multiple DMN endpoints and returns the full payload for client-side parsing.

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const VENUE_ID = '67bf4d0ed1dd963cdd235894';
  const TYPE_ID  = '6a69cc733e19f21bdf3b2bf5';
  const API_AUTH = '6a6a039157dfd8826153639b:691ccae4707eea11a947ee1b';

  const headers = { 'Authorization': API_AUTH };
  const results = {};

  // Try 1: booking-type details (often includes preorder_menus nested inside)
  try {
    const r = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}/booking-types/${TYPE_ID}`,
      { headers }
    );
    const data = await r.json();
    results.bookingType = { status: r.status, data };
    // If this has preorder menus directly, return it
    const menus = data?.payload?.preorder_menus || data?.payload?.booking_type?.preorder_menus;
    if (menus && menus.length > 0) {
      return res.status(200).json({ source: 'bookingType', payload: menus });
    }
  } catch (e) {
    results.bookingType = { error: e.message };
  }

  // Try 2: booking-type-specific menus endpoint
  try {
    const r = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}/booking-types/${TYPE_ID}/preorder-menus`,
      { headers }
    );
    const data = await r.json();
    results.bookingTypeMenus = { status: r.status, data };
  } catch (e) {
    results.bookingTypeMenus = { error: e.message };
  }

  // Try 3: venue-level preorder menus
  try {
    const r = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}/preorder-menus`,
      { headers }
    );
    const data = await r.json();
    results.venueMenus = { status: r.status, data };
  } catch (e) {
    results.venueMenus = { error: e.message };
  }

  // Try 4: full venue details (preorder_menus may be embedded)
  try {
    const r = await fetch(
      `https://api.designmynight.com/v4/venues/${VENUE_ID}`,
      { headers }
    );
    const data = await r.json();
    // Don't return the full venue blob — just extract the relevant bits
    const venue = data?.payload?.venue || data?.payload;
    results.venue = {
      status: r.status,
      preorder_menus: venue?.preorder_menus,
      booking_types_summary: (venue?.booking_types || []).map(bt => ({
        _id: bt._id,
        name: bt.name,
        preorder_menus: bt.preorder_menus,
      })),
    };
  } catch (e) {
    results.venue = { error: e.message };
  }

  // Return all results so the client can log and we can see the structure
  return res.status(200).json({ debug: true, results });
}
