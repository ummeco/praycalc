import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

/**
 * sw.test.ts — functional test for public/sw.js (hand-written PWA service worker).
 *
 * PURPOSE: sw.js is plain script (no imports/exports, lives outside src/) that
 *   registers global `self` event listeners. This test loads the real source
 *   into a minimal mocked ServiceWorkerGlobalScope (self/caches/fetch) and
 *   drives the actual install/activate/fetch listeners it registers — not a
 *   reimplementation of the caching logic, the real file under test.
 * COVERS: cache-version bucket naming, install caching the shell URLs,
 *   activate pruning stale cache buckets, city-page NetworkFirst caching +
 *   offline fallback to the last-cached response for that exact URL, and the
 *   CITY_CACHE_MAX_ENTRIES eviction cap.
 * REF: Wave-3 gap closure (2026-07)
 */

const SW_SOURCE = fs.readFileSync(
  path.resolve(__dirname, "../../public/sw.js"),
  "utf-8",
);

/** In-memory Cache/CacheStorage mock sufficient for sw.js's usage surface. */
function createCacheStorage() {
  const buckets = new Map<string, Map<string, Response>>();

  function makeCache(name: string) {
    if (!buckets.has(name)) buckets.set(name, new Map());
    const store = buckets.get(name)!;
    return {
      put: async (req: Request | string, res: Response) => {
        const key = typeof req === "string" ? req : req.url;
        store.set(key, res);
      },
      match: async (req: Request | string) => {
        const key = typeof req === "string" ? req : req.url;
        return store.get(key);
      },
      keys: async () => Array.from(store.keys()).map((k) => ({ url: k })),
      delete: async (req: Request | string) => {
        const key = typeof req === "string" ? req : req.url;
        return store.delete(key);
      },
    };
  }

  return {
    open: async (name: string) => makeCache(name),
    match: async (req: Request | string) => {
      const key = typeof req === "string" ? req : req.url;
      for (const store of buckets.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    },
    keys: async () => Array.from(buckets.keys()),
    delete: async (name: string) => buckets.delete(name),
    _buckets: buckets,
  };
}

interface SwTestContext {
  listeners: Record<string, (event: unknown) => unknown>;
  caches: ReturnType<typeof createCacheStorage>;
  fetchMock: ReturnType<typeof vi.fn>;
  self: Record<string, unknown>;
}

function loadServiceWorker(fetchImpl: (req: Request) => Promise<Response>): SwTestContext {
  const listeners: Record<string, (event: unknown) => unknown> = {};
  const caches = createCacheStorage();
  const fetchMock = vi.fn(fetchImpl);

  const selfObj: Record<string, unknown> = {
    addEventListener: (type: string, handler: (event: unknown) => unknown) => {
      listeners[type] = handler;
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    location: { origin: "https://praycalc.com" },
  };

  const sandbox = {
    self: selfObj,
    caches,
    fetch: fetchMock,
    Response,
    URL,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(SW_SOURCE, sandbox, { filename: "sw.js" });

  return { listeners, caches, fetchMock, self: selfObj };
}

/** Minimal FetchEvent stand-in: captures respondWith()'s promise and waitUntil()'s promise. */
function fireEvent(
  ctx: SwTestContext,
  type: string,
  extra: Record<string, unknown> = {},
): { waitUntilPromise: Promise<unknown> | undefined; respondWithPromise: Promise<unknown> | undefined } {
  let waitUntilPromise: Promise<unknown> | undefined;
  let respondWithPromise: Promise<unknown> | undefined;
  const event = {
    waitUntil: (p: Promise<unknown>) => {
      waitUntilPromise = p;
    },
    respondWith: (p: Promise<unknown>) => {
      respondWithPromise = p;
    },
    ...extra,
  };
  ctx.listeners[type]?.(event);
  return { waitUntilPromise, respondWithPromise };
}

function navigateRequest(url: string): Request {
  return new Request(url, { method: "GET" });
}
Object.defineProperty(Request.prototype, "mode", {
  get() {
    return (this as { _mode?: string })._mode ?? "navigate";
  },
  configurable: true,
});

describe("public/sw.js — service worker", () => {
  it("cache bucket names carry the shared CACHE_VERSION", () => {
    expect(SW_SOURCE).toMatch(/const CACHE_VERSION = ['"]v\d+['"]/);
    expect(SW_SOURCE).toMatch(/praycalc-shell-\$\{CACHE_VERSION\}/);
    expect(SW_SOURCE).toMatch(/praycalc-city-\$\{CACHE_VERSION\}/);
    expect(SW_SOURCE).toMatch(/praycalc-assets-\$\{CACHE_VERSION\}/);
  });

  it("install caches every shell URL individually (best-effort, not addAll)", async () => {
    const ctx = loadServiceWorker(async (req) => {
      const url = typeof req === "string" ? req : (req as Request).url;
      return new Response(`shell:${url}`, { status: 200 });
    });
    const { waitUntilPromise } = fireEvent(ctx, "install");
    await waitUntilPromise;

    const shellCache = await ctx.caches.open("praycalc-shell-v2");
    const cachedRoot = await shellCache.match("/");
    const cachedAbout = await shellCache.match("/about");
    const cachedTimes = await shellCache.match("/times");
    expect(cachedRoot).toBeDefined();
    expect(cachedAbout).toBeDefined();
    expect(cachedTimes).toBeDefined();
    expect(ctx.self.skipWaiting).toHaveBeenCalled();
  });

  it("install does not fail the whole cache when one shell URL 404s", async () => {
    const ctx = loadServiceWorker(async (req) => {
      const url = typeof req === "string" ? req : (req as Request).url;
      if (url.endsWith("/about")) return new Response("not found", { status: 404 });
      return new Response(`shell:${url}`, { status: 200 });
    });
    const { waitUntilPromise } = fireEvent(ctx, "install");
    // The install handler's promise settling without throwing is itself the
    // assertion that one failed shell URL doesn't sink the whole install
    // (a real cache.addAll() would reject here instead).
    await expect(waitUntilPromise).resolves.toBeUndefined();

    const shellCache = await ctx.caches.open("praycalc-shell-v2");
    expect(await shellCache.match("/")).toBeDefined();
    expect(await shellCache.match("/about")).toBeUndefined();
  });

  it("activate deletes cache buckets not matching the current CACHE_VERSION", async () => {
    const ctx = loadServiceWorker(async () => new Response("x"));
    // Seed a stale bucket from a prior SW version.
    await ctx.caches.open("praycalc-shell-v1");
    await ctx.caches.open("praycalc-city-v2");

    const { waitUntilPromise } = fireEvent(ctx, "activate");
    await waitUntilPromise;

    const remaining = await ctx.caches.keys();
    expect(remaining).not.toContain("praycalc-shell-v1");
    expect(remaining).toContain("praycalc-city-v2");
    expect(ctx.self.clients.claim).toHaveBeenCalled();
  });

  it("caches a city page response on successful navigation fetch (NetworkFirst)", async () => {
    const ctx = loadServiceWorker(async () => new Response("<html>london times</html>", { status: 200 }));
    const req = navigateRequest("https://praycalc.com/gb/england/london");
    const { respondWithPromise } = fireEvent(ctx, "fetch", { request: req });
    const res = (await respondWithPromise) as Response;
    expect(await res.text()).toBe("<html>london times</html>");

    const cityCache = await ctx.caches.open("praycalc-city-v2");
    const cached = await cityCache.match(req);
    expect(cached).toBeDefined();
  });

  it("falls back to the last cached response for the SAME city URL when offline", async () => {
    let online = true;
    const ctx = loadServiceWorker(async (req) => {
      if (!online) throw new Error("network down");
      const url = typeof req === "string" ? req : (req as Request).url;
      return new Response(`<html>times for ${url}</html>`, { status: 200 });
    });

    // First visit: online, caches the response.
    const req1 = navigateRequest("https://praycalc.com/gb/england/london");
    const { respondWithPromise: p1 } = fireEvent(ctx, "fetch", { request: req1 });
    await p1;

    // Second visit to the SAME URL: offline — should serve the cached copy.
    online = false;
    const req2 = navigateRequest("https://praycalc.com/gb/england/london");
    const { respondWithPromise: p2 } = fireEvent(ctx, "fetch", { request: req2 });
    const res2 = (await p2) as Response;
    expect(await res2.text()).toContain("gb/england/london");
  });

  it("evicts oldest city-cache entries once CITY_CACHE_MAX_ENTRIES is exceeded", async () => {
    const ctx = loadServiceWorker(async (req) => {
      const url = typeof req === "string" ? req : (req as Request).url;
      return new Response(`<html>${url}</html>`, { status: 200 });
    });

    // Visit 26 distinct city URLs (cap is 25) sequentially so insertion order is deterministic.
    for (let i = 0; i < 26; i++) {
      const req = navigateRequest(`https://praycalc.com/city-${i}`);
      const { respondWithPromise } = fireEvent(ctx, "fetch", { request: req });
      await respondWithPromise;
    }

    const cityCache = await ctx.caches.open("praycalc-city-v2");
    const keys = await cityCache.keys();
    expect(keys.length).toBeLessThanOrEqual(25);
    // The earliest-visited city should have been evicted (FIFO).
    expect(await cityCache.match("https://praycalc.com/city-0")).toBeUndefined();
    // The most recently visited city should still be present.
    expect(await cityCache.match("https://praycalc.com/city-25")).toBeDefined();
  });

  it("does not add web-push listener logic (future item, out of scope for this SW)", () => {
    // VAPID/push-server wiring is intentionally noted only in the doc comment
    // as a future item — assert no actual 'push' event listener is registered.
    expect(SW_SOURCE).not.toMatch(/self\.addEventListener\(['"]push['"]/);
    expect(SW_SOURCE).not.toMatch(/self\.registration\.showNotification/);
  });
});
