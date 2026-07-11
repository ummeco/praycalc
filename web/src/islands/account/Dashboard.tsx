/**
 * Dashboard.tsx — Account dashboard (profile, saved cities, settings, billing, sign out).
 *
 * PURPOSE: Renders when AccountClient has an active session. Shows profile
 *   summary, saved cities (removable), account-settings/TV links, the
 *   Ummat+ upsell card (billing status fetched live when a valid token
 *   exists), and sign-out.
 * INPUTS: session (PrayCalcSession), onSignOut, onSessionUpdate callbacks
 * OUTPUTS: Dashboard UI; calls onSignOut/onSessionUpdate on user actions.
 * CONSTRAINTS: Astro island child (rendered only inside AccountClient's
 *   client:load boundary). No next/* imports. Extracted from AccountClient.tsx
 *   (2026-07 file-size split) — behavior unchanged.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts
 */

import { useEffect, useState } from 'react';
import { hasValidToken, type PrayCalcSession } from '@/lib/session';
import { getBillingStatus, startCheckout, isBillingDisabled } from '@/lib/billing';
import { getSavedCities, removeSavedCity, type SavedCity } from './saved-cities';
import SmartHomeSection from './SmartHomeSection';

export default function Dashboard({
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

      <SmartHomeSection isPlus={isPlus} />

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
