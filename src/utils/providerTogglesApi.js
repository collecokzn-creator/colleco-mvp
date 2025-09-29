// Client for provider toggles (events aggregator enable/disable)
// Uses relative /api endpoints via Vite dev proxy

function authHeaders() {
  const token = import.meta.env.VITE_API_TOKEN || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getProviderToggles() {
  const res = await fetch(`/api/providers`, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch provider toggles (${res.status})`);
  const j = await res.json();
  // Backend has two shapes in codebase: { ok, providers } or raw array; normalize
  const list = Array.isArray(j) ? j : (Array.isArray(j.providers) ? j.providers : []);
  return list.map(p => ({ name: String(p.name||'').toLowerCase(), enabled: !!p.enabled }));
}

export async function updateProviderToggles(list){
  const payload = list.map(p => ({ name: String(p.name||'').toLowerCase(), enabled: !!p.enabled }));
  const res = await fetch(`/api/providers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update provider toggles (${res.status})`);
  const j = await res.json();
  const listOut = Array.isArray(j) ? j : (Array.isArray(j.providers) ? j.providers : []);
  return listOut.map(p => ({ name: String(p.name||'').toLowerCase(), enabled: !!p.enabled }));
}
