/**
 * Purpose: "My TVs" settings tab — lists the signed-in user's paired PrayCalc TVs and
 *   lets them edit name/accent color/stream source/rotation/weather/deep-settings, add a
 *   new TV by PIN via AddTvForm, or unpair (delete).
 * Inputs: none (props-free; reads the persisted auth session directly, matching
 *   AccountTab.tsx's self-contained pattern).
 * Outputs: renders upsell (not signed in / not Ummat+), loading/error/empty states, or
 *   the TV list + inline editor + add-TV form.
 * Constraints: no `any`; gated on Ummat+ entitlement (checkEntitlement) exactly like the
 *   upsell block in AccountTab.tsx; reuses the same dark-green Tailwind conventions
 *   (bg-brand-deep/border-brand-dark inputs, bg-brand-mid buttons). The row UI lives in
 *   TvRow.tsx, deep-settings editors in TvDeepSettingsEditor.tsx, and the PIN-claim form
 *   in AddTvForm.tsx to stay under the 300-line file cap.
 * SPORT: praycalc desktop — TV management (UI).
 */
import { useState, useEffect, useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthSession, EntitlementStatus } from '../lib/auth-types';
import { loadAuthState, checkEntitlement } from '../lib/auth';
import { listTvSettings, updateTvSettings, deleteTvSettings, claimTvPairing } from '../lib/tvSettings';
import type { TvSettings, TvSettingsPatch } from '../lib/tv-types';
import AddTvForm from './AddTvForm';
import TvDeepSettingsEditor from './TvDeepSettingsEditor';
import TvRow from './TvRow';

export default function TvManager() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementStatus>({ isPlus: false });
  const [tvs, setTvs] = useState<TvSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await loadAuthState();
      setSession(s);
      if (!s) return;
      const ent = await checkEntitlement(s.accessToken);
      setEntitlement(ent);
      if (!ent.isPlus) return;
      const { tvs: rows, session: next } = await listTvSettings(s);
      setSession(next);
      setTvs(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load TVs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePatch = useCallback(
    async (id: string, patch: TvSettingsPatch) => {
      if (!session) return;
      // Optimistic UI update so sliders/inputs feel instant; rolled back on error.
      const prev = tvs;
      setTvs((cur) => cur.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      setSavingId(id);
      setError(null);
      try {
        const { tv, session: next } = await updateTvSettings(session, id, patch);
        setSession(next);
        setTvs((cur) => cur.map((t) => (t.id === id ? tv : t)));
      } catch (e) {
        setTvs(prev);
        setError(e instanceof Error ? e.message : 'Failed to save changes');
      } finally {
        setSavingId(null);
      }
    },
    [session, tvs],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!session) return;
      setSavingId(id);
      setError(null);
      try {
        const { session: next } = await deleteTvSettings(session, id);
        setSession(next);
        setTvs((cur) => cur.filter((t) => t.id !== id));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to remove TV');
      } finally {
        setSavingId(null);
        setConfirmDeleteId(null);
      }
    },
    [session],
  );

  const handleUpgrade = useCallback(() => {
    openUrl('https://praycalc.com/upgrade').catch(() => {});
  }, []);

  const handleClaim = useCallback(
    async (pin: string) => {
      if (!session) return;
      setClaiming(true);
      setError(null);
      try {
        await claimTvPairing(session, pin);
        setShowAddForm(false);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to add TV');
      } finally {
        setClaiming(false);
      }
    },
    [session, load],
  );

  if (loading) {
    return <div className="text-[11px] text-green-300/60">Loading TVs…</div>;
  }

  if (!session) {
    return (
      <div className="text-[11px] text-green-300/60">
        Sign in on the Account tab to manage your TVs.
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

      {showAddForm ? (
        <AddTvForm
          submitting={claiming}
          onClaim={(pin) => void handleClaim(pin)}
          onCancel={() => {
            setShowAddForm(false);
            setError(null);
          }}
        />
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-brand-mid hover:bg-brand-light text-brand-bg text-xs font-semibold px-3 py-1.5 rounded transition-colors"
        >
          + Add TV
        </button>
      )}

      {tvs.length === 0 ? (
        <div className="text-[11px] text-green-300/60">
          No TVs yet. Click Add TV and enter the 6-digit code shown on your TV.
        </div>
      ) : (
        tvs.map((tv) => (
          <TvRow
            key={tv.id}
            tv={tv}
            saving={savingId === tv.id}
            confirmingDelete={confirmDeleteId === tv.id}
            onPatch={(patch) => void handlePatch(tv.id, patch)}
            onDeleteRequest={() => setConfirmDeleteId(tv.id)}
            onDeleteCancel={() => setConfirmDeleteId(null)}
            onDeleteConfirm={() => void handleDelete(tv.id)}
          >
            <TvDeepSettingsEditor tv={tv} onPatch={(patch) => void handlePatch(tv.id, patch)} />
          </TvRow>
        ))
      )}
    </div>
  );
}

