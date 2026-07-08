/**
 * Purpose: Shared form primitives for the Settings panel tabs — a labeled
 *   checkbox toggle and a labeled `<select>`. Split out of Settings.tsx so
 *   each per-tab file can reuse them without duplicating markup/styling.
 * Inputs: see each component's props.
 * Outputs: styled form controls matching the Settings panel's dark-green theme.
 * Constraints: no `any`; presentational only — callers own all state.
 * SPORT: praycalc desktop — settings panel (shared form fields).
 */
export function Toggle({
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
        {desc && <div className="text-[11px] text-green-300/60 mt-0.5">{desc}</div>}
      </div>
    </label>
  );
}

export function SelectField({
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
