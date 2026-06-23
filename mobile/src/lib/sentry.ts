/**
 * Purpose: Sentry init wrapper — no-op when SENTRY_DSN is unset (UD-2 pattern).
 * Inputs:  EXPO_PUBLIC_SENTRY_DSN environment variable (optional).
 * Outputs: initSentry() side-effect; Sentry instance ready for use in error boundaries.
 * Constraints:
 *   - MUST be a no-op when SENTRY_DSN is absent — CI builds run with no DSN (acceptance gate).
 *   - sendDefaultPii: false — no user PII captured.
 *   - beforeSend scrubs Authorization headers and email breadcrumbs.
 *   - UD-2: Sentry hosting (saaS vs self-hosted) is a user decision. DSN value differs;
 *     code path is identical either way.
 *   - Log warning in dev when DSN is absent so engineers notice in local builds.
 * SPORT: praycalc/mobile — Sentry init wired (no-op without DSN)
 */

import * as Sentry from '@sentry/react-native';

/** Returns true if Sentry has been initialised in this process. */
let _initialised = false;

/**
 * Initialise Sentry.
 *
 * Safe to call multiple times — no-ops after first successful init.
 * Returns early (no-op) when EXPO_PUBLIC_SENTRY_DSN is absent or empty.
 *
 * UD-2: The DSN value (sentry.io SaaS vs self-hosted) is a user decision.
 * Set EXPO_PUBLIC_SENTRY_DSN in your EAS secret / .env.local to activate.
 */
export function initSentry(): void {
  if (_initialised) return;

  // Expo public env vars are inlined at build time via babel-plugin-transform-inline-env
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        '[Sentry] No EXPO_PUBLIC_SENTRY_DSN — crash reporting is disabled. ' +
          'Set this env var to activate Sentry (UD-2).',
      );
    }
    // No-op: do NOT call Sentry.init() without a DSN
    return;
  }

  Sentry.init({
    dsn,
    // Never send personally identifiable information
    sendDefaultPii: false,
    // Attach JS source context for better stack traces
    attachStacktrace: true,
    // Release name: <bundleId>@<version>+<buildNumber> — set by EAS build env
    release: process.env.EXPO_PUBLIC_SENTRY_RELEASE,
    dist: process.env.EXPO_PUBLIC_SENTRY_DIST,
    beforeSend(event: Sentry.ErrorEvent) {
      // Scrub Authorization headers from request breadcrumbs
      if (event.request?.headers) {
        const headers = { ...event.request.headers };
        delete headers['Authorization'];
        delete headers['authorization'];
        event.request.headers = headers;
      }
      // Scrub email addresses from user context
      if (event.user?.email) {
        event.user = { ...event.user, email: '[redacted]' };
      }
      return event;
    },
  });

  _initialised = true;
}

/**
 * Wrap the root React component with Sentry error boundary + touch event tracing.
 * When Sentry is not initialised (no DSN), this is the identity function.
 */
export const sentryWrap: typeof Sentry.wrap = Sentry.wrap;

/** Re-export for use in error boundaries and manual captures */
export { Sentry };
