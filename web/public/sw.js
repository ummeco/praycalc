// PrayCalc service worker — vanilla JS, no build step required.
// Replaces sw.ts which incorrectly imported @serwist/next (a Next.js package).

const SHELL_CACHE = 'praycalc-shell-v1';
const CITY_CACHE = 'city-pages';
const ASSET_CACHE = 'static-assets';

const SHELL_URLS = ['/', '/about', '/times'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS))
  );
  // Activate immediately — don't wait for existing tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Remove stale shell caches from previous SW versions.
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('praycalc-shell-') && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Static assets (fonts, icons, images) — CacheFirst.
  if (/\.(woff2?|ttf|otf|svg|png|jpg|jpeg|webp|gif|ico|css|js)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // City pages (navigation requests, not root) — NetworkFirst with offline fallback.
  if (request.mode === 'navigate' && url.pathname !== '/') {
    event.respondWith(networkFirstWithFallback(request, CITY_CACHE, '/'));
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

async function networkFirstWithFallback(request, cacheName, fallbackUrl) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Last resort: serve the shell root so the user sees the location search.
    const fallback = await caches.match(fallbackUrl);
    return fallback ?? new Response('Offline', { status: 503 });
  }
}
