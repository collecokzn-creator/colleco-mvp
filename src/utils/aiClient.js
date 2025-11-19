// AI client utility wrapping REST + SSE streaming itinerary generation.
// Provides two main functions:
//  - generateItinerary(prompt): single shot POST returning parsed data
//  - streamItinerary(prompt, { onEvent, onError, onDone, signal }) : SSE phased stream

// Prefer build-time env, but allow a runtime override during E2E tests.
const BUILD_API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
function getApiBase() {
  try {
    if (typeof window !== 'undefined' && window.__E2E__) {
      // If the test harness provided an explicit API base, use it. Otherwise
      // use same-origin to route requests through the preview server ("/api/...").
      return window.__E2E_API_BASE != null ? window.__E2E_API_BASE : '';
    }
  } catch (e) {}
  return BUILD_API_BASE;
}
let API_BASE = getApiBase();
// If we're deployed (non-localhost) but API_BASE points to localhost, fall back to same-origin.
try {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && /localhost:\d+$/i.test(API_BASE)) {
      API_BASE = ''; // use relative /api/* endpoints (expect reverse proxy or same server)
    }
  }
} catch {}
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';
function withAuth(headers = {}){
  const h = { ...headers };
  if (API_TOKEN) h['Authorization'] = `Bearer ${API_TOKEN}`;
  return h;
}

export async function generateItinerary(prompt) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/itinerary`, {
      method: 'POST',
      headers: withAuth({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) {
      let err = `Request failed (${res.status})`;
      try { const j = await res.json(); err = j.error || err; } catch {}
      throw new Error(err);
    }
    const data = await res.json();
    return data.data;
  } catch (e) {
    if (e.name === 'TypeError') {
      // Network errors often surface as TypeError in fetch
      throw new Error('Network error – verify API is reachable');
    }
    throw e;
  }
}

export function streamItinerary(prompt, { onEvent, onError, onDone, signal } = {}) {
  const url = new URL(`${API_BASE}/api/ai/itinerary/stream`);
  url.searchParams.set('prompt', prompt);
  const ctrl = new AbortController();
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });

  fetch(url.toString(), { signal: ctrl.signal, headers: withAuth({ 'Accept': 'text/event-stream' }) })
    .then(async (res) => {
      if (!res.ok) {
        let err = `Stream request failed (${res.status})`;
        try { const j = await res.json(); err = j.error || err; } catch {}
        throw new Error(err);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
  // Stream reader loop
  // eslint-disable-next-line no-constant-condition
  while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          const chunk = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 2);
          if (!chunk) continue;
          const lines = chunk.split('\n');
            let event = 'message';
            let data = '';
            for (const ln of lines) {
              if (ln.startsWith('event:')) event = ln.slice(6).trim();
              else if (ln.startsWith('data:')) data += ln.slice(5).trim();
            }
            if (data) {
              try {
                const parsed = JSON.parse(data);
                onEvent && onEvent({ event, data: parsed });
                if (event === 'pricing') {
                  // Dispatch custom event so layout can surface a global toast shortcut
                  try { window.dispatchEvent(new CustomEvent('colleco:draftPricing',{ detail:{ phase:'pricing' } })); } catch {}
                }
                if (event === 'done') {
                  onDone && onDone();
                }
              } catch (e) {
                // ignore JSON parse errors per event
              }
            }
        }
      }
      onDone && onDone();
    })
    .catch(err => {
      if (ctrl.signal.aborted) return; // ignore abort errors
      if (err && err.name === 'TypeError') {
        onError && onError(new Error('Network error – streaming endpoint unreachable'));
      } else {
        onError && onError(err);
      }
    });

  return { cancel: () => ctrl.abort() };
}

export async function refineItinerary(prompt, instructions){
  const res = await fetch(`${API_BASE}/api/ai/itinerary/refine`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt, instructions })
  });
  if(!res.ok){
    let err = 'Refine failed';
    try { const j = await res.json(); err = j.error || err; } catch{}
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}

// New: parse flight intent from natural language
export async function parseFlightIntent(prompt){
  const res = await fetch(`${API_BASE}/api/ai/flight`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt })
  });
  if(!res.ok){
    let err = 'Flight intent failed';
    try { const j = await res.json(); err = j.error || err; } catch{}
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}

// Unified parse intent
export async function parseIntent(prompt){
  const res = await fetch(`${API_BASE}/api/ai/intent`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt })
  });
  if(!res.ok){
    let err = 'Intent parse failed';
    try { const j = await res.json(); err = j.error || err; } catch{}
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}
