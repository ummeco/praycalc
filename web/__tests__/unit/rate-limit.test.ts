import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  MemoryRateLimitAdapter,
  checkRateLimit,
  getClientIp,
  getRateLimitAdapter,
  resetAdapterCache,
  PRAYER_TIMES_API,
  ACCOUNT_API,
} from '@/lib/rate-limit'
import { RedisRateLimitAdapter } from '@/lib/rate-limit-redis'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let keyCounter = 0
function uk(prefix = 'test'): string {
  return `${prefix}-${++keyCounter}-${Math.random()}`
}

// ---------------------------------------------------------------------------
// MemoryRateLimitAdapter
// ---------------------------------------------------------------------------
describe('MemoryRateLimitAdapter', () => {
  let adapter: MemoryRateLimitAdapter

  beforeEach(() => {
    adapter = new MemoryRateLimitAdapter()
  })

  it('allows the first request', async () => {
    const result = await adapter.check(uk(), { limit: 5, windowMs: 60_000 })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(4)
    expect(result.retryAfterSeconds).toBe(0)
    expect(result.resetAt).toBeGreaterThan(Date.now())
  })

  it('tracks count across requests in the same window', async () => {
    const key = uk()
    const opts = { limit: 3, windowMs: 60_000 }
    await adapter.check(key, opts)
    await adapter.check(key, opts)
    const result = await adapter.check(key, opts)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(0)
  })

  it('blocks once the limit is reached', async () => {
    const key = uk()
    const opts = { limit: 2, windowMs: 60_000 }
    await adapter.check(key, opts)
    await adapter.check(key, opts)
    const result = await adapter.check(key, opts)
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('allows exactly limit requests, then denies', async () => {
    const key = uk()
    const opts = { limit: 5, windowMs: 60_000 }
    for (let i = 0; i < 5; i++) {
      expect((await adapter.check(key, opts)).allowed).toBe(true)
    }
    expect((await adapter.check(key, opts)).allowed).toBe(false)
  })

  it('resets after window expires', async () => {
    const key = uk()
    const opts = { limit: 1, windowMs: 50 }
    await adapter.check(key, opts)
    expect((await adapter.check(key, opts)).allowed).toBe(false)

    await new Promise<void>(r => setTimeout(r, 70))

    expect((await adapter.check(key, opts)).allowed).toBe(true)
  })

  it('independent windows per key', async () => {
    const opts = { limit: 1, windowMs: 60_000 }
    expect((await adapter.check(uk('a'), opts)).allowed).toBe(true)
    expect((await adapter.check(uk('b'), opts)).allowed).toBe(true)
  })

  it('sweep removes expired entries', async () => {
    await adapter.check(uk(), { limit: 5, windowMs: 30 })
    expect(adapter.storeSize).toBeGreaterThan(0)
    await new Promise<void>(r => setTimeout(r, 50))
    adapter._sweep()
    expect(adapter.storeSize).toBe(0)
  })

  it('retryAfterSeconds is positive and accurate when blocked', async () => {
    const key = uk()
    const opts = { limit: 1, windowMs: 5_000 }
    await adapter.check(key, opts)
    const denied = await adapter.check(key, opts)
    expect(denied.retryAfterSeconds).toBeGreaterThan(0)
    expect(denied.retryAfterSeconds).toBeLessThanOrEqual(5)
  })
})

// ---------------------------------------------------------------------------
// Factory / checkRateLimit
// ---------------------------------------------------------------------------
describe('getRateLimitAdapter / checkRateLimit', () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    resetAdapterCache()
  })

  afterEach(() => {
    resetAdapterCache()
  })

  it('returns MemoryRateLimitAdapter when REDIS_URL is unset', () => {
    expect(getRateLimitAdapter()).toBeInstanceOf(MemoryRateLimitAdapter)
  })

  it('singleton — same instance on repeated calls', () => {
    expect(getRateLimitAdapter()).toBe(getRateLimitAdapter())
  })

  it('resetAdapterCache forces new instance', () => {
    const a = getRateLimitAdapter()
    resetAdapterCache()
    expect(getRateLimitAdapter()).not.toBe(a)
  })

  it('checkRateLimit resolves via factory', async () => {
    const result = await checkRateLimit(uk(), PRAYER_TIMES_API)
    expect(result.allowed).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Rate limit config constants
// ---------------------------------------------------------------------------
describe('Rate limit config constants', () => {
  it('PRAYER_TIMES_API: 300 req/min', () => {
    expect(PRAYER_TIMES_API.limit).toBe(300)
    expect(PRAYER_TIMES_API.windowMs).toBe(60_000)
  })

  it('ACCOUNT_API: 30 req/min', () => {
    expect(ACCOUNT_API.limit).toBe(30)
    expect(ACCOUNT_API.windowMs).toBe(60_000)
  })
})

// ---------------------------------------------------------------------------
// RedisRateLimitAdapter — fail-CLOSED behavior (T0-15-01)
// ---------------------------------------------------------------------------
describe('RedisRateLimitAdapter — fail-CLOSED on Redis error', () => {
  it('returns allowed=false when pipeline exec throws (ECONNREFUSED / unreachable)', async () => {
    // Build a mock Redis whose pipeline().exec() rejects — simulates unreachable Redis
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard:            vi.fn().mockReturnThis(),
      zrange:           vi.fn().mockReturnThis(),
      zadd:             vi.fn().mockReturnThis(),
      pexpire:          vi.fn().mockReturnThis(),
      exec:             vi.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    }
    const mockRedis = { pipeline: vi.fn().mockReturnValue(mockPipeline) }

    // Bypass the constructor's require('ioredis') by directly assigning the mock
    const adapter = Object.create(RedisRateLimitAdapter.prototype) as RedisRateLimitAdapter
    ;(adapter as unknown as { redis: unknown }).redis = mockRedis

    const result = await adapter.check('pc:rl:test', { limit: 10, windowMs: 60_000 })

    // fail-CLOSED on Redis err — prevents bypass via Redis attack
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('returns allowed=false when a pipeline command returns an error tuple', async () => {
    // Simulates a Redis command-level error ([Error, null] in the exec result)
    const mockPipeline = {
      zremrangebyscore: vi.fn().mockReturnThis(),
      zcard:            vi.fn().mockReturnThis(),
      zrange:           vi.fn().mockReturnThis(),
      zadd:             vi.fn().mockReturnThis(),
      pexpire:          vi.fn().mockReturnThis(),
      exec: vi.fn().mockResolvedValue([
        [new Error('READONLY'), null],  // zremrangebyscore failed
        [null, 0],
        [null, []],
      ]),
    }
    const mockRedis = { pipeline: vi.fn().mockReturnValue(mockPipeline) }

    const adapter = Object.create(RedisRateLimitAdapter.prototype) as RedisRateLimitAdapter
    ;(adapter as unknown as { redis: unknown }).redis = mockRedis

    const result = await adapter.check('pc:rl:test', { limit: 10, windowMs: 60_000 })

    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// getClientIp
// ---------------------------------------------------------------------------
describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '1.2.3.4, 10.0.0.1' }))).toBe('1.2.3.4')
  })

  it('returns "unknown" when header is absent', () => {
    expect(getClientIp(new Headers())).toBe('unknown')
  })

  it('trims whitespace from IP', () => {
    expect(getClientIp(new Headers({ 'x-forwarded-for': '  5.6.7.8  ' }))).toBe('5.6.7.8')
  })

  it('falls back to x-real-ip', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9')
  })
})
