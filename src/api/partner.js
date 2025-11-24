// CollEco Travel Partner API wrapper (mock / production friendly)
// Centralizes base resolution, timeouts, and structured error normalization.
// Uses the generic api base when present; allows VITE_PARTNER_API_BASE override.

const DEFAULT_BASE = 'https://api.collecotravel.com/v1';
function resolveBase() {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_PARTNER_API_BASE || import.meta.env.VITE_API_BASE || DEFAULT_BASE;
  }
  return DEFAULT_BASE;
}

async function doRequest(path, { method = 'GET', body, headers = {}, timeoutMs = 12000 } = {}) {
  const base = resolveBase().replace(/\/$/, '');
  const url = path.startsWith('/') ? base + path : `${base}/${path}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const finalHeaders = { ...headers };
  // If sending JSON (plain object), auto stringify
  let payload = body;
  if (body && !(body instanceof FormData) && typeof body === 'object') {
    finalHeaders['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  try {
    const res = await fetch(url, { method, body: payload, headers: finalHeaders, signal: controller.signal });
    clearTimeout(id);
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch { json = text; }
    if (!res.ok) {
      const err = new Error(`Partner API ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  } catch (e) {
    if (e.name === 'AbortError') {
      const abortErr = new Error('Partner API request timed out');
      abortErr.code = 'ETIMEDOUT';
      throw abortErr;
    }
    throw e;
  }
}

export async function getPartnerProducts(partnerId) {
  if (!partnerId) throw new Error('partnerId required');
  return doRequest(`/partners/${encodeURIComponent(partnerId)}/products`);
}

export async function uploadComplianceDocs(partnerId, docs) {
  if (!partnerId) throw new Error('partnerId required');
  if (!(docs instanceof FormData)) throw new Error('docs must be FormData');
  return doRequest(`/partners/${encodeURIComponent(partnerId)}/compliance`, { method: 'POST', body: docs });
}

export async function getPartnerAnalyticsSummary(partnerId) {
  if (!partnerId) throw new Error('partnerId required');
  return doRequest(`/partners/${encodeURIComponent(partnerId)}/analytics/summary`);
}

export async function getPartnerPayouts(partnerId) {
  if (!partnerId) throw new Error('partnerId required');
  return doRequest(`/partners/${encodeURIComponent(partnerId)}/payouts`);
}

// Skeleton for future pagination helper
export async function listPartnerBookings(partnerId, { page = 1, limit = 20 } = {}) {
  if (!partnerId) throw new Error('partnerId required');
  return doRequest(`/partners/${encodeURIComponent(partnerId)}/bookings?page=${page}&limit=${limit}`);
}

export const __internal = { resolveBase, doRequest };
