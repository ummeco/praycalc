/**
 * Purpose: Persist the last-known-good Ummat+ entitlement so a transient billing
 *   API failure (network blip, 5xx, offline) never wrongly downgrades a paying
 *   user to the free upsell — mirrors auth-store.ts's own dedicated-file pattern
 *   (kept separate from auth.json so entitlement caching never mingles with
 *   session tokens).
 * Inputs: an `EntitlementStatus` to cache (`saveCachedEntitlement`).
 * Outputs: the cached status + when it was last confirmed via a real network
 *   success (`loadCachedEntitlement`), or null if there is no cache yet.
 * Constraints: no `any`; module-level cache like store.ts/auth-store.ts's `_store`.
 * SPORT: praycalc desktop — account sign-in (entitlement cache).
 */
import { load } from '@tauri-apps/plugin-store';
import type { EntitlementStatus } from './auth-types';

/** How stale a cached entitlement may be before we stop trusting it as a
 * fallback and default to the free upsell instead. 7 days comfortably covers
 * short outages/offline stretches while still eventually re-verifying a
 * lapsed/cancelled subscription. */
export const ENTITLEMENT_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface CachedEntitlement {
  status: EntitlementStatus;
  /** Epoch ms of the last successful (2xx, well-formed) network check. */
  checkedAt: number;
}

let _store: Awaited<ReturnType<typeof load>> | null = null;

async function getEntitlementStore() {
  if (!_store) _store = await load('entitlement.json');
  return _store;
}

/** Loads the last-known-good entitlement, or null if none has ever been cached. */
export async function loadCachedEntitlement(): Promise<CachedEntitlement | null> {
  try {
    const store = await getEntitlementStore();
    const isPlus = await store.get<boolean>('isPlus');
    const checkedAt = await store.get<number>('checkedAt');
    if (typeof isPlus !== 'boolean' || typeof checkedAt !== 'number') return null;
    return { status: { isPlus }, checkedAt };
  } catch {
    // Store unavailable (e.g. disk error) — no cache to fall back on.
    return null;
  }
}

/** Persists a fresh, network-confirmed entitlement as the new last-known-good value. */
export async function saveCachedEntitlement(status: EntitlementStatus): Promise<void> {
  try {
    const store = await getEntitlementStore();
    await store.set('isPlus', status.isPlus);
    await store.set('checkedAt', Date.now());
    await store.save();
  } catch {
    // Best-effort — a failed cache write must never block the entitlement check itself.
  }
}

/** True if a cached entitlement is still within the staleness bound. */
export function isCacheFresh(cached: CachedEntitlement): boolean {
  return Date.now() - cached.checkedAt <= ENTITLEMENT_CACHE_MAX_AGE_MS;
}
