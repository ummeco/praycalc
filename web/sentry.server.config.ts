/**
 * sentry.server.config.ts — Server-side Sentry init for Astro SSR (@sentry/astro).
 * @sentry/astro auto-imports this file for Node.js server runtime.
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: process.env.SENTRY_DSN_PRAYCALC,
  enabled: !!process.env.SENTRY_DSN_PRAYCALC && process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
