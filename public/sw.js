/* global clients */
// Bumped to v25 – Added mobile push notification support
// Change log:
// v25: Mobile push notifications with vibration, badge, custom icons
// v24: Force cache clear to resolve dynamic module import failures.
// v23: Cache manifest.webmanifest; force new install to help purge stale index.html in clients.
// v22: Added CLIENT_UPDATE_AVAILABLE broadcast when a new SW takes control & manual CHECK_FOR_UPDATE message.
// v21: Background sync stub & broadcast of itinerary sync results.
const STATIC_CACHE = 'colleco-static-v25';
const ITINERARY_JSON_PATH = '/assets/data/itinerary.json';
const ASSETS = [
  '/',
  '/index.html',
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
// Push Notification Handlers for Mobile & Desktop
// Handles incoming push notifications with mobile-optimized features:
// - Vibration patterns
// - Badge updates
// - CollEco logo icon
// - Action buttons
// - Silent notifications for background updates

self.addEventListener('push', (event) => {
  let data = {
    title: 'CollEco',
    body: 'You have a new notification',
    icon: '/assets/icons/colleco-logo-192.png',
    badge: '/assets/icons/colleco-logo-72.png',
    vibrate: [200, 100, 200], // Vibration pattern: 200ms on, 100ms off, 200ms on
    tag: 'colleco-notification',
    requireInteraction: false,
    silent: false
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = { ...data, ...payload };
    }
  } catch (e) {
    console.error('Push data parse error:', e);
  }

  // Customize vibration and sound based on notification type
  const vibrationPatterns = {
    message: [200, 100, 200], // Quick double ping
    booking: [300, 100, 300, 100, 300], // Triple ping for important bookings
    payment: [500, 200, 500], // Longer ping for payments
    alert: [100, 50, 100, 50, 100, 50, 100], // Urgent rapid pattern
    system: [200] // Single short ping
  };

  if (data.type && vibrationPatterns[data.type]) {
    data.vibrate = vibrationPatterns[data.type];
  }

  // Add CollEco branding
  data.icon = data.icon || '/assets/icons/colleco-logo-192.png';
  data.badge = data.badge || '/assets/icons/colleco-logo-72.png';

  // Add action buttons for interactive notifications
  const actions = [];
  
  if (data.type === 'message') {
    actions.push(
      { action: 'reply', title: '💬 Reply', icon: '/assets/icons/colleco-logo-72.png' },
      { action: 'view', title: '👁️ View', icon: '/assets/icons/colleco-logo-72.png' }
    );
  } else if (data.type === 'booking') {
    actions.push(
      { action: 'view', title: '📋 View Booking', icon: '/assets/icons/colleco-logo-72.png' },
      { action: 'dismiss', title: '✓ OK', icon: '/assets/icons/colleco-logo-72.png' }
    );
  } else if (data.type === 'quote') {
    actions.push(
      { action: 'view', title: '📄 View Quote', icon: '/assets/icons/colleco-logo-72.png' },
      { action: 'dismiss', title: '✓ OK', icon: '/assets/icons/colleco-logo-72.png' }
    );
  } else if (data.type === 'payment') {
    actions.push(
      { action: 'view', title: '💰 View Payment', icon: '/assets/icons/colleco-logo-72.png' }
    );
  }

  if (actions.length > 0) {
    data.actions = actions;
  }

  // Update badge count (for mobile home screen icon)
  if (data.badge && 'setAppBadge' in navigator) {
    navigator.setAppBadge(data.unreadCount || 1).catch(() => {});
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      vibrate: data.vibrate,
      tag: data.tag || 'colleco-notification',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      actions: data.actions || [],
      data: {
        url: data.url || '/',
        type: data.type,
        id: data.id,
        timestamp: Date.now()
      },
      // Mobile-specific optimizations
      renotify: true, // Re-alert user if same tag
      timestamp: Date.now()
    })
  );
});

// Handle notification click (open app to specific page)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  const notificationType = event.notification.data?.type;
  const notificationId = event.notification.data?.id;

  // Handle action button clicks
  if (event.action === 'reply') {
    event.waitUntil(
      clients.openWindow(`/messages?reply=${notificationId}`)
    );
    return;
  } else if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(urlToOpen)
    );
    return;
  } else if (event.action === 'dismiss') {
    // Just close, already handled above
    return;
  }

  // Default click behavior: focus existing window or open new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it and navigate
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              url: urlToOpen,
              notificationType,
              notificationId
            });
            return client.focus();
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );

  // Clear badge on notification click
  if ('clearAppBadge' in navigator) {
    navigator.clearAppBadge().catch(() => {});
  }
});

// Handle notification close (track dismissed notifications)
self.addEventListener('notificationclose', (event) => {
  const notificationData = event.notification.data;
  
  // Track dismissal analytics (send to backend)
  event.waitUntil(
    fetch('/api/notifications/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'dismissed',
        notificationId: notificationData?.id,
        type: notificationData?.type,
        timestamp: Date.now()
      })
    }).catch(() => {}) // Silent fail for analytics
  );
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
