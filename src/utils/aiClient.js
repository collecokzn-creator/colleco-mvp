// AI client utility wrapping REST + SSE streaming itinerary generation.
// Provides two main functions:
//  - generateItinerary(prompt): single shot POST returning parsed data
//  - streamItinerary(prompt, { onEvent, onError, onDone, signal }) : SSE phased stream

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';
function withAuth(headers = {}){
  const h = { ...headers };
  if (API_TOKEN) h['Authorization'] = `Bearer ${API_TOKEN}`;
  return h;
}

export async function generateItinerary(prompt) {
  const res = await fetch(`${API_BASE}/api/ai/itinerary`, {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) {
    let err = 'Request failed';
    try { const j = await res.json(); err = j.error || err; } catch {}
    throw new Error(err);
  }
  const data = await res.json();
  return data.data;
}

export function streamItinerary(prompt, { onEvent, onError, onDone, signal } = {}) {
  const url = new URL(`${API_BASE}/api/ai/itinerary/stream`);
  url.searchParams.set('prompt', prompt);
  const ctrl = new AbortController();
  if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });

  fetch(url.toString(), { signal: ctrl.signal, headers: withAuth({ 'Accept': 'text/event-stream' }) })
    .then(async (res) => {
      if (!res.ok) {
        let err = 'Stream request failed';
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
      onError && onError(err);
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
