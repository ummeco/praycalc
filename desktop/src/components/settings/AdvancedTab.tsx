/**
 * Purpose: Settings > Advanced tab — prayer-time calculation method + Hanafi
 *   Asr school toggle.
 * Inputs: `form` (current draft Settings) + `setForm` (functional updater).
 * Outputs: renders the tab's fields; mutates `form` via `setForm`.
 * Constraints: no `any`; pure presentational — SettingsPanel owns save/state.
 * SPORT: praycalc desktop — settings panel (Advanced tab).
 */
import type { Settings } from '../../lib/ipc-types';
import { METHODS } from '../../lib/ipc-types';
import { Toggle, SelectField } from './FormFields';

interface Props {
  form: Settings;
  setForm: (updater: (f: Settings) => Settings) => void;
}

export default function AdvancedTab({ form, setForm }: Props) {
  return (
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
  );
}
