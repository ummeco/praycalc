import * as Sentry from "@sentry/nextjs";

// Client-side Sentry initialization.
// DSN is read from the NEXT_PUBLIC_SENTRY_DSN env var.
// If the var is not set, Sentry is a no-op (no error is thrown).
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% of transactions for performance monitoring.
  // Increase toward 1.0 in development for easier debugging.
  tracesSampleRate: 0.1,

  // Capture 10% of sessions for session replay.
  // Replay records user interactions at the time of an error.
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // Sentry is fully disabled when no DSN is provided.
  // This allows the app to run locally without a Sentry project.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});
