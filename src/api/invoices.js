// Lightweight invoices API client modeled after quotes client
const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '/api';

export async function getInvoices() {
  try {
    const res = await fetch(`${API_BASE}/invoices`);
    if (!res.ok) throw new Error('fetch_failed');
    const j = await res.json();
    return j.invoices || [];
  } catch (e) {
    return [];
  }
}

export async function createInvoice(payload) {
  try {
    const res = await fetch(`${API_BASE}/invoices`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) { const err = new Error('create_failed'); err.status = res.status; err.body = j; throw err; }
    return j.invoice || j || null;
  } catch (e) {
    if (e && e.body) throw e;
    const tmp = { ...payload, id: 'tmp_' + Math.random().toString(36).slice(2,8), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return tmp;
  }
}

export async function deleteInvoice(id) {
  try {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('delete_failed');
    return true;
  } catch (e) { return false; }
}

export async function updateInvoice(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) { const err = new Error('update_failed'); err.status = res.status; err.body = j; throw err; }
    return j.invoice || null;
  } catch (e) { if (e && e.body) throw e; return null; }
}

export async function patchInvoice(id, patch) {
  try {
    const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(patch) });
    const j = await res.json().catch(()=>null);
    if (!res.ok) { const err = new Error('patch_failed'); err.status = res.status; err.body = j; throw err; }
    return j.invoice || null;
  } catch (e) { if (e && e.body) throw e; return null; }
}

export default { getInvoices, createInvoice, deleteInvoice, updateInvoice, patchInvoice };