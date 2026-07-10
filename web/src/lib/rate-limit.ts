/**
 * rate-limit.ts — In-memory per-IP token-bucket limiter for public API routes.
 *
 * PURPOSE: Restore basic abuse/cost protection on the unauthenticated
 *   endpoints (/api/prayers, /api/geo, /api/search, /api/calendar.ics) that
 *   lost their Next.js-era rate limiter (rate-limit.ts / rate-limit-memory.ts
 *   / rate-limit-redis.ts) in the Astro migration — the docs promise 429s but
 *   nothing was enforcing them.
 * INPUTS: a bucket key (typically `${ip}:${pathname}`), capacity, window.
 * OUTPUTS: RateLimitResult — allowed/remaining/limit/resetMs for building
 *   honest `X-RateLimit-*` / `Retry-After` response headers.
 * CONSTRAINTS: Vercel serverless functions are stateless per invocation and
 *   scale horizontally across many concurrent lambda instances — this Map
 *   only sees requests that land on the SAME warm instance. It is a
 *   best-effort per-instance deterrent against a single abusive client
 *   hammering one warm lambda, NOT a global/atomic rate limit across the
 *   whole deployment. A true global limit needs a shared store (e.g. Upstash
 *   Redis) — out of scope here; this is the honest, zero-dependency floor.
 * REF: WEB-04 (web audit gap-closure)
 */

interface Bucket {
  tokens: number;
  last: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  /** Milliseconds until at least one token is available again. */
  resetMs: number;
}

const buckets = new Map<string, Bucket>();
/** Hard cap on tracked keys so a distributed-IP flood can't grow this map unbounded. */
const MAX_TRACKED_KEYS = 5000;

/**
 * Check + consume one token for `key`. Refills continuously at
 * `capacity / windowMs` tokens/ms (a standard token bucket, not a fixed
 * window) so bursts drain smoothly rather than resetting all-at-once.
 */
export function checkRateLimit(key: string, capacity = 60, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const rate = capacity / windowMs;

  if (buckets.size > MAX_TRACKED_KEYS) {
    // Defensive bound — an attacker spoofing many distinct IPs shouldn't be
    // able to grow this map forever. Clearing is safe: it just means a brief
    // window of full-capacity buckets, not an unlimited pass.
    buckets.clear();
  }

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: capacity - 1, last: now };
    buckets.set(key, bucket);
    return { allowed: true, remaining: Math.floor(bucket.tokens), limit: capacity, resetMs: 0 };
  }

  const elapsed = now - bucket.last;
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * rate);
  bucket.last = now;

  if (bucket.tokens < 1) {
    return {
      allowed: false,
      remaining: 0,
      limit: capacity,
      resetMs: Math.ceil((1 - bucket.tokens) / rate),
    };
  }

  bucket.tokens -= 1;
  return { allowed: true, remaining: Math.floor(bucket.tokens), limit: capacity, resetMs: 0 };
}

/** Best-effort client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? 'unknown';
}
