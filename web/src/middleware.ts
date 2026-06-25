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

const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ckb', 'ps']);
const SUPPORTED = new Set([
  'en', 'ar', 'ur', 'fa', 'id', 'tr', 'ms', 'bn', 'fr', 'es', 'de', 'ru',
]);

export const onRequest = defineMiddleware((context, next) => {
  const raw = context.cookies.get('NEXT_LOCALE')?.value?.toLowerCase() ?? '';
  const primary = raw.split('-')[0] ?? '';
  const locale = SUPPORTED.has(primary) ? primary : 'en';
  context.locals.locale = locale;
  context.locals.isRTL = RTL_LOCALES.has(locale);
  return next();
});
