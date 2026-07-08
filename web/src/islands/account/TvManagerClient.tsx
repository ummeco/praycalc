/**
 * TvManagerClient.tsx — PrayCalc "My TVs" management island.
 *
 * PURPOSE: Top-level orchestration for the signed-in user's paired TVs
 *   (pc_tv_settings): Ummat+ gate, list load, pair-by-code, and per-TV
 *   card rendering. Ummat+ gate mirrors AccountClient's dashboard —
 *   non-Plus users see an upgrade prompt instead of the manager.
 * INPUTS: none (reads its own data via src/lib/tv/client.ts on mount).
 * OUTPUTS: none — self-contained island.
 * CONSTRAINTS: Astro island (client:load). No next/* imports. SSR-safe (all
 *   data fetching happens in useEffect, after mount). All CRUD goes through
 *   the same-origin /api/tvs route — never calls Hasura directly. Kept under
 *   the 300-line cap by delegating to the AddTvForm.tsx and TvCard.tsx
 *   (which itself delegates to TvDeepSettingsEditor.tsx) siblings.
 * REF: src/islands/account/AccountClient.tsx (dashboard/Plus-gate pattern) ·
 *   src/lib/tv/client.ts · src/pages/account/tvs.astro ·
 *   src/islands/account/{AddTvForm,TvCard,TvDeepSettingsEditor}.tsx
 */

import { useEffect, useState } from 'react';
import { getBillingStatus } from '@/lib/billing';
import { listTvs, type TvSetting } from '@/lib/tv/client';
import AddTvForm from './AddTvForm';
import TvCard from './TvCard';

type LoadState = 'loading' | 'ready' | 'error';
type PlusState = 'checking' | 'plus' | 'free';

export default function TvManagerClient() {
  const [plusState, setPlusState] = useState<PlusState>('checking');
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [tvs, setTvs] = useState<TvSetting[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getBillingStatus().then((status) => {
      if (cancelled) return;
      setPlusState(status.plan === 'plus' && status.isActive ? 'plus' : 'free');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (plusState !== 'plus') return;
    let cancelled = false;
    setLoadState('loading');
    listTvs().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setTvs(result.tvs);
        setLoadState('ready');
      } else {
        setLoadError(result.error);
        setLoadState('error');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [plusState]);

  function handleTvUpdated(updated: TvSetting) {
    setTvs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleTvDeleted(id: string) {
    setTvs((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleTvPaired() {
    const result = await listTvs();
    if (result.ok) setTvs(result.tvs);
  }

  if (plusState === 'checking') {
    return <div className="account-loading" aria-hidden="true" />;
  }

  if (plusState === 'free') {
    return (
      <div className="dashboard-plus-card">
        <div className="dashboard-plus-header">
          <span className="dashboard-plus-name">Ummat+</span>
          <span className="dashboard-plus-price">$9.99/yr</span>
        </div>
        <p className="dashboard-plus-tagline">
          TV management is part of Ummat+. Upgrade to pair and customize TVs running the
          PrayCalc TV app.
        </p>
        <a href="/upgrade" className="dashboard-plus-btn">
          Upgrade to Ummat+
        </a>
      </div>
    );
  }

  if (loadState === 'loading') {
    return <div className="account-loading" aria-hidden="true" />;
  }

  if (loadState === 'error') {
    return (
      <p className="account-error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <div className="dashboard-tvs-wrapper">
      <AddTvForm onPaired={handleTvPaired} />

      {tvs.length === 0 ? (
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">My TVs</h2>
          <p className="dashboard-settings-row">
            Enter the 6-digit code shown on your TV&apos;s pairing screen above, or open
            PrayCalc on your phone, go to Settings → TV Pairing, and follow the on-screen code.
          </p>
        </div>
      ) : (
        <div className="dashboard-tvs-list" aria-label="Your paired TVs">
          {tvs.map((tv) => (
            <TvCard key={tv.id} tv={tv} onUpdated={handleTvUpdated} onDeleted={handleTvDeleted} />
          ))}
        </div>
      )}
    </div>
  );
}
