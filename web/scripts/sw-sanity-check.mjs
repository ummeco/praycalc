#!/usr/bin/env node
/**
 * sw-sanity-check.mjs — Node-based smoke test for public/sw.js.
 *
 * PURPOSE: sw.js is plain, hand-written JS with no build step and no test
 *   runner wired to it (it runs only inside a real Service Worker context).
 *   This script loads it in a `vm` sandbox with minimal Cache Storage / fetch
 *   mocks and exercises the three behaviors changed in the 2026-07-10 PWA
 *   hardening pass, so a regression here fails loudly instead of silently
 *   shipping to praycalc.com.
 * CHECKS:
 *   1. ASSET_CACHE trimming — cacheFirst() evicts oldest entries past
 *      ASSET_CACHE_MAX_ENTRIES (PWA-03).
 *   2. staleWhileRevalidate() serves the cached copy instantly AND updates
 *      the cache from a background refetch (PWA-04).
 *   3. networkFirstWithFallback() falls back to the cached response on a
 *      navigation 5xx, but NOT on a 4xx (PWA-07).
 * USAGE: node scripts/sw-sanity-check.mjs (from web/)
 * CONSTRAINTS: No external deps — vm + assert only. Not wired into any CI
 *   job in this pass (that would touch package.json, out of scope for the
 *   PWA hardening ticket) — run manually or add an npm script separately.
 * REF: PWA hardening pass (2026-07-10)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const __dirname = dirname(fileURLToPath(import.meta.url));
const swSource = readFileSync(join(__dirname, '../public/sw.js'), 'utf8');

/** Minimal in-memory Cache Storage mock — enough of the real API surface for sw.js. */
function createCacheStorage() {
  const buckets = new Map();
  class FakeCache {
    constructor() {
      this.store = new Map(); // insertion-ordered: URL -> Response
    }
    async match(request) {
      const key = typeof request === 'string' ? request : request.url;
      return this.store.get(key);
    }
    async put(request, response) {
      const key = typeof request === 'string' ? request : request.url;
      this.store.set(key, response);
    }
    async delete(request) {
      const key = typeof request === 'string' ? request : request.url;
      return this.store.delete(key);
    }
    async keys() {
      return [...this.store.keys()].map((url) => ({ url }));
    }
  }
  return {
    async open(name) {
      if (!buckets.has(name)) buckets.set(name, new FakeCache());
      return buckets.get(name);
    },
    async match(request) {
      const key = typeof request === 'string' ? request : request.url;
      for (const cache of buckets.values()) {
        if (cache.store.has(key)) return cache.store.get(key);
      }
      return undefined;
    },
    async keys() {
      return [...buckets.keys()];
    },
    async delete(name) {
      return buckets.delete(name);
    },
    _buckets: buckets, // test-only escape hatch
  };
}

/** Fake Response — just enough of the Fetch API shape sw.js touches. */
class FakeResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
  }
  clone() {
    return new FakeResponse(this.body, { status: this.status });
  }
}

function loadSw({ fetchImpl }) {
  const listeners = {};
  const sandbox = {
    self: {
      addEventListener: (type, handler) => {
        listeners[type] = handler;
      },
      skipWaiting: () => {},
      clients: { claim: () => {} },
      location: { origin: 'https://praycalc.com' },
    },
    caches: createCacheStorage(),
    fetch: fetchImpl,
    Response: FakeResponse,
    URL,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(swSource, sandbox, { filename: 'sw.js' });
  return { listeners, caches: sandbox.caches };
}

async function testAssetCacheTrimming() {
  let callCount = 0;
  const fetchImpl = async (req) => {
    callCount += 1;
    return new FakeResponse(`asset-${callCount}`, { status: 200 });
  };
  const { listeners, caches } = loadSw({ fetchImpl });

  // Fire 105 distinct hashed-asset fetch events — cap is 100.
  for (let i = 0; i < 105; i++) {
    const request = { url: `https://praycalc.com/_astro/chunk-${i}.js`, method: 'GET', mode: 'no-cors' };
    let responded;
    const event = { request, respondWith: (p) => { responded = p; } };
    listeners.fetch(event);
    await responded; // eslint-disable-line no-await-in-loop
  }

  const assetCache = [...caches._buckets.entries()].find(([name]) => name.includes('assets'))[1];
  assert.ok(assetCache.store.size <= 100, `expected ASSET_CACHE trimmed to <=100, got ${assetCache.store.size}`);
  console.log(`  [ok] ASSET_CACHE trimmed to ${assetCache.store.size} entries after 105 unique hashed-asset fetches`);
}

async function testStaleWhileRevalidate() {
  let networkHits = 0;
  const fetchImpl = async () => {
    networkHits += 1;
    return new FakeResponse(`embed-v${networkHits}`, { status: 200 });
  };
  const { listeners, caches } = loadSw({ fetchImpl });

  const request = { url: 'https://praycalc.com/embed/praycalc.js', method: 'GET', mode: 'no-cors' };

  // First hit: nothing cached yet, must fall through to network.
  let responded;
  listeners.fetch({ request, respondWith: (p) => { responded = p; } });
  const first = await responded;
  assert.equal(first.body, 'embed-v1', 'first hit should serve the network response');

  // Second hit: cached copy exists — must serve it INSTANTLY (not the newer network body),
  // while a background refetch still updates the cache for next time.
  listeners.fetch({ request, respondWith: (p) => { responded = p; } });
  const second = await responded;
  assert.equal(second.body, 'embed-v1', 'second hit should serve the stale cached copy, not block on network');
  assert.ok(networkHits >= 2, 'background revalidation should still have refetched');
  console.log('  [ok] staleWhileRevalidate serves stale-then-revalidates for non-hashed /embed/praycalc.js');
}

async function testNavigation5xxFallsBackToCache() {
  let mode = 'ok';
  const fetchImpl = async () => {
    if (mode === 'ok') return new FakeResponse('cached-good-times', { status: 200 });
    if (mode === '500') return new FakeResponse('server-error-page', { status: 500 });
    if (mode === '404') return new FakeResponse('not-found-page', { status: 404 });
    throw new Error('unreachable');
  };
  const { listeners } = loadSw({ fetchImpl });
  const request = { url: 'https://praycalc.com/new-york-us', method: 'GET', mode: 'navigate' };

  // Warm the cache with a good response.
  let responded;
  listeners.fetch({ request, respondWith: (p) => { responded = p; } });
  const warm = await responded;
  assert.equal(warm.body, 'cached-good-times');

  // Simulate a backend outage: 500 should fall back to the cached good response (PWA-07 fix).
  mode = '500';
  listeners.fetch({ request, respondWith: (p) => { responded = p; } });
  const outage = await responded;
  assert.equal(outage.body, 'cached-good-times', 'navigation 5xx must fall back to cached response');
  console.log('  [ok] navigation 5xx falls back to cached last-known-good response');

  // A genuine 404 must NOT be masked by stale cache content.
  mode = '404';
  listeners.fetch({ request, respondWith: (p) => { responded = p; } });
  const notFound = await responded;
  assert.equal(notFound.status, 404, 'navigation 404 must be returned as-is, not masked by cache');
  console.log('  [ok] navigation 404 is returned as-is (not masked by stale cache)');
}

async function main() {
  console.log('sw-sanity-check: exercising public/sw.js in a vm sandbox\n');
  await testAssetCacheTrimming();
  await testStaleWhileRevalidate();
  await testNavigation5xxFallsBackToCache();
  console.log('\nAll sw.js sanity checks passed.');
}

main().catch((err) => {
  console.error('\nsw-sanity-check FAILED:', err.message);
  process.exit(1);
});
