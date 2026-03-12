/**
 * Public prayer times REST API — no authentication required.
 * Mounted at: app.use('/api/v1/public', cors({ origin: '*' }), publicTimesRouter)
 *
 * Endpoints:
 *   GET /api/v1/public/times — Calculate prayer times for a lat/lng
 *
 * Rate limit: 100 requests per minute per IP (in-memory token bucket).
 */

import { Router, type Request, type Response } from 'express';
import { calculatePrayerTimes, type CalcMethod, type Madhab } from '../lib/prayer-calculator.js';

const router = Router();

// ── In-memory token bucket rate limiter ──────────────────────────────────────
// 100 requests per minute per IP.

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const rateBuckets = new Map<string, Bucket>();
const MAX_TOKENS = 100;
const REFILL_INTERVAL_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket) {
    rateBuckets.set(ip, { tokens: MAX_TOKENS - 1, lastRefill: now });
    return true;
  }

  if (now - bucket.lastRefill >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS - 1;
    bucket.lastRefill = now;
    return true;
  }

  if (bucket.tokens <= 0) return false;
  bucket.tokens--;
  return true;
}

// Purge stale buckets every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, bucket] of rateBuckets) {
    if (now - bucket.lastRefill > REFILL_INTERVAL_MS * 2) rateBuckets.delete(ip);
  }
}, 300_000);

const VALID_METHODS: CalcMethod[] = ['isna', 'mwl', 'egypt', 'umm_al_qura', 'tehran', 'karachi'];
const VALID_MADHABS: Madhab[] = ['shafii', 'hanafi'];

// GET /api/v1/public/times
// Query params: lat (required), lng (required), date (YYYY-MM-DD, default today), method, madhab
router.get('/times', (req: Request, res: Response) => {
  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0].trim() ??
    req.ip ??
    'unknown';

  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message:
        '100 requests per minute allowed for the public API. Consider using PrayCalc directly for higher limits.',
    });
    return;
  }

  const { lat, lng, date, method = 'isna', madhab = 'shafii' } = req.query;

  if (!lat || !lng) {
    res.status(400).json({ error: 'lat and lng query parameters are required' });
    return;
  }

  const latNum = parseFloat(lat as string);
  const lngNum = parseFloat(lng as string);

  if (
    isNaN(latNum) ||
    isNaN(lngNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lngNum < -180 ||
    lngNum > 180
  ) {
    res.status(400).json({ error: 'Invalid lat/lng values' });
    return;
  }

  const dateStr = (date as string | undefined) ?? new Date().toISOString().split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
    return;
  }

  const methodStr = (method as string).toLowerCase() as CalcMethod;
  if (!VALID_METHODS.includes(methodStr)) {
    res.status(400).json({ error: `method must be one of: ${VALID_METHODS.join(', ')}` });
    return;
  }

  const madhabStr = (madhab as string).toLowerCase() as Madhab;
  if (!VALID_MADHABS.includes(madhabStr)) {
    res.status(400).json({ error: `madhab must be one of: ${VALID_MADHABS.join(', ')}` });
    return;
  }

  try {
    const result = calculatePrayerTimes(latNum, lngNum, dateStr, methodStr, madhabStr);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({
      ...result,
      _source: 'PrayCalc Public API — praycalc.com',
      _rateLimit: { limit: 100, windowMinutes: 1 },
    });
  } catch (err) {
    console.error('[public-times] Calculation error:', err);
    res.status(500).json({ error: 'Failed to calculate prayer times' });
  }
});

export default router;
