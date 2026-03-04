import type { Request, Response, NextFunction } from 'express';

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();
const RATE = 60;       // tokens per minute
const INTERVAL = 60_000; // 1 minute in ms

function getKey(req: Request): string {
  const userId = (req as any).userId;
  if (userId) return `user:${userId}`;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return `ip:${ip}`;
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  if (req.path === '/health') {
    next();
    return;
  }

  const key = getKey(req);
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: RATE, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor((elapsed / INTERVAL) * RATE);
  if (refill > 0) {
    bucket.tokens = Math.min(RATE, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(INTERVAL / 1000),
    });
    return;
  }

  bucket.tokens--;
  res.setHeader('X-RateLimit-Limit', RATE.toString());
  res.setHeader('X-RateLimit-Remaining', bucket.tokens.toString());
  next();
}

// Clean up stale buckets every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - INTERVAL * 5;
  for (const [key, bucket] of buckets) {
    if (bucket.lastRefill < cutoff) buckets.delete(key);
  }
}, 300_000);
