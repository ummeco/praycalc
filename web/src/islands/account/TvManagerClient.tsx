/**
 * TvManagerClient.tsx — PrayCalc "My TVs" management island.
 *
 * PURPOSE: Full CRUD UI for the signed-in user's paired TVs (pc_tv_settings):
 *   list, inline rename/accent-color/stream/rotation/weather edits, and
 *   delete-with-confirm. Ummat+ gate mirrors AccountClient's dashboard —
 *   non-Plus users see an upgrade prompt instead of the manager.
 * INPUTS: none (reads its own data via src/lib/tv/client.ts on mount).
 * OUTPUTS: none — self-contained island.
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe (all
 *   data fetching happens in useEffect, after mount). All CRUD goes through
 *   the same-origin /api/tvs route — never calls Hasura directly.
 * REF: src/islands/account/AccountClient.tsx (dashboard/Plus-gate pattern) ·
 *   src/lib/tv/client.ts · src/pages/account/tvs.astro
 */

import { useEffect, useState } from 'react';
import { getBillingStatus } from '@/lib/billing';
import { listTvs, updateTv, deleteTv, type TvSetting, type TvStreamSource } from '@/lib/tv/client';

const ACCENT_PRESETS = ['#79C24C', '#C9F27A', '#1E5E2F', '#3B82F6', '#F59E0B', '#EF4444'] as const;
const DEFAULT_ACCENT = '#79C24C';

const STREAM_OPTIONS: { value: TvStreamSource; label: string }[] = [
  { value: 'makkah-tv', label: 'Makkah Live' },
  { value: 'saudi-quran', label: 'Saudi Quran Channel' },
  { value: 'medina', label: 'Medina Live' },
];

type LoadState = 'loading' | 'ready' | 'error';
type PlusState = 'checking' | 'plus' | 'free';

export default function TvManagerClient() {
  const [plusState, setPlusState] = useState<PlusState>('checking');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [tvs, setTvs] = useState<TvSetting[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBillingStatus().then((status) => {
      if (cancelled) return;
      setPlusState(status.plan === 'plus' && status.isActive ? 'plus' : 'free');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (plusState !== 'plus') return;
    let cancelled = false;
    setLoadState('loading');
    listTvs().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setTvs(result.tvs);
        setLoadState('ready');
      } else {
        setLoadError(result.error);
        setLoadState('error');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [plusState]);

  function handleTvUpdated(updated: TvSetting) {
    setTvs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTvDeleted(id: string) {
    setTvs((prev) => prev.filter((t) => t.id !== id));
  }

  if (plusState === 'checking') {
    return <div className="account-loading" aria-hidden="true" />;
  }

  if (plusState === 'free') {
    return (
      <div className="dashboard-plus-card">
        <div className="dashboard-plus-header">
          <span className="dashboard-plus-name">Ummat+</span>
          <span className="dashboard-plus-price">$9.99/yr</span>
        </div>
        <p className="dashboard-plus-tagline">
          TV management is part of Ummat+. Upgrade to pair and customize TVs running the
          PrayCalc TV app.
        </p>
        <a href="/upgrade" className="dashboard-plus-btn">
          Upgrade to Ummat+
        </a>
      </div>
    );
  }

  if (loadState === 'loading') {
    return <div className="account-loading" aria-hidden="true" />;
  }

  if (loadState === 'error') {
    return (
      <p className="account-error" role="alert">
        {loadError}
      </p>
    );
  }

  if (tvs.length === 0) {
    return (
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">My TVs</h2>
        <p className="dashboard-settings-row">
          Pair a TV from the mobile app to see it here. Open PrayCalc on your phone, go to
          Settings → TV Pairing, and follow the on-screen code.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-tvs-list" aria-label="Your paired TVs">
      {tvs.map((tv) => (
        <TvCard key={tv.id} tv={tv} onUpdated={handleTvUpdated} onDeleted={handleTvDeleted} />
      ))}
    </div>
  );
}

function TvCard({
  tv,
  onUpdated,
  onDeleted,
}: {
  tv: TvSetting;
  onUpdated: (tv: TvSetting) => void;
  onDeleted: (id: string) => void;
}) {
  const [name, setName] = useState(tv.name);
  const [accentColor, setAccentColor] = useState(tv.accent_color || DEFAULT_ACCENT);
  const [streamSource, setStreamSource] = useState<TvStreamSource>(tv.stream_source);
  const [rotateMinutes, setRotateMinutes] = useState(tv.rotate_minutes);
  const [showWeather, setShowWeather] = useState(tv.show_weather);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty =
    name !== tv.name ||
    accentColor !== tv.accent_color ||
    streamSource !== tv.stream_source ||
    rotateMinutes !== tv.rotate_minutes ||
    showWeather !== tv.show_weather;

  async function handleSave() {
    if (!dirty || saving) return;
    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (rotateMinutes < 1 || rotateMinutes > 30) {
      setError('Rotation must be between 1 and 30 minutes.');
      return;
    }
    setSaving(true);
    setError(null);
    const result = await updateTv(tv.id, {
      name: name.trim(),
      accent_color: accentColor,
      stream_source: streamSource,
      rotate_minutes: rotateMinutes,
      show_weather: showWeather,
    });
    setSaving(false);
    if (result.ok && 'tv' in result) {
      onUpdated(result.tv);
    } else if (!result.ok) {
      setError(result.error);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteTv(tv.id);
    setDeleting(false);
    if (result.ok) {
      onDeleted(tv.id);
    } else {
      setError(result.error);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="dashboard-card dashboard-tv-card">
      <div className="dashboard-tv-header">
        <span
          className="dashboard-tv-swatch"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <input
          type="text"
          className="account-input dashboard-tv-name-input"
          aria-label="TV name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {tv.city && <p className="dashboard-tv-city">{tv.city}</p>}

      <div className="dashboard-tv-field">
        <label htmlFor={`stream-${tv.id}`} className="dashboard-tv-label">
          Stream source
        </label>
        <select
          id={`stream-${tv.id}`}
          className="account-input"
          value={streamSource}
          onChange={(e) => setStreamSource(e.target.value as TvStreamSource)}
        >
          {STREAM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-tv-field">
        <span className="dashboard-tv-label">Accent color</span>
        <div className="dashboard-tv-swatches" role="radiogroup" aria-label="Accent color">
          {ACCENT_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={accentColor.toLowerCase() === color.toLowerCase()}
              aria-label={color}
              className={`dashboard-tv-swatch-btn${
                accentColor.toLowerCase() === color.toLowerCase()
                  ? ' dashboard-tv-swatch-btn--active'
                  : ''
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setAccentColor(color)}
            />
          ))}
        </div>
      </div>

      <div className="dashboard-tv-field">
        <label htmlFor={`rotate-${tv.id}`} className="dashboard-tv-label">
          Rotate every (minutes)
        </label>
        <input
          id={`rotate-${tv.id}`}
          type="number"
          min={1}
          max={30}
          className="account-input dashboard-tv-rotate-input"
          value={rotateMinutes}
          onChange={(e) => setRotateMinutes(Number(e.target.value))}
        />
      </div>

      <label className="dashboard-tv-checkbox-row">
        <input
          type="checkbox"
          checked={showWeather}
          onChange={(e) => setShowWeather(e.target.checked)}
        />
        Show weather
      </label>

      {error && (
        <p className="account-error" role="alert">
          {error}
        </p>
      )}

      <div className="dashboard-tv-actions">
        <button
          type="button"
          className="dashboard-plus-btn dashboard-tv-save-btn"
          disabled={!dirty || saving}
          onClick={handleSave}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>

        {confirmingDelete ? (
          <div className="dashboard-tv-confirm-row">
            <span className="dashboard-tv-confirm-text">Remove this TV?</span>
            <button
              type="button"
              className="dashboard-tv-confirm-btn"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? 'Removing…' : 'Yes, remove'}
            </button>
            <button
              type="button"
              className="dashboard-tv-cancel-btn"
              disabled={deleting}
              onClick={() => setConfirmingDelete(false)}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="dashboard-tv-remove-btn"
            onClick={() => setConfirmingDelete(true)}
          >
            Remove TV
          </button>
        )}
      </div>
    </div>
  );
}
