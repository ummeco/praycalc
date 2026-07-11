/**
 * TvDeepSettingsEditor.tsx — deep-settings + location editor for one TV card.
 *
 * PURPOSE: Countdown takeover, iqama offsets, name-only mode, calc method /
 *   madhab / time format, and per-TV manual location (city + lat + lng).
 *   Mirrors desktop/src/components/TvDeepSettingsEditor.tsx field-for-field.
 *   Split out of TvManagerClient.tsx to keep that file under the 300-line cap.
 * INPUTS: tv (current TvSetting row) · onPatch(patch) — parent's save
 *   handler (TvCard's handleDeepPatch, which calls updateTv() and merges the
 *   result back into state).
 * OUTPUTS: none — calls onPatch on each committed change (immediate for
 *   toggles/selects, on-blur for number/text inputs).
 * CONSTRAINTS: Astro island subcomponent. No next/* imports. iqama_offsets is
 *   always sent as the full 5-key object — Hasura's jsonb _set replaces the
 *   whole column, so a partial patch would drop the other prayers' offsets.
 * REF: src/islands/account/TvManagerClient.tsx · src/lib/tv/client.ts ·
 *   desktop/src/components/TvDeepSettingsEditor.tsx (field parity reference) ·
 *   packages/ui-utils (shared clamp())
 */

import { useState, useEffect } from 'react';
import { clamp } from '@praycalc/ui-utils';
import type { TvSetting, TvSettingPatch, TvMadhab, TvTimeFormat, IqamaOffsets } from '@/lib/tv/client';

const MIN_COUNTDOWN_MINUTES = 1;
const MAX_COUNTDOWN_MINUTES = 60;
const MIN_NAME_ONLY_MINUTES = 1;
const MAX_NAME_ONLY_MINUTES = 60;

const IQAMA_PRAYER_ORDER: (keyof IqamaOffsets)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const IQAMA_PRAYER_LABELS: Record<keyof IqamaOffsets, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Mirrors desktop tv-types.ts CALC_METHOD_OPTIONS so the TV computes with the same method ids. */
const CALC_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'dpc', label: 'Dynamic (PrayCalc DPC) — Recommended' },
  { value: 'ISNA', label: 'ISNA — Islamic Society of North America' },
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'Egypt', label: 'Egyptian General Authority of Survey' },
  { value: 'UAQ', label: 'Umm al-Qura University, Makkah' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'IGUT', label: 'Institute of Geophysics, University of Tehran' },
  { value: 'Kuwait', label: 'Kuwait Ministry of Islamic Affairs' },
  { value: 'Qatar', label: 'Qatar / Gulf Standard' },
  { value: 'MUIS', label: 'Majlis Ugama Islam Singapura' },
  { value: 'UOIF', label: 'Union des Organisations Islamiques de France' },
  { value: 'DIBT', label: 'Diyanet İşleri Başkanlığı, Turkey' },
  { value: 'SAMR', label: 'Spiritual Administration of Muslims of Russia' },
  { value: 'ISNACA', label: 'IQNA / Islamic Council of North America' },
  { value: 'MSC', label: 'Moonsighting Committee Worldwide' },
];

const MADHAB_OPTIONS: { value: TvMadhab; label: string }[] = [
  { value: 'shafii', label: "Shafi'i / Maliki / Hanbali (standard)" },
  { value: 'hanafi', label: 'Hanafi' },
];

const TIME_FORMAT_OPTIONS: { value: TvTimeFormat; label: string }[] = [
  { value: '24h', label: '24-hour' },
  { value: '12h', label: '12-hour (AM/PM)' },
];

export default function TvDeepSettingsEditor({
  tv,
  onPatch,
}: {
  tv: TvSetting;
  onPatch: (patch: TvSettingPatch) => void;
}) {
  const [city, setCity] = useState(tv.city ?? '');
  const [lat, setLat] = useState(tv.latitude !== null ? String(tv.latitude) : '');
  const [lng, setLng] = useState(tv.longitude !== null ? String(tv.longitude) : '');

  useEffect(() => {
    setCity(tv.city ?? '');
    setLat(tv.latitude !== null ? String(tv.latitude) : '');
    setLng(tv.longitude !== null ? String(tv.longitude) : '');
  }, [tv.city, tv.latitude, tv.longitude]);

  function applyManualLocation() {
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) return;
    onPatch({ latitude: parsedLat, longitude: parsedLng, city: city.trim() || null });
  }

  return (
    <div className="dashboard-tv-deep">
      <label className="dashboard-tv-checkbox-row">
        <input
          type="checkbox"
          checked={tv.countdown_takeover_enabled}
          onChange={(e) => onPatch({ countdown_takeover_enabled: e.target.checked })}
        />
        Countdown takeover
      </label>
      {tv.countdown_takeover_enabled && (
        <div className="dashboard-tv-field">
          <label htmlFor={`countdown-${tv.id}`} className="dashboard-tv-label">
            Minutes before adhan
          </label>
          <input
            id={`countdown-${tv.id}`}
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
            className="account-input"
          />
        </div>
      )}

      <label className="dashboard-tv-checkbox-row">
        <input
          type="checkbox"
          checked={tv.iqama_enabled}
          onChange={(e) => onPatch({ iqama_enabled: e.target.checked })}
        />
        Show iqama times
      </label>
      {tv.iqama_enabled && (
        <div className="dashboard-tv-iqama-grid">
          {IQAMA_PRAYER_ORDER.map((prayer) => (
            <label key={prayer} className="dashboard-tv-field">
              <span className="dashboard-tv-label">{IQAMA_PRAYER_LABELS[prayer]} (+min)</span>
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
                className="account-input"
              />
            </label>
          ))}
        </div>
      )}

      <label className="dashboard-tv-checkbox-row">
        <input
          type="checkbox"
          checked={tv.name_only_enabled}
          onChange={(e) => onPatch({ name_only_enabled: e.target.checked })}
        />
        Name-only mode after adhan
      </label>
      {tv.name_only_enabled && (
        <div className="dashboard-tv-field">
          <label htmlFor={`name-only-${tv.id}`} className="dashboard-tv-label">
            Duration (minutes)
          </label>
          <input
            id={`name-only-${tv.id}`}
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
            className="account-input"
          />
        </div>
      )}

      <div className="dashboard-tv-field">
        <label htmlFor={`calc-method-${tv.id}`} className="dashboard-tv-label">
          Calculation method
        </label>
        <select
          id={`calc-method-${tv.id}`}
          className="account-input"
          value={tv.calc_method}
          onChange={(e) => onPatch({ calc_method: e.target.value })}
        >
          {CALC_METHOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-tv-field">
        <label htmlFor={`madhab-${tv.id}`} className="dashboard-tv-label">
          Madhab (Asr)
        </label>
        <select
          id={`madhab-${tv.id}`}
          className="account-input"
          value={tv.madhab}
          onChange={(e) => onPatch({ madhab: e.target.value as TvMadhab })}
        >
          {MADHAB_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-tv-field">
        <label htmlFor={`time-format-${tv.id}`} className="dashboard-tv-label">
          Time format
        </label>
        <select
          id={`time-format-${tv.id}`}
          className="account-input"
          value={tv.time_format}
          onChange={(e) => onPatch({ time_format: e.target.value as TvTimeFormat })}
        >
          {TIME_FORMAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-tv-field">
        <span className="dashboard-tv-label">Location</span>
        <div className="dashboard-tv-location-grid">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="City"
            aria-label="City"
            className="account-input"
          />
          <input
            type="text"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="Lat"
            aria-label="Latitude"
            className="account-input"
          />
          <input
            type="text"
            inputMode="decimal"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            onBlur={applyManualLocation}
            placeholder="Lng"
            aria-label="Longitude"
            className="account-input"
          />
        </div>
      </div>
    </div>
  );
}
