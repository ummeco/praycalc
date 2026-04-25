/**
 * PrayCalc — In-Memory Rate Limit Adapter (Phase 1)
 *
 * Sliding-window approximation using a fixed window per key.
 * Safe for single-instance dev/staging. Not multi-replica safe.
 */

import type { RateLimitAdapter, RateLimitOptions, RateLimitResult } from './rate-limit'

interface WindowEntry {
  count: number
  resetAt: number
}

export class MemoryRateLimitAdapter implements RateLimitAdapter {
  private store = new Map<string, WindowEntry>()

  constructor() {
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this._sweep(), 5 * 60 * 1000)
    }
  }

  async check(key: string, opts: RateLimitOptions): Promise<RateLimitResult> {
    const now = Date.now()
    const existing = this.store.get(key)

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + opts.windowMs
      this.store.set(key, { count: 1, resetAt })
      return { allowed: true, remaining: opts.limit - 1, resetAt, retryAfterSeconds: 0 }
    }

    if (existing.count >= opts.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.resetAt,
        retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
      }
    }

    existing.count++
    return {
      allowed: true,
      remaining: opts.limit - existing.count,
      resetAt: existing.resetAt,
      retryAfterSeconds: 0,
    }
  }

  get storeSize(): number { return this.store.size }

  _sweep(): void {
    const now = Date.now()
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) this.store.delete(key)
    }
  }

  _clear(): void { this.store.clear() }
}
