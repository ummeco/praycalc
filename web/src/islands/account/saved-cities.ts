/**
 * saved-cities.ts — localStorage-backed "saved cities" list for the account dashboard.
 *
 * PURPOSE: Read/write the user's saved-city shortcuts shown on the account
 *   dashboard (Dashboard.tsx). Extracted from AccountClient.tsx so the client
 *   island files stay under the 300-line cap and this pure-storage logic is
 *   independently testable.
 * INPUTS: city slug (string)
 * OUTPUTS: SavedCity[] read from / written to localStorage key 'praycalc-saved-cities'
 * CONSTRAINTS: Browser-only (localStorage). Safe to call during SSR only inside
 *   try/catch — callers already gate on client-side effects.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts
 */

const CITIES_KEY = 'praycalc-saved-cities';

export interface SavedCity {
  slug: string;
  displayName: string;
  savedAt: number;
}

/** Reads the saved-cities list from localStorage. Returns [] on any parse/storage error. */
export function getSavedCities(): SavedCity[] {
  try {
    return JSON.parse(localStorage.getItem(CITIES_KEY) ?? '[]') as SavedCity[];
  } catch {
    return [];
  }
}

/** Removes a city by slug and persists the updated list. Returns the new list. */
export function removeSavedCity(slug: string): SavedCity[] {
  const updated = getSavedCities().filter((c) => c.slug !== slug);
  localStorage.setItem(CITIES_KEY, JSON.stringify(updated));
  return updated;
}
