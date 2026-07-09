/**
 * AccountClient.tsx — PrayCalc account island (sign-in + dashboard orchestrator).
 *
 * PURPOSE: Owns session state and the sign-in/refresh lifecycle, then renders
 *   either SignIn.tsx (no session) or Dashboard.tsx (active session). Session
 *   is a lightweight client profile in localStorage ('praycalc-profile') —
 *   Hasura Auth access/refresh tokens live in httpOnly cookies set by
 *   src/pages/api/auth/*, never in this object (ADR-010 fix). Password sign-in,
 *   refresh, and sign-out go through those same-origin proxy routes
 *   (src/lib/auth/client.ts); magic-link requests still hit the shared Ummat
 *   Hasura Auth instance directly (no token involved). Billing status / checkout
 *   go through src/pages/api/billing/* (src/lib/billing.ts) — see Dashboard.tsx.
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe.
 *   Social sign-in (Google/Apple/etc.) is intentionally NOT offered — hasura-auth
 *   OAuth provider redirect URLs are not configured server-side (verified: no
 *   provider config anywhere in src/lib/auth/*), so a working social button
 *   cannot be wired without that infra. Removed rather than shipped as an inert
 *   ("coming soon") control (Wave-3 gap closure, 2026-07). On mount, migrates
 *   any pre-2026-07 session still holding a raw refresh token in localStorage
 *   into a cookie-backed session (see peekLegacyRefreshToken/clearLegacySession
 *   in session.ts).
 *   File split (2026-07, <300-line cap): SignIn.tsx + Dashboard.tsx hold the two
 *   rendered views; saved-cities.ts holds the saved-cities localStorage helpers.
 *   Behavior is unchanged from the pre-split single-file version.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts · ADR-010 fix (2026-07)
 */

import { useEffect, useRef, useState } from 'react';
import {
  buildSession,
  clearSession,
  getSession,
  saveSession,
  peekLegacyRefreshToken,
  clearLegacySession,
  type PrayCalcSession,
} from '@/lib/session';
import { refreshSession, signOut } from '@/lib/auth/client';
import SignIn from './SignIn';
import Dashboard from './Dashboard';
import ErrorBoundary from '@/islands/ErrorBoundary';

/** Milliseconds before expiry to trigger a token refresh. */
const REFRESH_LEAD_MS = 60_000;
/** Minimum delay before scheduling a refresh (avoid tight refresh loops). */
const MIN_REFRESH_DELAY_MS = 5_000;

/** Public entry point — wraps the island body in an error boundary. */
export default function AccountClient() {
  return (
    <ErrorBoundary>
      <AccountClientInner />
    </ErrorBoundary>
  );
}

function AccountClientInner() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<PrayCalcSession | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const initial = getSession();
    setSession(initial);
    setReady(true);

    // One-time migration: a pre-2026-07 build may have left a raw refresh
    // token sitting in localStorage. Exchange it server-side for a
    // cookie-backed session, then scrub the legacy record either way so the
    // token never lingers in client-readable storage.
    const legacyRefreshToken = peekLegacyRefreshToken();
    if (legacyRefreshToken) {
      refreshSession(legacyRefreshToken)
        .then((result) => {
          setSession((prev) => {
            const base = prev ?? buildSession(result.user.email);
            const migrated: PrayCalcSession = {
              ...base,
              email: result.user.email || base.email,
              displayName: result.user.displayName || base.displayName,
              accessTokenExpiresAt: result.accessTokenExpiresAt,
            };
            saveSession(migrated);
            return migrated;
          });
        })
        .catch(() => {
          // Legacy refresh token invalid/expired — nothing to migrate.
        })
        .finally(() => {
          clearLegacySession();
        });
    }

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  // Schedule/cancel token refresh whenever the session's expiry changes.
  useEffect(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (!session?.accessTokenExpiresAt) {
      return;
    }
    const delay = Math.max(
      session.accessTokenExpiresAt - REFRESH_LEAD_MS - Date.now(),
      MIN_REFRESH_DELAY_MS,
    );
    refreshTimer.current = setTimeout(() => {
      refreshSession()
        .then((result) => {
          const next: PrayCalcSession = {
            ...session,
            email: result.user.email || session.email,
            displayName: result.user.displayName || session.displayName,
            accessTokenExpiresAt: result.accessTokenExpiresAt,
          };
          saveSession(next);
          setSession(next);
        })
        .catch(() => {
          // Refresh failed — sign the user out gracefully, no crash.
          clearSession();
          setSession(null);
        });
    }, delay);
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // Intentionally narrow deps: only reschedule when the expiry changes,
    // not on every session field update (avoids refresh-timer churn).
  }, [session?.accessTokenExpiresAt]);

  // Avoid rendering the sign-in card before we know the session state
  // (prevents an account-card flash on seeded-session loads).
  if (!ready) return <div className="account-loading" aria-hidden="true" />;

  if (session) {
    return (
      <Dashboard
        session={session}
        onSignOut={() => {
          signOut().catch(() => {
            // best-effort; session is cleared client-side regardless
          });
          clearSession();
          setSession(null);
        }}
        onSessionUpdate={(s) => {
          saveSession(s);
          setSession(s);
        }}
      />
    );
  }

  return (
    <SignIn
      onSignedIn={(s) => {
        saveSession(s);
        setSession(s);
      }}
    />
  );
}
