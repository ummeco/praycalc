/**
 * Purpose: "Smart Home" settings tab — lists the signed-in user's linked
 *   smart-home/voice providers (Alexa, Google Home, Home Assistant), lets
 *   them unlink one (inline confirm, mirroring TvManager.tsx's delete
 *   pattern), and explains how to link a new one. Linking itself always
 *   starts from the assistant's own app — this tab never initiates OAuth.
 * Inputs: none (props-free; reads the persisted auth session directly,
 *   matching AccountTab.tsx/TvManager.tsx's self-contained pattern).
 * Outputs: renders sign-in prompt, Ummat+ upsell, loading/error/empty states,
 *   or the linked-provider list.
 * Constraints: no `any`; gated on Ummat+ entitlement exactly like TvManager.tsx.
 *   lib/smartHome.ts fetches smart.praycalc.com directly (no server-side
 *   proxy layer on desktop) — see that file's CORS note; failures render as
 *   an inline error rather than crashing the tab.
 * SPORT: praycalc desktop — Smart Home linking (UI).
 */
import { useState, useEffect, useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthSession, EntitlementStatus } from '../lib/auth-types';
import { loadAuthState, checkEntitlement } from '../lib/auth';
import {
  listLinks,
  unlinkProvider,
  PROVIDER_META,
  type LinkedProvider,
  type SmartHomeProvider,
} from '../lib/smartHome';

const SMART_HOME_DOCS_URL = 'https://praycalc.org/features/smart-home';

export default function SmartHomeManager() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementStatus>({ isPlus: false });
  const [links, setLinks] = useState<LinkedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmProvider, setConfirmProvider] = useState<SmartHomeProvider | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<SmartHomeProvider | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await loadAuthState();
      setSession(s);
      if (!s) return;
      const ent = await checkEntitlement(s.accessToken, s.email);
      setEntitlement(ent);
      if (!ent.isPlus) return;
      const result = await listLinks(s);
      if (result.ok) {
        setLinks(result.links);
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUnlink = useCallback(
    async (provider: SmartHomeProvider) => {
      if (!session) return;
      setUnlinkingId(provider);
      setError(null);
      const result = await unlinkProvider(session, provider);
      setUnlinkingId(null);
      setConfirmProvider(null);
      if (result.ok) {
        setLinks((cur) => cur.filter((l) => l.provider !== provider));
      } else {
        setError(result.error);
      }
    },
    [session],
  );

  const handleUpgrade = useCallback(() => {
    openUrl('https://praycalc.com/upgrade').catch(() => {});
  }, []);

  const handleLearnMore = useCallback(() => {
    openUrl(SMART_HOME_DOCS_URL).catch(() => {});
  }, []);

  if (loading) {
    return <div className="text-[11px] text-green-300/60">Loading Smart Home…</div>;
  }

  if (!session) {
    return (
      <div className="text-[11px] text-green-300/60">
        Sign in on the Account tab to manage Smart Home links.
      </div>
    );
  }

  if (!entitlement.isPlus) {
    return (
      <div className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 space-y-2">
        <div className="text-sm text-green-100 font-medium">Ummat+ — $9.99/yr</div>
        <div className="text-[11px] text-green-300/60">Unlocks TV &amp; Smart Home</div>
        <button
          onClick={handleUpgrade}
          className="bg-brand-mid hover:bg-brand-light text-brand-bg text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        >
          Upgrade
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <div className="text-[11px] text-red-400">{error}</div>}

      {links.length === 0 ? (
        <div className="text-[11px] text-green-300/60">
          No smart-home accounts linked yet. Open the Alexa app or Google Home app, search for the
          PrayCalc skill or action, and link your Ummat account.
        </div>
      ) : (
        links.map((link) => {
          const meta = PROVIDER_META[link.provider];
          const confirming = confirmProvider === link.provider;
          return (
            <div
              key={link.provider}
              className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 flex items-center justify-between gap-2"
            >
              <div>
                <div className="text-sm text-green-100">
                  {meta?.icon} {meta?.label ?? link.provider}
                </div>
                <div className="text-[11px] text-green-300/60">
                  Linked {new Date(link.linked_at).toLocaleDateString()}
                </div>
              </div>
              {confirming ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleUnlink(link.provider)}
                    disabled={unlinkingId === link.provider}
                    className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {unlinkingId === link.provider ? 'Please wait…' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setConfirmProvider(null)}
                    className="text-white/55 hover:text-white text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmProvider(link.provider)}
                  className="text-white/55 hover:text-red-400 text-xs font-medium transition-colors"
                >
                  Unlink
                </button>
              )}
            </div>
          );
        })
      )}

      <button
        onClick={handleLearnMore}
        className="text-brand-light hover:text-brand-mid text-[11px] font-medium transition-colors"
      >
        How to link a provider →
      </button>
    </div>
  );
}
