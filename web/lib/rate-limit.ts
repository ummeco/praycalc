/**
 * PrayCalc — Rate Limiter: Adapter Interface + Factory
 *
 * Adapter design: swap between in-memory (Phase 1) and Redis-backed (Phase 3+)
 * without touching call sites. Redis activates automatically when REDIS_URL is set.
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
      const { RedisRateLimitAdapter } = require('./rate-limit-redis')
      _adapter = new RedisRateLimitAdapter(process.env.REDIS_URL)
    } catch {
      console.warn('[rate-limit] REDIS_URL set but ioredis unavailable — falling back to in-memory adapter')
      _adapter = new MemoryRateLimitAdapter()
    }
  } else {
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
