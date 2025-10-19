// CollEco Travel Partner API (modular, scalable)
// Use this module for partner-specific API calls and integrations.

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'https://api.collecotravel.com/v1';

export async function getPartnerProducts(partnerId) {
  // GET /partners/:id/products
  const res = await fetch(`${BASE_URL}/partners/${partnerId}/products`);
  if (!res.ok) throw new Error('Failed to fetch partner products');
  return res.json();
}

export async function uploadComplianceDocs(partnerId, docs) {
  // POST /partners/:id/compliance
  const res = await fetch(`${BASE_URL}/partners/${partnerId}/compliance`, {
    method: 'POST',
    body: docs // FormData for file uploads
  });
  if (!res.ok) throw new Error('Failed to upload compliance docs');
  return res.json();
}

// Add more endpoints for partner onboarding, payouts, analytics, etc.
