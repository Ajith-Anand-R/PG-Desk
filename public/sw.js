const CACHE_VERSION = 'pgdesk-v8';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const FONT_CACHE = `${CACHE_VERSION}-fonts`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/app',
  '/manifest.json',
  '/logo.png'
];

const MAX_DYNAMIC_CACHE = 80;
const MAX_IMAGE_CACHE = 60;
const MAX_API_CACHE = 30;
const API_CACHE_TTL = 3 * 60 * 1000; // 3 minutes (shorter for admin app)

// ── PG Desk is the ADMIN app — be extremely conservative with caching ──
// Most admin data (tenants, payments, beds, visitors, gate requests, complaints)
// MUST be fresh. Only cache truly read-mostly data.
const CACHEABLE_TABLES = [
  'notices',
  'menu_days',
];

function isCacheableApiRequest(url) {
  const pathname = url.pathname;
  return CACHEABLE_TABLES.some(table => pathname.includes(`/rest/v1/${table}`));
}

// ── Install: pre-cache critical static assets ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: purge old caches ──
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, DYNAMIC_CACHE, FONT_CACHE, IMAGE_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (!allowedCaches.includes(key)) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ── Trim cache to max entries (FIFO) ──
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// ── Check if API cache entry is still fresh ──
function isApiCacheFresh(response) {
  const cachedAt = response.headers.get('sw-cached-at');
  if (!cachedAt) return false;
  return (Date.now() - parseInt(cachedAt, 10)) < API_CACHE_TTL;
}

// ── Clone response with timestamp header ──
async function stampResponse(response) {
  const body = await response.blob();
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// ── Fetch handler ──
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests entirely
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Skip localhost — no caching during development
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    return;
  }

  // ── Strategy 1: Navigation — Network-first with offline fallback ──
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return caches.match('/app').then((appShell) => appShell || caches.match('/'));
        }
      })()
    );
    return;
  }

  // Skip Next.js RSC data fetches
  if (url.pathname.startsWith('/_next/data/') || url.searchParams.has('_rsc')) {
    return;
  }

  // ── Strategy 2: Supabase API — ONLY notices & menu_days (admin needs fresh data for everything else) ──
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/rest/v1/') && isCacheableApiRequest(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(event.request);

        if (cached && isApiCacheFresh(cached)) {
          fetch(event.request).then(async (response) => {
            if (response && response.status === 200) {
              const stamped = await stampResponse(response);
              cache.put(event.request, stamped);
              trimCache(API_CACHE, MAX_API_CACHE);
            }
          }).catch(() => {});
          return cached;
        }

        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const stamped = await stampResponse(response);
            cache.put(event.request, stamped);
            trimCache(API_CACHE, MAX_API_CACHE);
          }
          return response;
        } catch {
          return cached || new Response(JSON.stringify({ error: 'offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      })()
    );
    return;
  }

  // ── Strategy 3: Supabase Storage images — Network-first with cache fallback ──
  // Network-first because admin may view updated tenant photos, complaint images, etc.
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/v1/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(event.request);
          if (response && response.status === 200) {
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(event.request, response.clone());
            trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
          }
          return response;
        } catch {
          const cached = await caches.match(event.request);
          return cached || new Response('', { status: 503 });
        }
      })()
    );
    return;
  }

  // ── Strategy 4: Google Fonts — Cache-first, long-lived ──
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 5: Next.js static assets — Cache-first (hashed, immutable) ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 6: Local images — Cache-first with eviction ──
  if (event.request.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(event.request).then((cached) => {
          if (cached) return cached;
          return fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE);
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Strategy 7: Stale-while-revalidate for everything else (JS chunks, CSS) ──
  event.respondWith(
    caches.open(DYNAMIC_CACHE).then((cache) =>
      cache.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
              trimCache(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE);
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
