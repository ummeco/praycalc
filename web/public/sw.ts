import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import { Serwist } from "serwist";

// Tell TypeScript that the service worker global scope has `__SW_MANIFEST`
// injected by Serwist at build time.
declare global {
  interface ServiceWorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // ─── City / prayer page HTML (NetworkFirst, 24h stale) ────────────────────
    // Matches /[country]/[city] and /[...slug] city pages.
    {
      matcher: ({ request, url }) =>
        request.mode === "navigate" && url.pathname !== "/",
      handler: new NetworkFirst({
        cacheName: "city-pages",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Only cache successful HTML responses.
              if (response && response.status === 200) return response;
              return null;
            },
          },
        ],
        networkTimeoutSeconds: 5,
      }),
    },

    // ─── Prayer API responses (StaleWhileRevalidate, 24h) ────────────────────
    // Matches /api/prayers/* — city-specific prayer time JSON.
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new StaleWhileRevalidate({
        cacheName: "prayer-api",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) return response;
              return null;
            },
          },
        ],
      }),
    },

    // ─── Static assets: fonts, icons, images (CacheFirst, 30 days) ───────────
    {
      matcher: ({ url }) =>
        /\.(woff2?|ttf|otf|eot|svg|png|jpg|jpeg|webp|gif|ico)$/.test(
          url.pathname,
        ),
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) return response;
              return null;
            },
          },
        ],
      }),
    },

    // ─── Default next.js runtime cache (JS chunks, CSS, etc.) ────────────────
    ...defaultCache,
  ],
  fallbacks: {
    // If a city page is requested offline and not in cache, fall back to
    // the root page (which renders a location search form).
    entries: [
      {
        url: "/",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();
