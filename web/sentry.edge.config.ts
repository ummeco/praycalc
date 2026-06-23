/**
 * sentry.edge.config.ts — Edge runtime Sentry init for Astro (@sentry/astro).
 * Vercel Edge functions use this config.
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: process.env.SENTRY_DSN_PRAYCALC,
  enabled: !!process.env.SENTRY_DSN_PRAYCALC,
  tracesSampleRate: 0.1,
});
