// Bumped to v23 – cache manifest and force update to flush stale HTML.
// Change log:
// v23: Cache manifest.webmanifest; force new install to help purge stale index.html in clients.
// v22: Added CLIENT_UPDATE_AVAILABLE broadcast when a new SW takes control & manual CHECK_FOR_UPDATE message.
// v21: Background sync stub & broadcast of itinerary sync results.
const STATIC_CACHE = 'colleco-static-v23';
const ITINERARY_JSON_PATH = '/assets/data/itinerary.json';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/offline.html',
  '/manifest.webmanifest',
  '/bookings',
  '/itinerary',
  ITINERARY_JSON_PATH,
  '/assets/itinerary/hike.svg',
  '/assets/itinerary/meal.svg',
  '/assets/itinerary/lodging.svg',
  '/assets/itinerary/custom.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // Attempt to load a generated precache manifest from the built dist (post-build step)
    try {
      // Prefer a small 'critical' manifest (smaller precache); fall back to the full manifest.
      let urls = null;
      try {
        const resp = await fetch('/sw-manifest.critical.json');
        if (resp && resp.ok) urls = await resp.json();
      } catch (e) {}
      if (!urls) {
        try {
          const resp2 = await fetch('/sw-manifest.json');
          if (resp2 && resp2.ok) urls = await resp2.json();
        } catch (e) {}
      }
      if (Array.isArray(urls) && urls.length) {
        // Merge the static ASSETS with generated urls (dedupe)
        const toAdd = Array.from(new Set([...ASSETS, ...urls]));
        await cache.addAll(toAdd).catch(() => {
          // If some entries fail, fall back to adding only ASSETS
          return cache.addAll(ASSETS).catch(()=>{});
        });
        return;
      }
    } catch (e) {
      // ignore and fall back
    }
    await cache.addAll(ASSETS).catch(()=>{});
  })());
  self.skipWaiting?.();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Guard: only delete prefixed caches to avoid nuking unrelated data
    const prefix = 'colleco-static-';
    await Promise.all(keys.filter(k => k.startsWith(prefix) && k !== STATIC_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
    // Notify clients a new service worker is active
    const clis = await self.clients.matchAll({ includeUncontrolled: true });
    for(const c of clis){ try { c.postMessage({ type:'CLIENT_UPDATE_AVAILABLE', version: STATIC_CACHE }); } catch{} }
  })());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  switch(event.data.type){
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    case 'CLEAR_ITINERARY_CACHE':
      event.waitUntil((async () => {
        const cache = await caches.open(STATIC_CACHE);
        await cache.delete(ITINERARY_JSON_PATH);
      })());
      break;
    case 'CHECK_FOR_UPDATE':
      // Trigger a no-op fetch of root to encourage browser update check; then ping clients
      event.waitUntil((async () => {
        try { await fetch('/', { cache: 'no-store' }); } catch {}
        const clis = await self.clients.matchAll({ includeUncontrolled: true });
        for(const c of clis){ try { c.postMessage({ type:'UPDATE_CHECK_COMPLETE', version: STATIC_CACHE }); } catch{} }
      })());
      break;
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Manifest: network-first with cache fallback; generate minimal fallback if both fail
  if (url.pathname === '/manifest.webmanifest') {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        const fresh = await fetch(req, { cache: 'no-cache' });
        if (fresh && fresh.ok) { cache.put(req, fresh.clone()).catch(() => {}); return fresh; }
      } catch {}
      const cached = await cache.match(req);
      if (cached) return cached;
      const fallback = {
        name: 'CollEco Travel', short_name: 'CollEco', start_url: '/', display: 'standalone', background_color: '#f9f6f2', theme_color: '#e86f00', icons: []
      };
      return new Response(JSON.stringify(fallback), { status: 200, headers: { 'Content-Type': 'application/manifest+json' } });
    })());
    return;
  }


  // Navigation requests: offline fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // Try network first to get the freshest HTML
        const fresh = await fetch(req);
        return fresh;
      } catch (e) {
        // If network fails, attempt serving the cached index.html (SPA shell)
        try {
          const cache = await caches.open(STATIC_CACHE);
          const index = await cache.match('/index.html');
          if (index) return index;
          const offline = await cache.match('/offline.html');
          if (offline) return offline;
        } catch (inner) {
          // fall through to final fallback
        }
        // Final fallback: return a lightweight offline response (avoid 503 for navigations)
        return new Response('<!doctype html><meta charset="utf-8"><title>Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"><h1>Offline</h1><p>The application is offline.</p>', { status: 200, headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Favicon: prefer cache-first, but never return 503 for a missing favicon
  if (url.pathname === '/favicon.ico') {
    event.respondWith((async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        // attempt network and cache result
        try {
          const resp = await fetch(req);
          if (resp && resp.ok) { cache.put(req, resp.clone()).catch(() => {}); return resp; }
        } catch (e) {
          // network failed
        }
        // Return 204 (no content) instead of 503 to avoid noisy console errors for favicon
        return new Response(null, { status: 204 });
      } catch (outer) {
        return new Response(null, { status: 204 });
      }
    })());
    return;
  }

  // Static core assets: cache-first
  if (ASSETS.includes(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      return cached || fetch(req);
    })());
    return;
  }

  // Branding images (may not exist yet): try network, fall back to placeholder response
  if (url.pathname.startsWith('/assets/') && (url.pathname.includes('colleco-logo') || url.pathname.toLowerCase().includes('globe'))) {
    event.respondWith((async () => {
      try {
        const resp = await fetch(req);
        if (resp && resp.ok) return resp;
      } catch {}
      // 204 responses must not have a body. Return an empty response with 204 and no body.
      return new Response(null, { status: 204 });
    })());
    return;
  }

  // Itinerary JSON: network-first with cache fallback for offline freshness
  if (url.pathname === ITINERARY_JSON_PATH) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC_CACHE);
      try {
        const fresh = await fetch(req);
        cache.put(req, fresh.clone()).catch(() => {});
        return fresh;
      } catch {
        const cached = await cache.match(req);
        return cached || new Response(JSON.stringify({ items: [], meta: { error: 'offline' } }), { headers: { 'Content-Type': 'application/json' }, status: 200 });
      }
    })());
    return;
  }

  // Other GET requests: stale-while-revalidate
  if (req.method === 'GET') {
    event.respondWith((async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(req);
        if (cached) {
          // Trigger background update but don't block the response
          fetch(req).then(resp => { if (resp && resp.ok) cache.put(req, resp.clone()).catch(() => {}); }).catch(() => {});
          return cached;
        }
        // No cache: attempt network and return a sensible fallback on error
        try {
          const resp = await fetch(req);
          if (resp && resp.ok) {
            cache.put(req, resp.clone()).catch(() => {});
            return resp;
          }
          return new Response('Network error', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        } catch (e) {
          return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        }
      } catch (outerErr) {
        // As a last resort ensure we always return a Response object
        return new Response('Service Worker Error', { status: 500, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
  }
});

// ------------------------------
// Background / Periodic Sync Stub
// Attempts to refresh itinerary.json in the background and broadcast a lightweight hash
// so clients can decide if they should prompt user (full change handling implemented separately).

async function syncItinerary() {
  try {
    const resp = await fetch(`${ITINERARY_JSON_PATH}?bg=1`, { cache: 'no-cache' });
    if (!resp.ok) return;
    const text = await resp.clone().text();
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(ITINERARY_JSON_PATH, resp);
    const hash = simpleHash(text);
    await broadcastMessage({ type: 'ITINERARY_SYNC_RESULT', hash, ts: Date.now() });
  } catch (e) {
    // Silent failure – background sync is opportunistic
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'itinerary-sync') {
    event.waitUntil(syncItinerary());
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'itinerary-sync') {
    event.waitUntil(syncItinerary());
  }
});

async function broadcastMessage(msg) {
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    try { client.postMessage(msg); } catch {}
  }
}

function simpleHash(str) {
  // Simple 32-bit hash (deterministic, not cryptographic)
  let h = 0, i = 0, len = str.length;
  while (i < len) {
    h = (Math.imul(31, h) + str.charCodeAt(i++)) | 0;
  }
  return (h >>> 0).toString(16);
}
