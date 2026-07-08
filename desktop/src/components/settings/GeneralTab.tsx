/**
 * Purpose: Settings > General tab — tray display mode, prayer name format,
 *   countdown formatting, Arabic mode, and autostart.
 * Inputs: `form` (current draft Settings) + `setForm` (functional updater).
 * Outputs: renders the tab's fields; mutates `form` via `setForm`.
 * Constraints: no `any`; pure presentational — SettingsPanel owns save/state.
 * SPORT: praycalc desktop — settings panel (General tab).
 */
import type { Settings, DisplayMode, NameFormat, CountdownPrefix } from '../../lib/ipc-types';
import { Toggle, SelectField } from './FormFields';

interface Props {
  form: Settings;
  setForm: (updater: (f: Settings) => Settings) => void;
}

export default function GeneralTab({ form, setForm }: Props) {
  return (
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
  );
}
