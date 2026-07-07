/**
 * Purpose: "My TVs" settings tab — lists the signed-in user's paired PrayCalc TVs and
 *   lets them edit name/accent color/stream source/rotation/weather, or unpair (delete).
 * Inputs: none (props-free; reads the persisted auth session directly, matching
 *   AccountTab.tsx's self-contained pattern).
 * Outputs: renders upsell (not signed in / not Ummat+), loading/error/empty states, or
 *   the TV list + inline editor.
 * Constraints: no `any`; gated on Ummat+ entitlement (checkEntitlement) exactly like the
 *   upsell block in AccountTab.tsx; reuses the same dark-green Tailwind conventions
 *   (bg-brand-deep/border-brand-dark inputs, bg-brand-mid buttons); delete uses an inline
 *   two-step confirm (no modal component exists in this app) instead of window.confirm,
 *   which does not render inside the tray webview shell.
 * SPORT: praycalc desktop — TV management (UI).
 */
import { useState, useEffect, useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthSession, EntitlementStatus } from '../lib/auth-types';
import { loadAuthState, checkEntitlement } from '../lib/auth';
import { listTvSettings, updateTvSettings, deleteTvSettings } from '../lib/tvSettings';
import type { TvSettings, TvSettingsPatch, TvStreamSource } from '../lib/tv-types';
import {
  ACCENT_COLOR_PRESETS,
  STREAM_SOURCE_OPTIONS,
  MIN_ROTATE_MINUTES,
  MAX_ROTATE_MINUTES,
} from '../lib/tv-types';

export default function TvManager() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementStatus>({ isPlus: false });
  const [tvs, setTvs] = useState<TvSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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

  if (loading) {
    return <div className="text-[11px] text-green-300/50">Loading TVs…</div>;
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

      {tvs.length === 0 ? (
        <div className="text-[11px] text-green-300/60">
          Pair a TV from the mobile app.
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
          />
        ))
      )}
    </div>
  );
}

function TvRow({
  tv,
  saving,
  confirmingDelete,
  onPatch,
  onDeleteRequest,
  onDeleteCancel,
  onDeleteConfirm,
}: {
  tv: TvSettings;
  saving: boolean;
  confirmingDelete: boolean;
  onPatch: (patch: TvSettingsPatch) => void;
  onDeleteRequest: () => void;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void;
}) {
  const [name, setName] = useState(tv.name);

  useEffect(() => {
    setName(tv.name);
  }, [tv.name]);

  return (
    <div className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 space-y-2.5">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            if (name.trim() && name !== tv.name) onPatch({ name: name.trim() });
          }}
          className="flex-1 min-w-0 bg-transparent border-b border-brand-dark text-sm text-green-100 font-medium focus:outline-none focus:border-brand-mid px-0.5 py-0.5"
          placeholder="TV name"
        />
        {saving && <span className="text-[10px] text-green-300/40 flex-shrink-0">Saving…</span>}
      </div>

      <div>
        <span className="text-[11px] text-green-300/60 block mb-1">Accent color</span>
        <div className="flex gap-1.5">
          {ACCENT_COLOR_PRESETS.map((color) => (
            <button
              key={color}
              onClick={() => onPatch({ accent_color: color })}
              className={`w-5 h-5 rounded-full transition-transform ${
                tv.accent_color === color ? 'ring-2 ring-offset-1 ring-offset-brand-deep ring-brand-light scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Stream source</span>
        <select
          value={tv.stream_source}
          onChange={(e) => onPatch({ stream_source: e.target.value as TvStreamSource })}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        >
          {STREAM_SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Rotate every (minutes)</span>
        <input
          type="number"
          min={MIN_ROTATE_MINUTES}
          max={MAX_ROTATE_MINUTES}
          value={tv.rotate_minutes}
          onChange={(e) => {
            const v = Math.min(MAX_ROTATE_MINUTES, Math.max(MIN_ROTATE_MINUTES, parseInt(e.target.value, 10) || MIN_ROTATE_MINUTES));
            onPatch({ rotate_minutes: v });
          }}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        />
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tv.show_weather}
          onChange={(e) => onPatch({ show_weather: e.target.checked })}
          className="accent-brand-mid w-4 h-4"
        />
        <span className="text-sm text-green-200/90">Show weather</span>
      </label>

      <div className="pt-1 border-t border-brand-dark/40">
        {confirmingDelete ? (
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-red-400">Remove this TV?</span>
            <div className="flex gap-2">
              <button
                onClick={onDeleteCancel}
                className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirm}
                className="text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={onDeleteRequest}
            className="text-white/30 hover:text-red-400 text-xs transition-colors"
          >
            Remove TV
          </button>
        )}
      </div>
    </div>
  );
}
