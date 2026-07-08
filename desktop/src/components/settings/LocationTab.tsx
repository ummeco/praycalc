/**
 * Purpose: Settings > Location tab — IP-based "Detect Location" button, manual
 *   lat/lng/timezone entry, and a major-city preset picker.
 * Inputs: `form` (current draft Settings) + `setForm` (functional updater).
 * Outputs: renders the tab's fields; mutates `form` via `setForm`.
 * Constraints: no `any`; pure presentational — SettingsPanel owns save/state.
 * SPORT: praycalc desktop — settings panel (Location tab).
 */
import { useState, useCallback } from 'react';
import type { Settings, DetectedLocation } from '../../lib/ipc-types';
import { PRESET_CITIES } from '../../lib/ipc-types';
import { detectLocationByIp } from '../../lib/geo';
import { SelectField } from './FormFields';

interface Props {
  form: Settings;
  setForm: (updater: (f: Settings) => Settings) => void;
}

export default function LocationTab({ form, setForm }: Props) {
  return (
    <>
      <DetectLocationButton
        onDetected={(loc) => setForm((f) => ({ ...f, city: loc.city, lat: loc.lat, lng: loc.lng, tz: loc.tz ?? f.tz }))}
      />

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="text-[11px] text-green-300/60 block mb-1">Latitude</span>
          <input
            type="number"
            step="0.0001"
            value={form.lat}
            onChange={(e) => setForm((f) => ({ ...f, lat: parseFloat(e.target.value) || f.lat }))}
            className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
          />
        </label>
        <label className="block">
          <span className="text-[11px] text-green-300/60 block mb-1">Longitude</span>
          <input
            type="number"
            step="0.0001"
            value={form.lng}
            onChange={(e) => setForm((f) => ({ ...f, lng: parseFloat(e.target.value) || f.lng }))}
            className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Timezone</span>
        <input
          type="text"
          value={form.tz}
          onChange={(e) => setForm((f) => ({ ...f, tz: e.target.value }))}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
          placeholder="America/New_York"
        />
      </label>

      <div className="border-t border-brand-dark/40 pt-4">
        <SelectField
          label="Or choose a major city"
          value={form.city}
          onChange={(city) => {
            const c = PRESET_CITIES.find((x) => x.name === city);
            if (c) setForm((f) => ({ ...f, city: c.name, lat: c.lat, lng: c.lng, tz: c.tz }));
          }}
          options={PRESET_CITIES.map((c) => ({ value: c.name, label: c.name }))}
        />
      </div>
    </>
  );
}

/**
 * Purpose: "Detect Location" button for Settings > Location — top of the tab per UX
 * request, above manual lat/lng and the major-city preset picker.
 * Inputs: onDetected(loc) callback fired with {city,lat,lng,tz} on success.
 * Outputs: renders a button with idle/loading/error states.
 * Constraints: no Tauri geolocation plugin exists — uses a geo-IP HTTP lookup
 * (desktop/src/lib/geo.ts). Best-effort only; user can always fall back to manual
 * entry or the preset picker below.
 */
function DetectLocationButton({ onDetected }: { onDetected: (loc: DetectedLocation) => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleDetect = useCallback(async () => {
    setStatus('loading');
    try {
      const loc = await detectLocationByIp();
      if (!loc) {
        setStatus('error');
        return;
      }
      onDetected(loc);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  }, [onDetected]);

  return (
    <div>
      <button
        type="button"
        onClick={handleDetect}
        disabled={status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-brand-mid/20 border border-brand-mid rounded px-3 py-2 text-sm font-medium text-brand-light hover:bg-brand-mid/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-green-100/30 border-t-green-100 rounded-full animate-spin" />
            Detecting…
          </>
        ) : (
          <>📍 Detect Location</>
        )}
      </button>
      {status === 'error' && (
        <p className="text-[11px] text-red-300/80 mt-1.5">
          Couldn't detect your location. Enter it manually below or pick a city.
        </p>
      )}
    </div>
  );
}
