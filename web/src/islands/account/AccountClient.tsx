/**
 * AccountClient.tsx — PrayCalc account island (sign-in + dashboard).
 *
 * PURPOSE: Full account experience in one client island:
 *   - Sign-in card (magic-link default tab + password tab + social row) when no session.
 *   - Dashboard (profile, saved cities, account settings, Ummat+ upsell, sign out)
 *     when a session exists.
 *   Session is the lightweight client profile (+ optional tokens) in localStorage
 *   ('praycalc-session'). Password sign-in and magic-link requests hit the shared
 *   Ummat Hasura Auth instance directly (src/lib/auth/client.ts). Billing status /
 *   checkout hit the praycalc "smart" service (src/lib/billing.ts).
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe.
 *   Social sign-in providers are visually present but inert ("coming soon") —
 *   not wired to any backend yet.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts · real-auth task (2026-07)
 */

import { useEffect, useRef, useState } from 'react';
import {
  buildSession,
  clearSession,
  getSession,
  saveSession,
  hasValidToken,
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

const SOCIAL_PROVIDERS = ['Google', 'Apple', 'Facebook', 'X'] as const;

/** Milliseconds before expiry to trigger a token refresh. */
const REFRESH_LEAD_MS = 60_000;
/** Minimum delay before scheduling a refresh (avoid tight refresh loops). */
const MIN_REFRESH_DELAY_MS = 5_000;

export default function AccountClient() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<PrayCalcSession | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, []);

  // Schedule/cancel token refresh whenever the session changes.
  useEffect(() => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    }
    if (!session?.accessToken || !session.refreshToken || !session.accessTokenExpiresAt) {
      return;
    }
    const delay = Math.max(
      session.accessTokenExpiresAt - REFRESH_LEAD_MS - Date.now(),
      MIN_REFRESH_DELAY_MS,
    );
    const rt = session.refreshToken;
    refreshTimer.current = setTimeout(() => {
      refreshSession(rt)
        .then((result) => {
          const next: PrayCalcSession = {
            ...session,
            email: result.user.email || session.email,
            displayName: result.user.displayName || session.displayName,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            accessTokenExpiresAt: result.tokens.accessTokenExpiresAt,
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
    // Intentionally narrow deps: only reschedule when the token identity changes,
    // not on every session field update (avoids refresh-timer churn).
  }, [session?.accessToken, session?.refreshToken, session?.accessTokenExpiresAt]);

  // Avoid rendering the sign-in card before we know the session state
  // (prevents an account-card flash on seeded-session loads).
  if (!ready) return <div className="account-loading" aria-hidden="true" />;

  if (session) {
    return (
      <Dashboard
        session={session}
        onSignOut={() => {
          const rt = session.refreshToken;
          if (rt) {
            signOut(rt).catch(() => {
              // best-effort; session is cleared client-side regardless
            });
          }
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
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        accessTokenExpiresAt: result.tokens.accessTokenExpiresAt,
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

      <div className="account-social-row" aria-label="Sign in with a provider">
        {SOCIAL_PROVIDERS.map((p) => (
          <button
            key={p}
            type="button"
            className="account-social-btn"
            aria-label={`Sign in with ${p}`}
            title="Coming soon"
            disabled
          >
            {p[0]}
          </button>
        ))}
      </div>
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
  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'unavailable'>('idle');

  useEffect(() => {
    setCities(getSavedCities());
  }, []);

  // Fetch real billing status on mount when we have a live token.
  useEffect(() => {
    if (!hasValidToken(session)) return;
    let cancelled = false;
    getBillingStatus(session.accessToken!).then((status) => {
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
    // changes, not on every session field update (onSessionUpdate is stable
    // per render cycle from the parent's perspective here).
  }, [session.accessToken]);

  function handleRemoveCity(slug: string) {
    setCities(removeSavedCity(slug));
  }

  async function handleUpgradeClick() {
    if (isBillingDisabled() || !hasValidToken(session)) {
      setCheckoutState('unavailable');
      return;
    }
    setCheckoutState('loading');
    const result = await startCheckout(session.accessToken!);
    if (result.ok) {
      window.location.href = result.url;
      return;
    }
    setCheckoutState('unavailable');
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
