import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Settings, DisplayMode, NameFormat, CountdownPrefix, DetectedLocation } from '../lib/ipc-types';
import { METHODS, PRESET_CITIES } from '../lib/ipc-types';
import { detectLocationByIp } from '../lib/geo';
import { saveSettings } from '../lib/store';
import { invoke } from '@tauri-apps/api/core';
import AccountTab from './AccountTab';
import TvManager from './TvManager';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

export interface SettingsPanelHandle {
  save: () => Promise<void>;
}

type Tab = 'general' | 'location' | 'notifications' | 'advanced' | 'account' | 'tvs';

const SettingsPanel = forwardRef<SettingsPanelHandle, Props>(function SettingsPanel({ settings, onSave }, ref) {
  const [form, setForm] = useState<Settings>(settings);
  const [tab, setTab] = useState<Tab>('general');


  const handleSave = useCallback(async () => {
    await saveSettings(form);
    try {
      if (form.autostart) {
        await invoke('plugin:autostart|enable');
      } else {
        await invoke('plugin:autostart|disable');
      }
    } catch {
      // autostart may not be available in dev mode
    }
    onSave(form);
  }, [form, onSave]);

  useImperativeHandle(ref, () => ({ save: handleSave }), [handleSave]);

  // Keep form in sync when settings prop changes externally
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'location', label: 'Location' },
    { id: 'notifications', label: 'Alerts' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'account', label: 'Account' },
    { id: 'tvs', label: 'My TVs' },
  ];

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-brand-dark/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[11px] py-2 font-medium transition-colors ${
              tab === t.id
                ? 'text-brand-light border-b-2 border-brand-mid -mb-px'
                : 'text-green-300/50 hover:text-green-300/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-4 space-y-4">
        {tab === 'general' && (
          <>
            <Toggle
              label="Display next prayer in menu bar"
              checked={form.showIcon}
              onChange={(v) => setForm((f) => ({ ...f, showIcon: v }))}
            />

            <SelectField
              label="Prayer time"
              value={form.displayMode}
              onChange={(v) => setForm((f) => ({ ...f, displayMode: v as DisplayMode }))}
              options={[
                { value: 'countdown', label: 'Countdown to next prayer' },
                { value: 'time', label: 'Actual prayer time' },
              ]}
            />

            <SelectField
              label="Prayer name"
              value={form.nameFormat}
              onChange={(v) => setForm((f) => ({ ...f, nameFormat: v as NameFormat }))}
              options={[
                { value: 'abbrev', label: 'Abbreviation (F, D, A…)' },
                { value: 'full', label: 'Full name (Fajr, Dhuhr…)' },
              ]}
            />

            <Toggle
              label="Show seconds in countdown"
              desc='e.g. "M −3:24:11" vs "M −3:24"'
              checked={form.showSeconds}
              onChange={(v) => setForm((f) => ({ ...f, showSeconds: v }))}
            />

            <SelectField
              label="Countdown prefix"
              value={form.countdownPrefix}
              onChange={(v) => setForm((f) => ({ ...f, countdownPrefix: v as CountdownPrefix }))}
              options={[
                { value: 'minus', label: 'Minus sign  (−3:24)' },
                { value: 'none', label: 'None  (3:24)' },
                { value: 'in', label: 'Word  (in 3:24)' },
              ]}
            />

            <Toggle
              label="Arabic mode"
              desc="Show prayer names in Arabic"
              checked={form.arabicMode}
              onChange={(v) => setForm((f) => ({ ...f, arabicMode: v }))}
            />

            <Toggle
              label="Start PrayCalc at login"
              checked={form.autostart}
              onChange={(v) => setForm((f) => ({ ...f, autostart: v }))}
            />
          </>
        )}

        {tab === 'location' && (
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
        )}

        {tab === 'notifications' && (
          <>
            <Toggle
              label="Prayer time notifications"
              desc="Play adhan when each prayer time begins"
              checked={form.notifications}
              onChange={(v) => setForm((f) => ({ ...f, notifications: v }))}
            />
            <SelectField
              label="Adhan recitation"
              value={form.adhan ?? 'makkah'}
              onChange={(v) => setForm((f) => ({ ...f, adhan: v as 'makkah' | 'mishari' }))}
              options={[
                { value: 'makkah', label: 'Makkah (short)' },
                { value: 'mishari', label: 'Mishari Rashid al-Afasy' },
              ]}
            />
          </>
        )}

        {tab === 'advanced' && (
          <>
            <SelectField
              label="Calculation method"
              value={form.method}
              onChange={(v) => setForm((f) => ({ ...f, method: v }))}
              options={METHODS}
            />

            <Toggle
              label="Hanafi school (Asr)"
              desc="Use Hanafi method for Asr calculation"
              checked={form.hanafi}
              onChange={(v) => setForm((f) => ({ ...f, hanafi: v }))}
            />
          </>
        )}

        {tab === 'account' && <AccountTab />}
        {tab === 'tvs' && <TvManager />}
      </div>
    </div>
  );
});

export default SettingsPanel;

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-brand-mid w-4 h-4"
        />
      </div>
      <div>
        <div className="text-sm text-green-200/90">{label}</div>
        {desc && <div className="text-[11px] text-green-300/50 mt-0.5">{desc}</div>}
      </div>
    </label>
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-green-300/60 block mb-1">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
