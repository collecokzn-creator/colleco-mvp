// Lightweight quotes API client with graceful fallback to localStorage-backed hooks
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '/api';

export async function getQuotes() {
  try {
    const res = await fetch(`${API_BASE}/quotes`);
    if (!res.ok) throw new Error('fetch_failed');
    const j = await res.json();
    return j.quotes || [];
  } catch (e) {
    // fallback: return empty to allow UI to use local state instead
    return [];
  }
}

export async function createQuote(payload) {
  try {
    const res = await fetch(`${API_BASE}/quotes`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) {
      const err = new Error('create_failed'); err.status = res.status; err.body = j; throw err;
    }
    return j.quote || j || null;
  } catch (e) {
    // If validation error (body present), rethrow for caller to handle
    if (e && e.body) throw e;
    // fallback: return the payload with a temporary id on network error
    const tmp = { ...payload, id: 'tmp_' + Math.random().toString(36).slice(2,8), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return tmp;
  }
}

export async function deleteQuote(id) {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete_failed');
    return true;
  } catch (e) {
    return false;
  }
}

export async function updateQuote(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) { const err = new Error('update_failed'); err.status = res.status; err.body = j; throw err; }
    return j.quote || null;
  } catch (e) {
    if (e && e.body) throw e;
    return null;
  }
}

export async function patchQuote(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) { const err = new Error('patch_failed'); err.status = res.status; err.body = j; throw err; }
    return j.quote || null;
  } catch (e) {
    if (e && e.body) throw e;
    return null;
  }
}

export default { getQuotes, createQuote, deleteQuote, updateQuote, patchQuote };
