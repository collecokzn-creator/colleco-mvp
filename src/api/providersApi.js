// Minimal client for providers verification API
const BASE = import.meta.env.VITE_API_BASE || '';
const TOKEN = import.meta.env.VITE_API_TOKEN || '';
export const isApiEnabled = !!import.meta.env.VITE_API_BASE;

function authHeaders() {
	return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

export async function listProviders() {
	const res = await fetch(`${BASE}/api/providers`, { headers: authHeaders() });
	if (!res.ok) throw new Error('Failed to list providers');
	const data = await res.json();
	// server returns { ok: true, providers: [...] } — normalize to an array
	if (Array.isArray(data)) return data;
	if (data && Array.isArray(data.providers)) return data.providers;
	return [];
}

export async function uploadDocument({ providerId, name, docType, fileName, fileSize, expiresAt }) {
	const res = await fetch(`${BASE}/api/providers/upload`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...authHeaders() },
		body: JSON.stringify({ providerId, name, docType, fileName, fileSize, expiresAt }),
	});
	if (!res.ok) throw new Error('Failed to upload document');
	return res.json();
}

export async function verifyProvider(providerId, verified = true) {
	const res = await fetch(`${BASE}/api/providers/verify`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', ...authHeaders() },
		body: JSON.stringify({ providerId, verified }),
	});
	if (!res.ok) throw new Error('Failed to verify provider');
	return res.json();
}
