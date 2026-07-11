/**
 * Purpose: Settings panel shell — owns the draft form state, the tab bar, and
 *   the imperative `save()` handle App.tsx's footer "Save" button calls. Each
 *   tab's fields live in `./settings/*Tab.tsx`; Account/TV/Smart Home
 *   management are their own top-level components (AccountTab, TvManager,
 *   SmartHomeManager).
 * Inputs: `settings` (persisted Settings) + `onSave` callback.
 * Outputs: renders the full settings UI; calls `onSave(form)` after a
 *   successful save.
 * Constraints: no `any`; autostart is toggled via the raw `plugin:autostart|*`
 *   invoke string (no JS wrapper dependency — see package.json D-desktop-04).
 * SPORT: praycalc desktop — settings panel (shell).
 */
import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { Settings } from '../lib/ipc-types';
import { saveSettings } from '../lib/store';
import { invoke } from '@tauri-apps/api/core';
import AccountTab from './AccountTab';
import TvManager from './TvManager';
import SmartHomeManager from './SmartHomeManager';
import GeneralTab from './settings/GeneralTab';
import LocationTab from './settings/LocationTab';
import NotificationsTab from './settings/NotificationsTab';
import AdvancedTab from './settings/AdvancedTab';

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

export interface SettingsPanelHandle {
  save: () => Promise<void>;
}

type Tab = 'general' | 'location' | 'notifications' | 'advanced' | 'account' | 'tvs' | 'smartHome';

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'location', label: 'Location' },
  { id: 'notifications', label: 'Alerts' },
  { id: 'advanced', label: 'Advanced' },
  { id: 'account', label: 'Account' },
  { id: 'tvs', label: 'My TVs' },
  { id: 'smartHome', label: 'Smart Home' },
];

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

  return (
    <div className="flex flex-col">
      {/* Tab bar */}
      <div className="flex border-b border-brand-dark/40">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 text-[11px] py-2 font-medium transition-colors ${
              tab === t.id
                ? 'text-brand-light border-b-2 border-brand-mid -mb-px'
                : 'text-green-300/60 hover:text-green-300/80'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-4 space-y-4">
        {tab === 'general' && <GeneralTab form={form} setForm={setForm} />}
        {tab === 'location' && <LocationTab form={form} setForm={setForm} />}
        {tab === 'notifications' && <NotificationsTab form={form} setForm={setForm} />}
        {tab === 'advanced' && <AdvancedTab form={form} setForm={setForm} />}
        {tab === 'account' && <AccountTab />}
        {tab === 'tvs' && <TvManager />}
        {tab === 'smartHome' && <SmartHomeManager />}
      </div>
    </div>
  );
});

export default SettingsPanel;
