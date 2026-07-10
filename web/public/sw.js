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
//   so a single bump invalidates everything at once. This is a manual bump
//   (no build step exists to inject a real content/commit hash) — content
//   inside ASSET_CACHE is additionally guarded by per-bucket entry-count
//   trimming (see ASSET_CACHE_MAX_ENTRIES) so unbounded growth across many
//   deploys — WITHOUT a CACHE_VERSION bump — can't silently exhaust the
//   origin's storage quota and evict the offline city data this SW exists
//   to protect.
// ASSET STRATEGY: Astro's own build output under /_astro/ is content-hashed
//   and immutable (filename changes if content changes), so it is safe to
//   CacheFirst forever within a bucket that is entry-count-capped. Anything
//   else matching the static-asset extensions (self-hosted fonts, /embed/*.js,
//   logo/og-image, etc.) has a STABLE, un-hashed URL — CacheFirst there would
//   mean a fixed bug/update never reaches a returning visitor until a manual
//   CACHE_VERSION bump, so those use StaleWhileRevalidate instead: serve the
//   cached copy instantly, but always refetch in the background and update
//   the cache for next time.
// NOT IN SCOPE: Web-push notifications (would need VAPID keys + a push
//   server to trigger prayer-time alerts — tracked as a future item, not
//   implemented here).
// REF: Wave-3 gap closure (2026-07) · PWA hardening pass (2026-07-10)

const CACHE_VERSION = 'v3';
const SHELL_CACHE = `praycalc-shell-${CACHE_VERSION}`;
const CITY_CACHE = `praycalc-city-${CACHE_VERSION}`;
const ASSET_CACHE = `praycalc-assets-${CACHE_VERSION}`;
const ALL_CACHES = [SHELL_CACHE, CITY_CACHE, ASSET_CACHE];

// Core shell routes — cached eagerly on install so the app has something to
// show offline even before the user visits a city page.
const SHELL_URLS = ['/', '/about', '/times'];

// Static-asset URL shapes. HASHED_ASSET_PATTERN identifies Astro's own
// content-hashed build output (e.g. /_astro/city-page.a1b2c3d4.js) — the
// filename itself changes on content change, so CacheFirst is always correct
// for it. Anything else matching STATIC_ASSET_PATTERN (fonts, /embed/*.js,
// logo/og-image, favicons, etc.) has a stable URL and needs revalidation.
const HASHED_ASSET_PATTERN = /^\/_astro\//;
const STATIC_ASSET_PATTERN = /\.(woff2?|ttf|otf|svg|png|jpg|jpeg|webp|gif|ico|css|js)$/;

// Caps on how many entries each cache bucket keeps. Each visited city's
// rendered response / each fetched asset is added on a successful fetch;
// without a cap, either bucket could grow unbounded across many deploys and
// browser visits, until the browser's storage-quota eviction wipes ALL
// caches at once (including the offline city data this SW exists to keep).
const CITY_CACHE_MAX_ENTRIES = 25;
const ASSET_CACHE_MAX_ENTRIES = 100;

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
  // Take control of already-open tabs immediately — combined with skipWaiting
  // above, a new deploy's SW activates and serves fresh content on the very
  // next fetch instead of waiting for a full reload of every open tab.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Static assets (fonts, icons, images, scripts, styles).
  if (STATIC_ASSET_PATTERN.test(url.pathname)) {
    if (HASHED_ASSET_PATTERN.test(url.pathname)) {
      // Content-hashed + immutable — CacheFirst is always correct.
      event.respondWith(cacheFirst(request, ASSET_CACHE, { trim: ASSET_CACHE_MAX_ENTRIES }));
    } else {
      // Stable URL (e.g. /embed/praycalc.js, /logo.png) — a fix/update to this
      // file must reach returning visitors without waiting for a manual
      // CACHE_VERSION bump, so revalidate in the background on every hit.
      event.respondWith(staleWhileRevalidate(request, ASSET_CACHE, { trim: ASSET_CACHE_MAX_ENTRIES }));
    }
    return;
  }

  // City pages (navigation requests, not root/shell) — NetworkFirst, caches
  // the rendered response so the same URL can be served offline later. This
  // is what makes "last-viewed city offline" work: the response IS the
  // server-computed prayer times HTML, cached verbatim.
  if (request.mode === 'navigate' && !SHELL_URLS.includes(url.pathname)) {
    event.respondWith(networkFirstWithFallback(request, CITY_CACHE, '/', { trim: CITY_CACHE_MAX_ENTRIES }));
    return;
  }

  // Shell pages — NetworkFirst, fall back to cache.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request, SHELL_CACHE, '/'));
    return;
  }
});

/** CacheFirst: serve from cache when present, else fetch + populate + (optionally) trim. */
async function cacheFirst(request, cacheName, opts = {}) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
    if (opts.trim) await trimCache(cache, opts.trim);
  }
  return response;
}

/**
 * StaleWhileRevalidate: serve the cached copy instantly if present (never
 * blocks on the network), while always kicking off a background refetch that
 * updates the cache for the next visit. Falls through to the network response
 * (or a 503) when nothing is cached yet, e.g. the very first hit.
 */
async function staleWhileRevalidate(request, cacheName, opts = {}) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkUpdate = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        if (opts.trim) await trimCache(cache, opts.trim);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) return cached;
  const networkResponse = await networkUpdate;
  return networkResponse ?? new Response('Offline', { status: 503 });
}

async function networkFirstWithFallback(request, cacheName, fallbackUrl, opts = {}) {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (opts.trim) await trimCache(cache, opts.trim);
      return response;
    }

    // A response WAS received (not a network-level failure) but it's an
    // error. For navigations, a 5xx means the backend/SSR render itself
    // failed (praycalc is output:'server' — every city page is a live
    // render) — this SW's stated purpose is that a returning user sees their
    // last-computed prayer times, not a blank/error page, so treat a 5xx
    // navigation the same as an offline/network failure and fall through to
    // the cache. Non-5xx statuses (e.g. a genuine 404) are returned as-is —
    // there is no reason to mask a real "not found" with stale content.
    if (request.mode === 'navigate' && response.status >= 500) {
      const cached = await caches.match(request);
      if (cached) return cached;
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
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
