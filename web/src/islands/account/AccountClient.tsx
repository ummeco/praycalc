/**
 * AccountClient.tsx — PrayCalc account island (sign-in + dashboard).
 *
 * PURPOSE: Full account experience in one client island:
 *   - Sign-in card (magic-link default tab + password tab + social row) when no session.
 *   - Dashboard (profile, account settings, Ummat+ upsell, sign out) when a session exists.
 *   Session is the lightweight client profile in localStorage ('praycalc-session').
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe.
 *   Mock client auth — any email+password signs in (account.spec.ts contract).
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts
 */

import { useEffect, useState } from 'react';
import {
  buildSession,
  clearSession,
  getSession,
  saveSession,
  type PrayCalcSession,
} from '@/lib/session';

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

export default function AccountClient() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<PrayCalcSession | null>(null);

  useEffect(() => {
    setSession(getSession());
    setReady(true);
  }, []);

  // Avoid rendering the sign-in card before we know the session state
  // (prevents an account-card flash on seeded-session loads).
  if (!ready) return <div className="account-loading" aria-hidden="true" />;

  if (session) {
    return (
      <Dashboard
        session={session}
        onSignOut={() => {
          clearSession();
          setSession(null);
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

  const submitDisabled = mode === 'magic' ? !email.trim() : !(email.trim() && password);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    // Magic-link mode would email a link; for the mock client flow we only
    // complete sign-in for the password path (account.spec drives password).
    if (mode === 'password') {
      onSignedIn(buildSession(email));
    }
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
          onClick={() => setMode('magic')}
        >
          Login Link
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          className={`account-mode-tab${mode === 'password' ? ' account-mode-tab--active' : ''}`}
          onClick={() => setMode('password')}
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
        <button type="submit" className="account-submit-btn" disabled={submitDisabled}>
          {mode === 'magic' ? 'Send login link' : 'Sign in'}
        </button>
      </form>

      <div className="account-social-row" aria-label="Sign in with a provider">
        {SOCIAL_PROVIDERS.map((p) => (
          <button key={p} type="button" className="account-social-btn" aria-label={`Sign in with ${p}`}>
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
}: {
  session: PrayCalcSession;
  onSignOut: () => void;
}) {
  const [cities, setCities] = useState<SavedCity[]>([]);

  useEffect(() => {
    setCities(getSavedCities());
  }, []);

  function handleRemoveCity(slug: string) {
    setCities(removeSavedCity(slug));
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

      {!session.isUmmatPlus && (
        <div className="dashboard-plus-card">
          <div className="dashboard-plus-header">
            <span className="dashboard-plus-name">Ummat+</span>
            <span className="dashboard-plus-price">$2.99/mo</span>
          </div>
          <p className="dashboard-plus-tagline">Unlock adhan voices, calendar exports, and more.</p>
          <button type="button" className="dashboard-plus-btn">Upgrade to Ummat+</button>
        </div>
      )}

      <button type="button" className="dashboard-signout-btn" onClick={onSignOut}>
        Sign out
      </button>
    </div>
  );
}
