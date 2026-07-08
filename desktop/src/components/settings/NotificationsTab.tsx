/**
 * Purpose: Settings > Alerts tab — prayer-time notification toggle + adhan
 *   recitation choice.
 * Inputs: `form` (current draft Settings) + `setForm` (functional updater).
 * Outputs: renders the tab's fields; mutates `form` via `setForm`.
 * Constraints: no `any`; pure presentational — SettingsPanel owns save/state.
 * SPORT: praycalc desktop — settings panel (Alerts tab).
 */
import type { Settings } from '../../lib/ipc-types';
import { Toggle, SelectField } from './FormFields';

interface Props {
  form: Settings;
  setForm: (updater: (f: Settings) => Settings) => void;
}

export default function NotificationsTab({ form, setForm }: Props) {
  return (
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
  );
}
