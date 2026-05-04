import * as Sentry from "@sentry/nextjs";
import { scrubPII } from './lib/sentry-scrub'

// Server-side Sentry initialization (Node.js runtime).
// DSN is read from the NEXT_PUBLIC_SENTRY_DSN env var.
// If the var is not set, Sentry is a no-op (no error is thrown).
Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  tracesSampleRate: 0.1,

  // Sentry is fully disabled when no DSN is provided.
  enabled: !!(process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) &&
    process.env.NODE_ENV === 'production',

  // SEC-M6 / T25.15: Full PII scrub — headers, body, user fields, extras, contexts.
  beforeSend: scrubPII,
});
