/**
 * middleware.ts — Locale resolution + rate limiting for public API routes.
 *
 * PURPOSE: PrayCalc keeps URLs locale-agnostic (prefixDefaultLocale: false) and
 *   stores the chosen language in the NEXT_LOCALE cookie. This middleware reads
 *   that cookie and exposes locals.locale / locals.isRTL so RootLayout can set
 *   <html lang/dir> and pages can pass the locale to islands. It also enforces
 *   a per-IP token-bucket limit on the unauthenticated public API routes (see
 *   src/lib/rate-limit.ts for the per-instance caveat) — WEB-04 gap-closure.
 * REF: P2-PRAYCALC-E2E-REBUILD · rtl.spec.ts · WEB-04
 */

import { defineMiddleware } from 'astro:middleware';
import type { APIContext } from 'astro';
import { checkRateLimit, getClientIpFromHeaders } from '@/lib/rate-limit';

// Unauthenticated, potentially expensive/scrapeable routes. Each is capped at
// 60 requests/minute per client IP (per warm lambda instance — see rate-limit.ts).
const RATE_LIMITED_PATHS = ['/api/prayers', '/api/geo', '/api/search', '/api/calendar.ics'];

// RTL/SUPPORTED are intentionally scoped to locales with REAL translated content
// (verified 2026-07-08: index.astro TAGLINES + PrayerGrid/PRAYER_META inline dicts).
// The previous set advertised 12 locales (incl. fa/id/tr/ms/bn/fr/es/de/ru) with zero
// translated strings behind them — silently falling back to English while claiming
// support. Per the Islamic-content theology gate, we do not machine-translate to fill
// the gap; we keep the declared surface honest until real translations land. Add a
// locale here only alongside its actual dict entries.
const RTL_LOCALES = new Set(['ar', 'ur']);
const SUPPORTED = new Set(['en', 'ar', 'ur']);

/** Resolve + attach locale/isRTL locals from the NEXT_LOCALE cookie. */
function applyLocale(context: APIContext): void {
  const raw = context.cookies.get('NEXT_LOCALE')?.value?.toLowerCase() ?? '';
  const primary = raw.split('-')[0] ?? '';
  const locale = SUPPORTED.has(primary) ? primary : 'en';
  context.locals.locale = locale;
  context.locals.isRTL = RTL_LOCALES.has(locale);
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  applyLocale(context);

  const isRateLimited = RATE_LIMITED_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!isRateLimited) return next();

  const ip = getClientIpFromHeaders(context.request.headers);
  const result = checkRateLimit(`${ip}:${pathname}`);
  if (!result.allowed) {
    return new Response(JSON.stringify({ error: 'rate_limited', retryAfterMs: result.resetMs }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(result.resetMs / 1000)),
        'X-RateLimit-Limit': String(result.limit),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  const response = await next();
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  return response;
});
