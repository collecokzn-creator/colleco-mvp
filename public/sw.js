// Bumped to v22 – manual update messaging + explicit activation reason + safer old cache cleanup.
// Change log:
// v22: Added CLIENT_UPDATE_AVAILABLE broadcast when a new SW takes control & manual CHECK_FOR_UPDATE message.
// v21: Background sync stub & broadcast of itinerary sync results.
const STATIC_CACHE = 'colleco-static-v22';
const ITINERARY_JSON_PATH = '/assets/data/itinerary.json';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
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
    await cache.addAll(ASSETS);
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

  // Navigation requests: offline fallback
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        return fresh;
      } catch {
        const cache = await caches.open(STATIC_CACHE);
        const offline = await cache.match('/offline.html');
        return offline || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' }});
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
        if (resp.ok) return resp;
      } catch {}
      return new Response('', { status: 204 }); // empty placeholder keeps broken image icon away
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
      const cache = await caches.open(STATIC_CACHE);
      const cached = await cache.match(req);
      const network = fetch(req).then(resp => {
        cache.put(req, resp.clone()).catch(() => {});
        return resp;
      }).catch(() => undefined);
      return cached || network || fetch(req);
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
