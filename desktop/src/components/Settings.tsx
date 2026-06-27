import { useState, useCallback } from 'react';
import type { Settings } from '../lib/ipc-types';
import { METHODS, PRESET_CITIES } from '../lib/ipc-types';
import { saveSettings } from '../lib/store';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

export default function SettingsPanel({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>(settings);

  const handleCityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = PRESET_CITIES.find((c) => c.name === e.target.value);
    if (city) setForm((f) => ({ ...f, city: city.name, lat: city.lat, lng: city.lng, tz: city.tz }));
  }, []);

  const handleSave = useCallback(async () => {
    await saveSettings(form);
    onSave(form);
  }, [form, onSave]);

  return (
    <div className="px-4 py-3 space-y-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-mid">Settings</h2>

      <label className="block">
        <span className="text-xs text-green-300/60 block mb-1">City</span>
        <select
          value={form.city}
          onChange={handleCityChange}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        >
          {PRESET_CITIES.map((c) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-xs text-green-300/60 block mb-1">Calculation Method</span>
        <select
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
        >
          {METHODS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.hanafi}
          onChange={(e) => setForm((f) => ({ ...f, hanafi: e.target.checked }))}
          className="accent-brand-mid"
        />
        <span className="text-sm text-green-200/80">Hanafi school (Asr)</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.notifications}
          onChange={(e) => setForm((f) => ({ ...f, notifications: e.target.checked }))}
          className="accent-brand-mid"
        />
        <span className="text-sm text-green-200/80">Prayer notifications</span>
      </label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.autostart}
          onChange={(e) => setForm((f) => ({ ...f, autostart: e.target.checked }))}
          className="accent-brand-mid"
        />
        <span className="text-sm text-green-200/80">Launch at login</span>
      </label>

      <button
        onClick={handleSave}
        className="w-full bg-brand-mid hover:bg-brand-light text-brand-bg font-semibold text-sm py-2 rounded transition-colors"
      >
        Save
      </button>
    </div>
  );
}
