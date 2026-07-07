// PrayCalc service worker — vanilla JS, no build step required.
// Replaces sw.ts which incorrectly imported @serwist/next (a Next.js package).
//
// PURPOSE: Offline-first PWA shell for a server-rendered (SSR) app. Prayer
//   times are computed server-side per request, so "offline support" here
//   means caching the actual rendered HTML response for the shell pages and
//   for every city page the user visits — a returning offline user sees the
//   last-computed times for their last-viewed city(ies), not a blank error.
// CONSTRAINTS: Hand-written, intentionally small (no Workbox/Serwist). Bump
//   CACHE_VERSION on any change to the caching strategy so old caches are
//   pruned on activate — versions are shared across all three cache buckets
//   so a single bump invalidates everything at once.
// NOT IN SCOPE: Web-push notifications (would need VAPID keys + a push
//   server to trigger prayer-time alerts — tracked as a future item, not
//   implemented here).
// REF: Wave-3 gap closure (2026-07)

const CACHE_VERSION = 'v2';
const SHELL_CACHE = `praycalc-shell-${CACHE_VERSION}`;
const CITY_CACHE = `praycalc-city-${CACHE_VERSION}`;
const ASSET_CACHE = `praycalc-assets-${CACHE_VERSION}`;
const ALL_CACHES = [SHELL_CACHE, CITY_CACHE, ASSET_CACHE];

// Core shell routes — cached eagerly on install so the app has something to
// show offline even before the user visits a city page.
const SHELL_URLS = ['/', '/about', '/times'];

// Cap on how many distinct city pages we keep cached. Each visited city's
// rendered response is cached on NetworkFirst success (see fetch handler);
// without a cap a heavy multi-city user could grow this unbounded.
const CITY_CACHE_MAX_ENTRIES = 25;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(async (cache) => {
      // Cache shell routes individually rather than cache.addAll() — addAll()
      // rejects the ENTIRE install if any single URL 404s/fails, which would
      // silently leave the SW with no offline shell at all. Best-effort per URL
      // instead: one bad route shouldn't sink the whole install.
      await Promise.all(
        SHELL_URLS.map((url) =>
          fetch(url)
            .then((res) => (res.ok ? cache.put(url, res) : undefined))
            .catch(() => {
              // Offline install or route unavailable — skip, not fatal.
            })
        )
      );
    })
  );
  // Activate immediately — don't wait for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove any cache bucket from a previous SW version (any of the three
  // prefixes, not just the shell — CACHE_VERSION bump invalidates all).
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => !ALL_CACHES.includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Static assets (fonts, icons, images) — CacheFirst.
  if (/\.(woff2?|ttf|otf|svg|png|jpg|jpeg|webp|gif|ico|css|js)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // City pages (navigation requests, not root/shell) — NetworkFirst, caches
  // the rendered response so the same URL can be served offline later. This
  // is what makes "last-viewed city offline" work: the response IS the
  // server-computed prayer times HTML, cached verbatim.
  if (request.mode === 'navigate' && !SHELL_URLS.includes(url.pathname)) {
    event.respondWith(networkFirstWithFallback(request, CITY_CACHE, '/', { trim: true }));
    return;
  }

  // Shell pages — NetworkFirst, fall back to cache.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, SHELL_CACHE, '/'));
    return;
  }
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstWithFallback(request, cacheName, fallbackUrl, opts = {}) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (opts.trim) await trimCache(cache, CITY_CACHE_MAX_ENTRIES);
    }
    return response;
  } catch {
    // Offline (or network error) — serve the last cached response for THIS
    // exact URL if we have one (e.g. the user's last-viewed city), so they
    // see their own last-computed prayer times rather than a generic page.
    const cached = await caches.match(request);
    if (cached) return cached;
    // Never visited this URL while online: fall back to the shell root so
    // the user can at least reach the location search.
    const fallback = await caches.match(fallbackUrl);
    return fallback ?? new Response('Offline', { status: 503 });
  }
}

/** Evict oldest entries once a cache bucket exceeds maxEntries (simple FIFO via key insertion order). */
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}
