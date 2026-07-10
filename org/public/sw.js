// PrayCalc Docs service worker — vanilla JS, no build step required.
//
// PURPOSE: Minimal offline support for a fully static docs site
//   (org/ is output:'static'). Astro's own build output under /_astro/ is
//   content-hashed and immutable, so it is cached CacheFirst forever.
//   Doc pages (navigations) are cached NetworkFirst so a returning visitor
//   who has gone offline still sees the last version of a page they already
//   visited, instead of the browser's offline error page.
// CONSTRAINTS: Intentionally tiny — no Workbox/Serwist, no precache manifest,
//   no background sync. Online visitors ALWAYS get the live network response
//   for navigations; the cache is only ever consulted after a real fetch
//   failure, so this cannot serve stale docs to a visitor with connectivity.
//   Bump CACHE_VERSION on any change to the caching strategy so old cache
//   buckets are pruned on activate.
// NOT IN SCOPE: precaching every doc page on install (would require a build
//   step to enumerate routes) — pages are cached lazily as the visitor
//   browses, per the mirrored web/public/sw.js pattern this was adapted from.
// REF: PWA-02 (praycalc.org PWA polish)

const CACHE_VERSION = 'v1';
const PAGE_CACHE = `praycalc-org-pages-${CACHE_VERSION}`;
const ASSET_CACHE = `praycalc-org-assets-${CACHE_VERSION}`;
const ALL_CACHES = [PAGE_CACHE, ASSET_CACHE];

const PAGE_CACHE_MAX_ENTRIES = 60;
const ASSET_CACHE_MAX_ENTRIES = 100;

// Astro's own hashed build output — filename changes on content change, so
// CacheFirst is always correct and never goes stale.
const HASHED_ASSET_PATTERN = /^\/_astro\//;

self.addEventListener('install', () => {
  // Activate immediately — don't wait for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !ALL_CACHES.includes(k)).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  if (HASHED_ASSET_PATTERN.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE, ASSET_CACHE_MAX_ENTRIES));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, PAGE_CACHE, '/', PAGE_CACHE_MAX_ENTRIES));
  }
});

/** CacheFirst: serve from cache when present, else fetch + populate + trim. */
async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    await trimCache(cache, maxEntries);
  }
  return response;
}

/**
 * NetworkFirst: always try the network first so an online visitor never sees
 * stale docs. Only on a genuine fetch failure (offline) does it fall back to
 * whatever was last cached for this exact URL, then the site root.
 */
async function networkFirstWithFallback(request, cacheName, fallbackUrl, maxEntries) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      await trimCache(cache, maxEntries);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fallback = await caches.match(fallbackUrl);
    return fallback ?? new Response('Offline', { status: 503 });
  }
}

/** Evict oldest entries once a cache bucket exceeds maxEntries (FIFO via key insertion order). */
async function trimCache(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const excess = keys.length - maxEntries;
  for (let i = 0; i < excess; i++) {
    await cache.delete(keys[i]);
  }
}
