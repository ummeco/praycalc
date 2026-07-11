/**
 * Purpose: Deep-settings editor block for one TV row in the My TVs tab — countdown
 *   takeover, iqama offsets, name-only mode, calc method / madhab / time format, and
 *   per-TV manual location. Split out of TvManager.tsx to keep both files under the
 *   300-line cap.
 * Inputs: tv (current TvSettings row), onPatch(patch) — parent's optimistic-update+save
 *   handler (same one TvManager wires to updateTvSettings).
 * Outputs: renders toggles/number inputs/selects; calls onPatch on each committed change
 *   (blur for text/number, immediate for toggles/selects, matching TvManager's existing
 *   accent-color/stream-source pattern).
 * Constraints: no `any`; clamps minutes client-side (no CHECK constraint on prod per T1
 *   notes); iqama_offsets always sent as the full 5-key object (never a partial patch,
 *   per the live column contract). Location fields reuse ipc-types.ts PRESET_CITIES for
 *   a quick-pick plus manual lat/lng entry.
 * SPORT: praycalc desktop — TV management (deep-settings editor).
 * REF: clamp() sourced from packages/ui-utils (shared with web's equivalent editor).
 */
import { useState, useEffect } from 'react';
import { clamp } from '@praycalc/ui-utils';
import type { TvSettings, TvSettingsPatch, TvMadhab, TvTimeFormat } from '../lib/tv-types';
import {
  MIN_COUNTDOWN_MINUTES,
  MAX_COUNTDOWN_MINUTES,
  MIN_NAME_ONLY_MINUTES,
  MAX_NAME_ONLY_MINUTES,
  IQAMA_PRAYER_ORDER,
  IQAMA_PRAYER_LABELS,
  CALC_METHOD_OPTIONS,
  MADHAB_OPTIONS,
  TIME_FORMAT_OPTIONS,
} from '../lib/tv-types';
import { PRESET_CITIES } from '../lib/ipc-types';
import TvLayoutThemePicker from './TvLayoutThemePicker';

const inputClass =
  'w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid';
const labelClass = 'text-[11px] text-green-300/60 block mb-1';

export default function TvDeepSettingsEditor({
  tv,
  onPatch,
}: {
  tv: TvSettings;
  onPatch: (patch: TvSettingsPatch) => void;
}) {
  const [city, setCity] = useState(tv.city ?? '');
  const [lat, setLat] = useState(tv.latitude !== null ? String(tv.latitude) : '');
  const [lng, setLng] = useState(tv.longitude !== null ? String(tv.longitude) : '');

  useEffect(() => {
    setCity(tv.city ?? '');
    setLat(tv.latitude !== null ? String(tv.latitude) : '');
    setLng(tv.longitude !== null ? String(tv.longitude) : '');
  }, [tv.city, tv.latitude, tv.longitude]);

  const applyManualLocation = () => {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return;
    onPatch({ latitude: parsedLat, longitude: parsedLng, city: city.trim() || null });
  };

  const applyPresetCity = (name: string) => {
    const preset = PRESET_CITIES.find((c) => c.name === name);
    if (!preset) return;
    setCity(preset.name);
    setLat(String(preset.lat));
    setLng(String(preset.lng));
    onPatch({ latitude: preset.lat, longitude: preset.lng, city: preset.name, timezone: preset.tz });
  };

  return (
    <div className="space-y-2.5 pt-2 border-t border-brand-dark/40">
      <TvLayoutThemePicker tv={tv} onPatch={onPatch} />

      <div className="text-[11px] text-green-300/60 uppercase tracking-wide">Deep settings</div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tv.countdown_takeover_enabled}
          onChange={(e) => onPatch({ countdown_takeover_enabled: e.target.checked })}
          className="accent-brand-mid w-4 h-4"
        />
        <span className="text-sm text-green-200/90">Countdown takeover</span>
      </label>
      {tv.countdown_takeover_enabled && (
        <label className="block pl-6">
          <span className={labelClass}>Minutes before adhan</span>
          <input
            type="number"
            min={MIN_COUNTDOWN_MINUTES}
            max={MAX_COUNTDOWN_MINUTES}
            value={tv.countdown_minutes}
            onChange={(e) =>
              onPatch({
                countdown_minutes: clamp(
                  parseInt(e.target.value, 10) || MIN_COUNTDOWN_MINUTES,
                  MIN_COUNTDOWN_MINUTES,
                  MAX_COUNTDOWN_MINUTES,
                ),
              })
            }
            className={inputClass}
          />
        </label>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tv.iqama_enabled}
          onChange={(e) => onPatch({ iqama_enabled: e.target.checked })}
          className="accent-brand-mid w-4 h-4"
        />
        <span className="text-sm text-green-200/90">Show iqama times</span>
      </label>
      {tv.iqama_enabled && (
        <div className="pl-6 grid grid-cols-2 gap-2">
          {IQAMA_PRAYER_ORDER.map((prayer) => (
            <label key={prayer} className="block">
              <span className={labelClass}>{IQAMA_PRAYER_LABELS[prayer]} (+min)</span>
              <input
                type="number"
                min={0}
                max={120}
                value={tv.iqama_offsets[prayer]}
                onChange={(e) =>
                  onPatch({
                    iqama_offsets: {
                      ...tv.iqama_offsets,
                      [prayer]: clamp(parseInt(e.target.value, 10) || 0, 0, 120),
                    },
                  })
                }
                className={inputClass}
              />
            </label>
          ))}
        </div>
      )}

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={tv.name_only_enabled}
          onChange={(e) => onPatch({ name_only_enabled: e.target.checked })}
          className="accent-brand-mid w-4 h-4"
        />
        <span className="text-sm text-green-200/90">Name-only mode after adhan</span>
      </label>
      {tv.name_only_enabled && (
        <label className="block pl-6">
          <span className={labelClass}>Duration (minutes)</span>
          <input
            type="number"
            min={MIN_NAME_ONLY_MINUTES}
            max={MAX_NAME_ONLY_MINUTES}
            value={tv.name_only_minutes}
            onChange={(e) =>
              onPatch({
                name_only_minutes: clamp(
                  parseInt(e.target.value, 10) || MIN_NAME_ONLY_MINUTES,
                  MIN_NAME_ONLY_MINUTES,
                  MAX_NAME_ONLY_MINUTES,
                ),
              })
            }
            className={inputClass}
          />
        </label>
      )}

      <label className="block">
        <span className={labelClass}>Calculation method</span>
        <select
          value={tv.calc_method}
          onChange={(e) => onPatch({ calc_method: e.target.value })}
          className={inputClass}
        >
          {CALC_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Madhab (Asr)</span>
        <select
          value={tv.madhab}
          onChange={(e) => onPatch({ madhab: e.target.value as TvMadhab })}
          className={inputClass}
        >
          {MADHAB_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={labelClass}>Time format</span>
        <select
          value={tv.time_format}
          onChange={(e) => onPatch({ time_format: e.target.value as TvTimeFormat })}
          className={inputClass}
        >
          {TIME_FORMAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-1.5">
        <span className={labelClass}>Location</span>
        <select
          value=""
          onChange={(e) => e.target.value && applyPresetCity(e.target.value)}
          className={inputClass}
        >
          <option value="">Pick a preset city…</option>
          {PRESET_CITIES.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-3 gap-1.5">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="City"
            className={inputClass}
          />
          <input
            type="text"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="Lat"
            className={inputClass}
          />
          <input
            type="text"
            inputMode="decimal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="Lng"
            className={inputClass}
          />
        </div>
      </div>
    </div>
  );
}
