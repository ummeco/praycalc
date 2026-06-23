/**
 * sentry.client.config.ts — Client-side Sentry init for Astro (@sentry/astro).
 * @sentry/astro auto-imports this file at build time.
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON
 */
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN_PRAYCALC,
  enabled: !!import.meta.env.PUBLIC_SENTRY_DSN_PRAYCALC && import.meta.env.PROD,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  integrations: [
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
});
