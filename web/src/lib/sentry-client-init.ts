/**
 * sentry-client-init.ts — Client-side Sentry init, lazy-loaded (Lighthouse perf).
 *
 * PURPOSE: Same Sentry.init() call that used to live in sentry.client.config.ts,
 *   moved here so it is NOT part of every page's eager entry bundle.
 * WHY: @sentry/astro's default behavior calls injectScript("page", ...), which
 *   glues the full browser SDK (core + browserTracing + session Replay/rrweb,
 *   ~75 KiB brotli) into the one script every page loads synchronously on
 *   first paint — the single largest contributor to homepage FCP/LCP. The
 *   integration's client injection is disabled in astro.config.ts
 *   (`enabled: { client: false, server: true }`); RootLayout.astro dynamically
 *   imports this module on `requestIdleCallback`/`load` instead, so error/replay
 *   monitoring still initializes (a few hundred ms after paint), it just never
 *   competes with LCP-critical bytes for bandwidth or main-thread time.
 * CONSTRAINTS: Server-side Sentry (sentry.server.config.ts) is unaffected —
 *   SSR/API-route error capture keeps working exactly as before.
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON · Lighthouse perf pass
 */
import * as Sentry from '@sentry/astro';

Sentry.init({
  dsn: import.meta.env.PUBLIC_SENTRY_DSN_PRAYCALC,
  enabled: !!import.meta.env.PUBLIC_SENTRY_DSN_PRAYCALC && import.meta.env.PROD,
  tracesSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
});
