/**
 * PrayCalc — Rate Limiter: Adapter Interface + Factory
 *
 * CANONICAL SOURCE: ummat/packages/shared/src/security/rate-limit.ts
 * This file is a standalone-repo copy. Do NOT edit the logic here —
 * update the canonical source and sync here (T-P7-W1.5-10).
 *
 * TRAP-M02: Fail-closed in production. REDIS_URL is required.
 * Previous version silently fell back to MemoryRateLimitAdapter in prod.
 *
 * Limits (per spec):
 *   /api/prayer-times (prayers): 300 req/min per IP — high-volume computation endpoint
 *   /api/account:                 30 req/min per IP
 *
 * Algorithm: sliding window (fixed window for memory adapter, true sliding for Redis).
 */

import { MemoryRateLimitAdapter } from './rate-limit-memory'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  limit: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export interface RateLimitAdapter {
  check(key: string, opts: RateLimitOptions): Promise<RateLimitResult>
}

export { MemoryRateLimitAdapter }

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _adapter: RateLimitAdapter | null = null

export function getRateLimitAdapter(): RateLimitAdapter {
  if (_adapter) return _adapter

  if (process.env.REDIS_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { RedisRateLimitAdapter } = require('./rate-limit-redis')
      _adapter = new RedisRateLimitAdapter(process.env.REDIS_URL)
    } catch {
      console.warn('[rate-limit] REDIS_URL set but ioredis unavailable — falling back to in-memory adapter')
      _adapter = new MemoryRateLimitAdapter()
    }
  } else {
    // TRAP-M02: fail closed in production — in-memory bypass on Vercel
    // multi-instance is a security hole (state is not shared across instances).
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[rate-limit] REDIS_URL required in production. Set REDIS_URL to enable rate limiting.')
    }
    console.warn('[rate-limit] REDIS_URL not set — using in-memory adapter (not safe for multi-instance)')
    _adapter = new MemoryRateLimitAdapter()
  }

  return _adapter!
}

export function resetAdapterCache(): void {
  _adapter = null
}

// ---------------------------------------------------------------------------
// Convenience wrapper
// ---------------------------------------------------------------------------

export async function checkRateLimit(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
  return getRateLimitAdapter().check(key, opts)
}

// ---------------------------------------------------------------------------
// Standard limit configs
// ---------------------------------------------------------------------------

/**
 * /api/prayers — prayer time calculations: 300 req/min per IP.
 * High-volume: hit by widgets, embedded apps, and direct users.
 */
export const PRAYER_TIMES_API: RateLimitOptions = { limit: 300, windowMs: 60_000 }

/** /api/account — account management endpoints: 30 req/min per IP */
export const ACCOUNT_API: RateLimitOptions = { limit: 30, windowMs: 60_000 }

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(result.retryAfterSeconds),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    },
  })
}
