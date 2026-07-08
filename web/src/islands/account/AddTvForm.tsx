/**
 * AddTvForm.tsx — 6-digit pairing code form for "My TVs".
 *
 * PURPOSE: Lets a signed-in Ummat+ user claim a TV by entering the 6-digit
 *   code shown on the TV's pairing screen (POST /api/tvs { action: 'pair' }).
 *   Split out of TvManagerClient.tsx to keep that file under the 300-line cap.
 * INPUTS: onPaired() — called after a successful claim so the parent can
 *   refresh its TV list.
 * OUTPUTS: none — self-contained form with its own loading/error state.
 * CONSTRAINTS: Astro island subcomponent (rendered inside a client:load
 *   parent). SSR-safe — no fetch until the user submits. No next/* imports.
 * REF: src/islands/account/TvManagerClient.tsx · src/lib/tv/client.ts
 */

import { useState, type FormEvent } from 'react';
import { pairTv } from '@/lib/tv/client';

export default function AddTvForm({ onPaired }: { onPaired: () => void }) {
  const [code, setCode] = useState('');
  const [pairing, setPairing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || pairing) return;
    setPairing(true);
    setError(null);
    const result = await pairTv(code);
    setPairing(false);
    if (result.ok) {
      setCode('');
      onPaired();
    } else {
      setError(result.error);
    }
  }

  return (
    <form className="dashboard-card dashboard-add-tv-form" onSubmit={handleSubmit}>
      <h2 className="dashboard-card-title">Add a TV</h2>
      <p className="dashboard-settings-row">
        Enter the 6-digit code shown on your TV&apos;s pairing screen.
      </p>
      <div className="dashboard-add-tv-row">
        <input
          id="tv-pair-code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="6-digit pairing code"
          className="account-input dashboard-add-tv-input"
          placeholder="123456"
          value={code}
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        <button
          type="submit"
          className="dashboard-plus-btn dashboard-add-tv-btn"
          disabled={code.length !== 6 || pairing}
        >
          {pairing ? 'Adding…' : 'Add'}
        </button>
      </div>
      {error && (
        <p className="account-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
