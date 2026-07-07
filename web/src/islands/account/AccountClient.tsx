/**
 * AccountClient.tsx — PrayCalc account island (sign-in + dashboard).
 *
 * PURPOSE: Full account experience in one client island:
 *   - Sign-in card (magic-link default tab + password tab) when no session.
 *   - Dashboard (profile, saved cities, account settings, Ummat+ upsell, sign out)
 *     when a session exists.
 *   Session is a lightweight client profile in localStorage ('praycalc-profile') —
 *   Hasura Auth access/refresh tokens live in httpOnly cookies set by
 *   src/pages/api/auth/*, never in this object (ADR-010 fix). Password sign-in,
 *   refresh, and sign-out go through those same-origin proxy routes
 *   (src/lib/auth/client.ts); magic-link requests still hit the shared Ummat
 *   Hasura Auth instance directly (no token involved). Billing status / checkout
 *   go through src/pages/api/billing/* (src/lib/billing.ts).
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe.
 *   Social sign-in (Google/Apple/etc.) is intentionally NOT offered — hasura-auth
 *   OAuth provider redirect URLs are not configured server-side (verified: no
 *   provider config anywhere in src/lib/auth/*), so a working social button
 *   cannot be wired without that infra. Removed rather than shipped as an inert
 *   ("coming soon") control (Wave-3 gap closure, 2026-07). On mount, migrates
 *   any pre-2026-07 session still holding a raw refresh token in localStorage
 *   into a cookie-backed session (see peekLegacyRefreshToken/clearLegacySession
 *   in session.ts).
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts · ADR-010 fix (2026-07)
 */

import { useEffect, useRef, useState } from 'react';
import {
  buildSession,
  clearSession,
  getSession,
  saveSession,
  hasValidToken,
  peekLegacyRefreshToken,
  clearLegacySession,
  type PrayCalcSession,
} from '@/lib/session';
import { signIn, requestMagicLink, refreshSession, signOut } from '@/lib/auth/client';
import { getBillingStatus, startCheckout, isBillingDisabled } from '@/lib/billing';

// ── Saved-cities localStorage helpers ──────────────────────────────────────
const CITIES_KEY = 'praycalc-saved-cities';

interface SavedCity {
  slug: string;
  displayName: string;
  savedAt: number;
}

function getSavedCities(): SavedCity[] {
  try {
    return JSON.parse(localStorage.getItem(CITIES_KEY) ?? '[]') as SavedCity[];
  } catch {
    return [];
  }
}

function removeSavedCity(slug: string): SavedCity[] {
  const updated = getSavedCities().filter((c) => c.slug !== slug);
  localStorage.setItem(CITIES_KEY, JSON.stringify(updated));
  return updated;
}

type Mode = 'magic' | 'password';

/** Milliseconds before expiry to trigger a token refresh. */
const REFRESH_LEAD_MS = 60_000;
/** Minimum delay before scheduling a refresh (avoid tight refresh loops). */
const MIN_REFRESH_DELAY_MS = 5_000;

export default function AccountClient() {
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

// ───────────────────────────────────────────────────────────────────────────
// Sign-in card
// ───────────────────────────────────────────────────────────────────────────

function SignIn({ onSignedIn }: { onSignedIn: (s: PrayCalcSession) => void }) {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const submitDisabled =
    loading || (mode === 'magic' ? !email.trim() : !(email.trim() && password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setError(null);

    if (mode === 'magic') {
      setLoading(true);
      try {
        await requestMagicLink(email.trim());
        setMagicLinkSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send login link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      const session: PrayCalcSession = {
        ...buildSession(result.user.email || email, result.user.displayName),
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      };
      onSignedIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'magic' && magicLinkSent) {
    return (
      <div className="account-card">
        <a href="/" className="account-logo-back" aria-label="Back to PrayCalc">
          <span aria-hidden="true">←</span>
          <img src="/logo-sunrise.svg" alt="PrayCalc" width="28" height="28" />
        </a>
        <h1 className="account-title">Check your email</h1>
        <p className="account-magic-sent">
          We sent a login link to <strong>{email.trim()}</strong>. Click it to sign in.
        </p>
        <button
          type="button"
          className="account-submit-btn"
          onClick={() => {
            setMagicLinkSent(false);
            setError(null);
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="account-card">
      <a href="/" className="account-logo-back" aria-label="Back to PrayCalc">
        <span aria-hidden="true">←</span>
        <img src="/logo-sunrise.svg" alt="PrayCalc" width="28" height="28" />
      </a>

      <h1 className="account-title">Sign in to PrayCalc</h1>

      <div className="account-mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'magic'}
          className={`account-mode-tab${mode === 'magic' ? ' account-mode-tab--active' : ''}`}
          onClick={() => {
            setMode('magic');
            setError(null);
          }}
        >
          Login Link
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          className={`account-mode-tab${mode === 'password' ? ' account-mode-tab--active' : ''}`}
          onClick={() => {
            setMode('password');
            setError(null);
          }}
        >
          Password
        </button>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="account-input"
          placeholder="you@example.com"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode === 'password' && (
          <input
            type="password"
            className="account-input"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="account-submit-btn" disabled={submitDisabled}>
          {loading ? 'Please wait…' : mode === 'magic' ? 'Send login link' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────
// Dashboard
// ───────────────────────────────────────────────────────────────────────────

function Dashboard({
  session,
  onSignOut,
  onSessionUpdate,
}: {
  session: PrayCalcSession;
  onSignOut: () => void;
  onSessionUpdate: (s: PrayCalcSession) => void;
}) {
  const [cities, setCities] = useState<SavedCity[]>([]);
  const [isPlus, setIsPlus] = useState(session.isUmmatPlus);
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable' | 'error'>('idle');

  useEffect(() => {
    setCities(getSavedCities());
  }, []);

  // Fetch real billing status on mount when we have a live token.
  useEffect(() => {
    if (!hasValidToken(session)) return;
    let cancelled = false;
    getBillingStatus().then((status) => {
      if (cancelled) return;
      const plus = status.plan === 'plus' && status.isActive;
      setIsPlus(plus);
      if (plus !== session.isUmmatPlus) {
        onSessionUpdate({ ...session, isUmmatPlus: plus });
      }
    });
    return () => {
      cancelled = true;
    };
    // Intentionally narrow deps: re-fetch billing status only when the token
    // expiry changes, not on every session field update (onSessionUpdate is
    // stable per render cycle from the parent's perspective here).
  }, [session.accessTokenExpiresAt]);

  function handleRemoveCity(slug: string) {
    setCities(removeSavedCity(slug));
  }

  async function handleUpgradeClick() {
    if (isBillingDisabled() || !hasValidToken(session)) {
      setCheckoutState('unavailable');
      return;
    }
    setCheckoutState('loading');
    const result = await startCheckout();
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    // Transient failure (network/expired token) — retryable, NOT the permanent
    // billing-disabled 'unavailable' state.
    setCheckoutState('error');
  }

  return (
    <div className="dashboard-page">
      <a href="/" className="account-back" aria-label="Back to PrayCalc">
        ← PrayCalc
      </a>

      <div className="dashboard-profile-card">
        <div className="dashboard-avatar" aria-hidden="true">{session.initials}</div>
        <div className="dashboard-profile-info">
          <div className="dashboard-display-name">
            {session.displayName}
            {session.isOwner && <span className="dashboard-owner-badge">Owner</span>}
          </div>
          <div className="dashboard-email">{session.email}</div>
        </div>
      </div>

      <div className="dashboard-card">
        <h2 className="dashboard-card-title">Saved Cities</h2>
        {cities.length === 0 ? (
          <p className="dashboard-settings-row">No saved cities yet. Visit a city page to save it.</p>
        ) : (
          <ul className="dashboard-cities-list" aria-label="Saved cities">
            {cities.map((city) => (
              <li key={city.slug} className="dashboard-city-row">
                <a href={`/${city.slug}`} className="dashboard-city-link">
                  {city.displayName}
                </a>
                <button
                  type="button"
                  className="dashboard-city-remove"
                  aria-label={`Remove ${city.displayName}`}
                  onClick={() => handleRemoveCity(city.slug)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="dashboard-card">
        <h2 className="dashboard-card-title">Account Settings</h2>
        <p className="dashboard-settings-row">Manage your profile, preferences, and home city.</p>
      </div>

      <div className="dashboard-card">
        <h2 className="dashboard-card-title">My TVs</h2>
        <p className="dashboard-settings-row">
          Manage TVs paired to your account.{' '}
          <a href="/account/tvs" className="dashboard-tvs-link">
            View my TVs →
          </a>
        </p>
      </div>

      {!isPlus && (
        <div className="dashboard-plus-card">
          <div className="dashboard-plus-header">
            <span className="dashboard-plus-name">Ummat+</span>
            <span className="dashboard-plus-price">$9.99/yr</span>
          </div>
          <p className="dashboard-plus-tagline">
            Unlock the TV app, Smart Home integrations, adhan voices, calendar exports, and more.
          </p>
          <button
            type="button"
            className="dashboard-plus-btn"
            onClick={handleUpgradeClick}
            disabled={checkoutState === 'loading' || checkoutState === 'unavailable'}
          >
            {checkoutState === 'loading'
              ? 'Please wait…'
              : checkoutState === 'unavailable'
                ? 'Ummat+ launching soon'
                : checkoutState === 'error'
                  ? 'Something went wrong — try again'
                  : 'Upgrade to Ummat+'}
          </button>
        </div>
      )}

      <button type="button" className="dashboard-signout-btn" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}
