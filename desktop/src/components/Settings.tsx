import { useState, useCallback, useEffect } from 'react';
import type { Settings, DisplayMode, NameFormat, CountdownPrefix } from '../lib/ipc-types';
import { METHODS, PRESET_CITIES } from '../lib/ipc-types';
import { saveSettings } from '../lib/store';
import { invoke } from '@tauri-apps/api/core';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

type Tab = 'general' | 'location' | 'notifications' | 'advanced';

export default function SettingsPanel({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>(settings);
  const [tab, setTab] = useState<Tab>('general');


  const handleSave = useCallback(async () => {
    await saveSettings(form);
    // Sync autostart with OS
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

  // Keep form in sync when settings prop changes externally
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'location', label: 'Location' },
    { id: 'notifications', label: 'Alerts' },
    { id: 'advanced', label: 'Advanced' },
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
            <SelectField
              label="City"
              value={form.city}
              onChange={(city) => {
                const c = PRESET_CITIES.find((x) => x.name === city);
                if (c) setForm((f) => ({ ...f, city: c.name, lat: c.lat, lng: c.lng, tz: c.tz }));
              }}
              options={PRESET_CITIES.map((c) => ({ value: c.name, label: c.name }))}
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
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleSave}
          className="w-full bg-brand-mid hover:bg-brand-light text-brand-bg font-semibold text-sm py-2 rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
}

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
