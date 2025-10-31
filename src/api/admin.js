// CollEco Travel Admin API (modular, scalable)
// Use this module for admin-specific API calls and integrations.

const BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL)
  ? import.meta.env.VITE_API_URL
  : 'https://api.collecotravel.com/v1';

export async function getAuditLogs() {
  // GET /admin/audit-logs
  const res = await fetch(`${BASE_URL}/admin/audit-logs`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function approvePartner(partnerId) {
  // POST /admin/partners/:id/approve
  const res = await fetch(`${BASE_URL}/admin/partners/${partnerId}/approve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to approve partner');
  return res.json();
}

// Add more endpoints for compliance, payouts, analytics, etc.
