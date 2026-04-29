/**
 * PrayCalc — Redis Rate Limit Adapter (Phase 3+)
 *
 * True sliding-window using a sorted set (ZRANGEBYSCORE / ZADD / ZREMRANGEBYSCORE).
 * Activates automatically when REDIS_URL is set — see factory in rate-limit.ts.
 *
 * Uses ioredis (already a dep of the nSelf Hasura stack).
 * Install: pnpm add ioredis
 *
 * Failure mode: FAIL-CLOSED — if Redis is unreachable or any pipeline command errors,
 * check() returns { allowed: false }. This prevents a Redis outage from opening a free
 * path through rate-limited endpoints (fail-CLOSED on Redis err — prevents bypass via
 * Redis attack).
 */

import * as Sentry from '@sentry/nextjs'
import type { RateLimitAdapter, RateLimitOptions, RateLimitResult } from './rate-limit'

interface RedisClient {
  pipeline(): {
    zremrangebyscore(key: string, min: string | number, max: string | number): unknown
    zcard(key: string): unknown
    zrange(key: string, start: number, stop: number, withScores?: string): unknown
    zadd(key: string, score: number, member: string): unknown
    pexpire(key: string, ms: number): unknown
    exec(): Promise<Array<[Error | null, unknown]>>
  }
}

/** Canonical fail-CLOSED result returned on any Redis error. */
function failClosed(now: number, windowMs: number): RateLimitResult {
  return {
    allowed:           false,
    remaining:         0,
    resetAt:           now + windowMs,
    retryAfterSeconds: 60,
  }
}

export class RedisRateLimitAdapter implements RateLimitAdapter {
  private redis: RedisClient

  constructor(redisUrl: string) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Redis = require('ioredis')
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,  // fail fast — prevents long hangs on unreachable Redis
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 2_000,
    }) as RedisClient
  }

  async check(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - opts.windowMs
    const member = `${now}-${Math.random().toString(36).slice(2)}`

    try {
      // Read phase: remove stale entries, count current window, get oldest
      const readPipe = this.redis.pipeline()
      readPipe.zremrangebyscore(key, '-inf', windowStart)
      readPipe.zcard(key)
      readPipe.zrange(key, 0, 0, 'WITHSCORES')

      const results = await readPipe.exec()

      // If any pipeline command returned an error, fail CLOSED
      for (const [err] of results) {
        if (err) {
          Sentry.captureException(err)
          console.error('[rate-limit-redis] Redis pipeline error — failing CLOSED', err)
          return failClosed(now, opts.windowMs)
        }
      }

      const count        = (results[1][1] as number) ?? 0
      const oldestScores = (results[2][1] as string[]) ?? []
      const oldestTs     = oldestScores.length >= 2 ? Number(oldestScores[1]) : now

      if (count >= opts.limit) {
        const resetAt = oldestTs + opts.windowMs
        return {
          allowed:           false,
          remaining:         0,
          resetAt,
          retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
        }
      }

      // Write phase: record this request and set TTL
      const addPipe = this.redis.pipeline()
      addPipe.zadd(key, now, member)
      addPipe.pexpire(key, opts.windowMs + 5_000)
      await addPipe.exec()

      return {
        allowed:           true,
        remaining:         opts.limit - (count + 1),
        resetAt:           now + opts.windowMs,
        retryAfterSeconds: 0,
      }
    } catch (err) {
      // Network error, ECONNREFUSED, timeout — fail CLOSED
      // fail-CLOSED on Redis err — prevents bypass via Redis attack
      Sentry.captureException(err)
      console.error('[rate-limit-redis] Redis unreachable — failing CLOSED', {
        error: err instanceof Error ? err.message : String(err),
        key,
      })
      return failClosed(now, opts.windowMs)
    }
  }
}
