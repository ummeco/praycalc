/**
 * SmartHomeSection.tsx — "Smart Home" account-linking card for the Dashboard.
 *
 * PURPOSE: Shows which smart-home/voice providers (Alexa, Google Home, Home
 *   Assistant) are linked to the signed-in user's account, lets them unlink
 *   one (inline confirm, mirroring TvCard.tsx's delete pattern), and explains
 *   how to link a new one. Linking itself always starts from the assistant's
 *   own app (Alexa / Google Home) — this section never initiates OAuth.
 * INPUTS: isPlus — the Ummat+ gate, computed once by the parent Dashboard so
 *   this section doesn't duplicate its own billing-status fetch.
 * OUTPUTS: renders a compact Ummat+ note (free), loading, empty/guidance, or
 *   the linked-provider list with inline unlink confirm.
 * CONSTRAINTS: Astro island child (client:load parent, same as Dashboard.tsx
 *   siblings). No next/* imports. SSR-safe (fetch happens in useEffect).
 * REF: src/lib/smart-home/client.ts · src/islands/account/TvCard.tsx (confirm
 *   pattern) · src/islands/account/Dashboard.tsx
 */

import { useEffect, useState, useCallback } from 'react';
import {
  listLinks,
  unlinkProvider,
  PROVIDER_META,
  type LinkedProvider,
  type SmartHomeProvider,
} from '@/lib/smart-home/client';

const SMART_HOME_DOCS_URL = 'https://praycalc.org/features/smart-home';

type LoadState = 'loading' | 'ready';

export default function SmartHomeSection({ isPlus }: { isPlus: boolean }) {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [links, setLinks] = useState<LinkedProvider[]>([]);
  const [confirmProvider, setConfirmProvider] = useState<SmartHomeProvider | null>(null);
  const [unlinking, setUnlinking] = useState<SmartHomeProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPlus) return;
    let cancelled = false;
    listLinks().then((result) => {
      if (cancelled) return;
      setLinks(result);
      setLoadState('ready');
    });
    return () => {
      cancelled = true;
    };
  }, [isPlus]);

  const handleUnlink = useCallback(async (provider: SmartHomeProvider) => {
    setUnlinking(provider);
    setError(null);
    const result = await unlinkProvider(provider);
    setUnlinking(null);
    setConfirmProvider(null);
    if (result.ok) {
      setLinks((prev) => prev.filter((l) => l.provider !== provider));
    } else {
      setError(result.error);
    }
  }, []);

  if (!isPlus) {
    return (
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">Smart Home</h2>
        <p className="dashboard-settings-row">
          Link Alexa, Google Home, or Home Assistant to control PrayCalc during salah. Part of{' '}
          <a href="/upgrade" className="dashboard-tvs-link">Ummat+</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <h2 className="dashboard-card-title">Smart Home</h2>

      {error && <p className="account-error">{error}</p>}

      {loadState === 'loading' ? (
        <div className="account-loading" aria-hidden="true" />
      ) : (
        <>
          {links.length === 0 ? (
            <p className="dashboard-settings-row">No smart-home accounts linked yet.</p>
          ) : (
            <ul className="dashboard-smarthome-list" aria-label="Linked smart-home accounts">
              {links.map((link) => {
                const meta = PROVIDER_META[link.provider];
                const confirming = confirmProvider === link.provider;
                return (
                  <li key={link.provider} className="dashboard-smarthome-row">
                    <div className="dashboard-smarthome-info">
                      <span className="dashboard-smarthome-icon" aria-hidden="true">
                        {meta?.icon ?? '🔗'}
                      </span>
                      <div>
                        <div className="dashboard-smarthome-name">{meta?.label ?? link.provider}</div>
                        <div className="dashboard-smarthome-date">
                          Linked {new Date(link.linked_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {confirming ? (
                      <div className="dashboard-tv-confirm-row">
                        <span className="dashboard-tv-confirm-text">Unlink?</span>
                        <button
                          type="button"
                          className="dashboard-tv-confirm-btn"
                          disabled={unlinking === link.provider}
                          onClick={() => void handleUnlink(link.provider)}
                        >
                          {unlinking === link.provider ? 'Please wait…' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          className="dashboard-tv-cancel-btn"
                          onClick={() => setConfirmProvider(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="dashboard-tv-remove-btn"
                        onClick={() => setConfirmProvider(link.provider)}
                      >
                        Unlink
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <p className="dashboard-settings-row dashboard-smarthome-guidance">
            To link {links.length === 0 ? 'a' : 'another'} provider, open the Alexa app or Google Home
            app, search for the PrayCalc skill or action, and link your Ummat account.{' '}
            <a href={SMART_HOME_DOCS_URL} className="dashboard-tvs-link">
              Learn more →
            </a>
          </p>
        </>
      )}
    </div>
  );
}
