/**
 * middleware.ts — Resolve the active locale from the NEXT_LOCALE cookie.
 *
 * PURPOSE: PrayCalc keeps URLs locale-agnostic (prefixDefaultLocale: false) and
 *   stores the chosen language in the NEXT_LOCALE cookie. This middleware reads
 *   that cookie and exposes locals.locale / locals.isRTL so RootLayout can set
 *   <html lang/dir> and pages can pass the locale to islands.
 * REF: P2-PRAYCALC-E2E-REBUILD · rtl.spec.ts
 */

import { defineMiddleware } from 'astro:middleware';

// RTL/SUPPORTED are intentionally scoped to locales with REAL translated content
// (verified 2026-07-08: index.astro TAGLINES + PrayerGrid/PRAYER_META inline dicts).
// The previous set advertised 12 locales (incl. fa/id/tr/ms/bn/fr/es/de/ru) with zero
// translated strings behind them — silently falling back to English while claiming
// support. Per the Islamic-content theology gate, we do not machine-translate to fill
// the gap; we keep the declared surface honest until real translations land. Add a
// locale here only alongside its actual dict entries.
const RTL_LOCALES = new Set(['ar', 'ur']);
const SUPPORTED = new Set(['en', 'ar', 'ur']);

export const onRequest = defineMiddleware((context, next) => {
  const raw = context.cookies.get('NEXT_LOCALE')?.value?.toLowerCase() ?? '';
  const primary = raw.split('-')[0] ?? '';
  const locale = SUPPORTED.has(primary) ? primary : 'en';
  context.locals.locale = locale;
  context.locals.isRTL = RTL_LOCALES.has(locale);
  return next();
});
