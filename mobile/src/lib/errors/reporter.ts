/**
 * Purpose: Dependency-free global JS error reporter for the nSentry ingest
 *   convention (Ummeco PPI Policy 8) — a lightweight fallback that fires even
 *   when the @sentry/react-native SDK (src/lib/sentry.ts) has no DSN configured.
 * Inputs:  Uncaught JS exceptions (via ErrorUtils.setGlobalHandler) or manual
 *   calls to reportError(error, context?).
 * Outputs: Fire-and-forget POST of a compact JSON payload to PING_INGEST_URL.
 *   Never throws, never awaited by callers, never blocks the original error
 *   handler chain.
 * Constraints:
 *   - ZERO new dependencies — uses only RN globals (ErrorUtils, fetch), the
 *     react-native core Platform module, and expo-constants for app version,
 *     both of which are already project dependencies (see package.json).
 *   - An unreachable/broken collector must NEVER affect the app: every network
 *     call is wrapped in .catch(() => undefined); reporting itself is wrapped
 *     in try/catch so a malformed error object can't crash the handler.
 *   - Chains to the previously-registered global handler (if any) so this
 *     module is safe to import alongside @sentry/react-native or Expo's own
 *     default handler — nobody's error handling is silently dropped.
 *   - Gating: mobile has no analytics/consent store today (only src/lib/analytics.ts,
 *     which is unconditionally-anonymous Umami and carries no consent concept).
 *     Per task instruction, in the absence of a consent store this reports only
 *     when __DEV__ === false (i.e. real/production-ish builds), never in local dev.
 *   - PING_INGEST_URL: ping.ummat.dev/{ingest,errors} both 404 as of 2026-07-07
 *     (verified via curl) and no ping.* ingest route exists anywhere in
 *     ummat/backend or ummeco/observability (grepped both, read-only). The only
 *     live Ummeco error-observability host is errors.ummat.dev (Sentry-OSS,
 *     also 404 on GET / and /api/store/ — SDK-only ingest, not a plain REST
 *     POST target). This constant therefore points at the most plausible
 *     nSentry convention route (ping.ummat.dev/ingest) per Policy 8's naming
 *     scheme (`ping.<domain>` = errors/RUM/telemetry ingest). Update this
 *     constant once nSentry is actually provisioned for Ummat — see PCI.
 * SPORT: praycalc/mobile — global error reporter (nSentry ingest fallback)
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** nSentry ingest endpoint — see Constraints above re: not yet live. */
export const PING_INGEST_URL = 'https://ping.ummat.dev/ingest';

/** Max stack trace lines forwarded in the payload (keeps payloads compact). */
const MAX_STACK_LINES = 20;

/** Shape of the compact payload POSTed to the ingest endpoint. */
interface ErrorReportPayload {
  message: string;
  stack?: string;
  appVersion: string;
  platform: string;
  timestamp: string;
  isFatal?: boolean;
  context?: string;
}

/** Resolve the app version from expo-constants (already a project dependency). */
function getAppVersion(): string {
  return Constants.expoConfig?.version ?? 'unknown';
}

/** Resolve the current platform name via react-native's core Platform module. */
function getPlatform(): string {
  return Platform.OS ?? 'unknown';
}

/** Truncate a stack trace to the first MAX_STACK_LINES lines. */
function truncateStack(stack: string | undefined): string | undefined {
  if (!stack) return undefined;
  return stack.split('\n').slice(0, MAX_STACK_LINES).join('\n');
}

/**
 * Whether error reporting is currently permitted.
 *
 * Mobile has no analytics/consent store (grepped src/ — only the unconditional
 * anonymous Umami helper in src/lib/analytics.ts exists, which has no consent
 * concept to gate on). Per task instruction, absent a consent store this gates
 * on __DEV__ === false only: local development builds never report, anything
 * else (TestFlight/EAS/production) does.
 */
function reportingAllowed(): boolean {
  return __DEV__ === false;
}

/**
 * POST a compact error report to the nSentry ingest endpoint.
 * Fire-and-forget: never throws, never awaited by callers, and an unreachable
 * collector must never affect the app.
 */
function sendReport(payload: ErrorReportPayload): void {
  if (!reportingAllowed()) return;

  try {
    void fetch(PING_INGEST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  } catch {
    // Synchronous throws (e.g. JSON.stringify on a circular payload) must
    // never propagate out of the reporter.
  }
}

/**
 * Report an error to the nSentry ingest endpoint.
 *
 * Safe to call manually (caught exceptions, promise rejections) or via the
 * global handler installed by installGlobalErrorReporter(). Never throws.
 *
 * @param error - The thrown value. May be an Error, string, or arbitrary value.
 * @param context - Optional short label describing where the error occurred
 *   (e.g. 'PrayerNotificationService.schedule'). Kept out of the stack trace
 *   so it stays greppable in ingest logs.
 */
export function reportError(error: unknown, context?: string): void {
  try {
    const err = error instanceof Error ? error : new Error(String(error));

    sendReport({
      message: err.message || 'Unknown error',
      stack: truncateStack(err.stack),
      appVersion: getAppVersion(),
      platform: getPlatform(),
      timestamp: new Date().toISOString(),
      context,
    });
  } catch {
    // Reporting must never itself throw — swallow silently.
  }
}

let _installed = false;

/**
 * Install a global JS error handler that forwards uncaught exceptions to the
 * nSentry ingest endpoint, then chains to whatever handler was previously
 * registered (e.g. Expo's default handler or @sentry/react-native's), so this
 * module is a strict addition and never suppresses existing behavior.
 *
 * Safe to call multiple times — no-ops after the first call.
 */
export function installGlobalErrorReporter(): void {
  if (_installed) return;
  _installed = true;

  const globalObj = globalThis as typeof globalThis & {
    ErrorUtils?: {
      setGlobalHandler: (cb: (error: unknown, isFatal?: boolean) => void) => void;
      getGlobalHandler: () => ((error: unknown, isFatal?: boolean) => void) | undefined;
    };
  };

  const errorUtils = globalObj.ErrorUtils;
  if (!errorUtils) return; // Not running in a React Native JS runtime (e.g. plain node) — no-op.

  const previousHandler = errorUtils.getGlobalHandler?.();

  errorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    try {
      const err = error instanceof Error ? error : new Error(String(error));
      sendReport({
        message: err.message || 'Unknown error',
        stack: truncateStack(err.stack),
        appVersion: getAppVersion(),
        platform: getPlatform(),
        timestamp: new Date().toISOString(),
        isFatal,
      });
    } catch {
      // Never let reporting failure block the previous handler below.
    }

    // Always chain to the previously-registered handler (Expo/Sentry/RN default)
    // so redboxes, crash logs, and SDK reporting continue to work unchanged.
    if (previousHandler) {
      previousHandler(error, isFatal);
    }
  });
}

// Install immediately on import (side-effect module — see mobile/src/app/index.tsx).
installGlobalErrorReporter();
