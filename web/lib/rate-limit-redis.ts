/**
 * PrayCalc — Redis Rate Limit Adapter (Phase 3+)
 *
 * True sliding-window using a sorted set (ZRANGEBYSCORE / ZADD / ZREMRANGEBYSCORE).
 * Activates automatically when REDIS_URL is set — see factory in rate-limit.ts.
 *
 * Uses ioredis (already a dep of the nSelf Hasura stack).
 * Install: pnpm add ioredis
 */

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

export class RedisRateLimitAdapter implements RateLimitAdapter {
  private redis: RedisClient

  constructor(redisUrl: string) {
    const Redis = require('ioredis')
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true,
    }) as RedisClient
  }

  async check(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now()
    const windowStart = now - opts.windowMs
    const member = `${now}-${Math.random().toString(36).slice(2)}`

    const pipe = this.redis.pipeline()
    pipe.zremrangebyscore(key, '-inf', windowStart)
    pipe.zcard(key)
    pipe.zrange(key, 0, 0, 'WITHSCORES')

    const results = await pipe.exec()

    const count = (results[1][1] as number) ?? 0
    const oldestScores = (results[2][1] as string[]) ?? []
    const oldestTs = oldestScores.length >= 2 ? Number(oldestScores[1]) : now

    if (count >= opts.limit) {
      const resetAt = oldestTs + opts.windowMs
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      }
    }

    const addPipe = this.redis.pipeline()
    addPipe.zadd(key, now, member)
    addPipe.pexpire(key, opts.windowMs + 5_000)
    await addPipe.exec()

    return {
      allowed: true,
      remaining: opts.limit - (count + 1),
      resetAt: now + opts.windowMs,
      retryAfterSeconds: 0,
    }
  }
}
