/**
 * TvCard.tsx — one paired TV's cosmetic-edit card + collapsible deep settings.
 *
 * PURPOSE: Inline rename/accent-color/stream/rotation/weather edits,
 *   delete-with-confirm, and a collapsible deep-settings + location editor
 *   (TvDeepSettingsEditor). Split out of TvManagerClient.tsx to keep that
 *   file under the 300-line cap.
 * INPUTS: tv (current TvSetting row) · onUpdated(tv) / onDeleted(id) —
 *   parent's list-state callbacks (TvManagerClient's handleTvUpdated /
 *   handleTvDeleted).
 * OUTPUTS: none — self-contained card with its own dirty/save/delete state.
 *   Cosmetic fields save on an explicit "Save changes" click (batched, dirty-
 *   tracked); deep-settings fields save on each committed change (immediate
 *   for toggles/selects, on-blur for number/text — see TvDeepSettingsEditor).
 * CONSTRAINTS: Astro island subcomponent. No next/* imports. All writes go
 *   through updateTv()/deleteTv() in src/lib/tv/client.ts — never calls
 *   Hasura directly.
 * REF: src/islands/account/TvManagerClient.tsx · src/lib/tv/client.ts ·
 *   src/islands/account/TvDeepSettingsEditor.tsx
 */

import { useState } from 'react';
import { updateTv, deleteTv, type TvSetting, type TvSettingPatch, type TvStreamSource } from '@/lib/tv/client';
import TvDeepSettingsEditor from './TvDeepSettingsEditor';

const ACCENT_PRESETS = ['#79C24C', '#C9F27A', '#1E5E2F', '#3B82F6', '#F59E0B', '#EF4444'] as const;
const DEFAULT_ACCENT = '#79C24C';

const STREAM_OPTIONS: { value: TvStreamSource; label: string }[] = [
  { value: 'makkah-tv', label: 'Makkah Live' },
  { value: 'saudi-quran', label: 'Saudi Quran Channel' },
  { value: 'medina', label: 'Medina Live' },
];

export default function TvCard({
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
  const [deepExpanded, setDeepExpanded] = useState(false);
  const [deepError, setDeepError] = useState<string | null>(null);

  async function handleDeepPatch(patch: TvSettingPatch) {
    setDeepError(null);
    const result = await updateTv(tv.id, patch);
    if (result.ok && 'tv' in result) {
      onUpdated(result.tv);
    } else if (!result.ok) {
      setDeepError(result.error);
    }
  }

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

      <button
        type="button"
        className="dashboard-tv-deep-toggle"
        aria-expanded={deepExpanded}
        onClick={() => setDeepExpanded((v) => !v)}
      >
        {deepExpanded ? 'Hide deep settings' : 'Deep settings'}
      </button>
      {deepExpanded && <TvDeepSettingsEditor tv={tv} onPatch={handleDeepPatch} />}
      {deepError && (
        <p className="account-error" role="alert">
          {deepError}
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
