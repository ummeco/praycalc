/**
 * Purpose: "Add a TV" PIN-entry form for the My TVs tab — claims a pc_tv_pairing PIN
 *   shown on the TV screen, mirroring mobile's Settings → Pair TV screen.
 * Inputs: onClaim(pin) — parent-supplied handler that calls claimTvPairing and refreshes
 *   the TV list; onCancel — closes the form without submitting.
 * Outputs: renders a 6-digit PIN field + Add/Cancel buttons; local validation only
 *   (isValidPin) — server-side errors are surfaced by the parent via its own error state.
 * Constraints: no `any`; matches TvManager's dark-green Tailwind conventions; digits-only
 *   input filtering mirrors mobile's onChangeText replace(/[^0-9]/g, '').
 * SPORT: praycalc desktop — TV management (add-TV form).
 */
import { useState } from 'react';
import { isValidPin } from '../lib/tvSettings';

export default function AddTvForm({
  submitting,
  onClaim,
  onCancel,
}: {
  submitting: boolean;
  onClaim: (pin: string) => void;
  onCancel: () => void;
}) {
  const [pin, setPin] = useState('');

  return (
    <div className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 space-y-2.5">
      <div className="text-sm text-green-100 font-medium">Enter the code shown on your TV</div>
      <input
        type="text"
        inputMode="numeric"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
        placeholder="000000"
        maxLength={6}
        autoFocus
        className="w-full bg-transparent border border-brand-dark rounded px-2 py-1.5 text-lg tracking-[0.3em] text-center text-green-100 focus:outline-none focus:border-brand-mid"
      />
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={submitting}
          className="text-white/40 hover:text-white/70 text-xs font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={() => onClaim(pin)}
          disabled={submitting || !isValidPin(pin)}
          className="bg-brand-mid hover:bg-brand-light text-brand-bg text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50"
        >
          {submitting ? 'Adding…' : 'Add TV'}
        </button>
      </div>
    </div>
  );
}
