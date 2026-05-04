import * as Sentry from "@sentry/nextjs";
import { scrubPII } from './lib/sentry-scrub'

// Client-side Sentry initialization for PrayCalc.
// DSN is read from NEXT_PUBLIC_SENTRY_DSN (set in Vercel project: ummat-praycalc).
// No DSN → Sentry is a no-op; no error is thrown. Safe to ship without a DSN in dev.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only active in production — avoids noise in local dev.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production',

  // 10% of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // C-08a-FIX-P0: Session replay — no general sampling until consent-gated replay ships.
  // Errors always captured (1.0). General sampling disabled (0.0).
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.0,

  integrations: [
    // C-08a-FIX-P0: maskAllText + blockAllMedia for privacy compliance.
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],

  // SEC-M6 / T25.15: Full PII scrub — headers, body, user fields, extras, contexts.
  beforeSend: scrubPII,
});
