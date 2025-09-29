// Minimal client for the local collab API server
const BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN = import.meta.env.VITE_API_TOKEN || '';
export const isApiEnabled = !!import.meta.env.VITE_API_BASE;

function authHeaders() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

export async function listThreads(role) {
  const qp = new URLSearchParams();
  if (role) qp.set('role', role);
  const q = qp.toString() ? `?${qp.toString()}` : '';
  const res = await fetch(`${BASE}/api/collab${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to list threads');
  return res.json();
}

export async function getThread(bookingId, role) {
  const qp = new URLSearchParams();
  if (role) qp.set('role', role);
  const q = qp.toString() ? `?${qp.toString()}` : '';
  const res = await fetch(`${BASE}/api/collab/${bookingId}${q}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Thread not found');
  return res.json();
}

export async function postMessage(bookingId, payload) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to post message');
  return res.json();
}

export async function postAttachment(bookingId, payload) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/attachment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to post attachment');
  return res.json();
}

export async function whatsappInbound(payload) {
  const res = await fetch(`${BASE}/webhook/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to deliver WhatsApp webhook');
  return res.json();
}

export async function markRead(bookingId, role) {
  const res = await fetch(`${BASE}/api/collab/${bookingId}/read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error('Failed to mark read');
  return res.json();
}
