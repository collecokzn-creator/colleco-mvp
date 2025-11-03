// Lightweight wrapper for Siteminder integration (mock-first)
// Exports: createBooking, updateBooking, cancelBooking, getAvailability, pushRates

const useMock = process.env.SITEMINDER_USE_MOCK === '1' || !process.env.SITEMINDER_API_URL;
let mock;
if (useMock) {
  mock = require('./__mocks__/siteminder.mock');
}

const API_URL = process.env.SITEMINDER_API_URL;
const API_KEY = process.env.SITEMINDER_API_KEY;

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function httpRequest(path, { method = 'GET', body, headers = {}, retries = 2 } = {}) {
  if (useMock) throw new Error('httpRequest should not be used in mock mode');
  const base = API_URL.replace(/\/+$/,'');
  const url = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  const allHeaders = Object.assign({ 'content-type': 'application/json' }, headers);
  if (API_KEY) allHeaders['authorization'] = `Bearer ${API_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { method, headers: allHeaders, body: body ? JSON.stringify(body) : undefined });
    if (res.status === 429) {
      const ra = res.headers.get('Retry-After');
      const wait = ra ? parseInt(ra,10) * 1000 : (1000 * Math.pow(2, attempt));
      if (attempt < retries) { await sleep(wait + Math.floor(Math.random()*500)); continue; }
    }
    if (res.status >= 500 && res.status < 600) {
      if (attempt < retries) { await sleep(200 * Math.pow(2, attempt)); continue; }
    }
    const text = await res.text();
    let json;
    try { json = text ? JSON.parse(text) : null; } catch (e) { json = text; }
    if (!res.ok) {
      const err = new Error(`Siteminder API error ${res.status}: ${res.statusText}`);
      err.status = res.status;
      err.body = json;
      throw err;
    }
    return json;
  }
  throw new Error('Siteminder: retries exhausted');
}

async function createBooking(bookingData) {
  if (useMock) return mock.createBooking(bookingData);
  const headers = {};
  if (bookingData && bookingData.idempotencyKey) headers['Idempotency-Key'] = bookingData.idempotencyKey;
  const payload = Object.assign({}, bookingData);
  const resp = await httpRequest('/bookings', { method: 'POST', body: payload, headers });
  // normalize minimal contract
  return {
    providerBookingId: resp.id || resp.providerBookingId,
    status: resp.status || 'pending',
    createdAt: resp.createdAt || resp.created_at || new Date().toISOString(),
    metadata: resp.metadata || null
  };
}

async function updateBooking(providerBookingId, updateData) {
  if (useMock) return mock.updateBooking(providerBookingId, updateData);
  const resp = await httpRequest(`/bookings/${encodeURIComponent(providerBookingId)}`, { method: 'PUT', body: updateData });
  return {
    providerBookingId: resp.id || resp.providerBookingId || providerBookingId,
    status: resp.status || 'updated',
    updatedAt: resp.updatedAt || resp.updated_at || new Date().toISOString(),
    metadata: resp.metadata || null
  };
}

async function cancelBooking(providerBookingId, reason) {
  if (useMock) return mock.cancelBooking(providerBookingId, reason);
  // Many providers expose a cancel endpoint — POST /bookings/:id/cancel
  const resp = await httpRequest(`/bookings/${encodeURIComponent(providerBookingId)}/cancel`, { method: 'POST', body: { reason } });
  return {
    providerBookingId: resp.id || resp.providerBookingId || providerBookingId,
    status: resp.status || 'cancelled',
    cancelledAt: resp.cancelledAt || resp.cancelled_at || new Date().toISOString(),
    metadata: resp.metadata || null
  };
}

async function getAvailability(params) {
  if (useMock) return mock.getAvailability(params);
  const qs = new URLSearchParams();
  if (params.propertyId) qs.set('propertyId', params.propertyId);
  if (params.startDate) qs.set('startDate', params.startDate);
  if (params.endDate) qs.set('endDate', params.endDate);
  if (params.roomTypeIds && params.roomTypeIds.length) params.roomTypeIds.forEach(r => qs.append('roomTypeIds', r));
  const resp = await httpRequest(`/availability?${qs.toString()}`, { method: 'GET' });
  return resp;
}

async function pushRates(ratePayload) {
  if (useMock) return mock.pushRates(ratePayload);
  const resp = await httpRequest('/rates', { method: 'POST', body: ratePayload });
  return resp;
}

module.exports = { createBooking, updateBooking, cancelBooking, getAvailability, pushRates };
