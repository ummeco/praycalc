/**
 * session.ts — PrayCalc client-side session (non-sensitive profile only).
 *
 * PURPOSE: Store a lightweight user profile in localStorage for fast UI reads
 *   on the account page and the city-page settings panel. No JWT/token is ever
 *   stored here. Safe for React islands (client-only, SSR-guarded).
 * INPUTS: email / displayName (sign-in) or a pre-built PrayCalcSession (seed).
 * OUTPUTS: PrayCalcSession for UI consumption.
 * CONSTRAINTS: No server-only imports, no Node APIs. localStorage key 'praycalc-session'.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts
 */

export interface PrayCalcSession {
  email: string;
  displayName: string;
  initials: string;
  isOwner: boolean;
  isUmmatPlus: boolean;
}

const SESSION_KEY = 'praycalc-session';

/** Derive up-to-two-letter initials from a display name. */
export function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Build a client session from an email (+ optional display name).
 * Display name defaults to the email local-part with separators turned to spaces
 * (e.g. 'john.doe@example.com' -> 'john doe'). isOwner/isUmmatPlus are false here;
 * elevated roles are only ever set by a seeded/server session, never client email.
 */
export function buildSession(email: string, displayName?: string): PrayCalcSession {
  const trimmed = email.trim().toLowerCase();
  const name = displayName?.trim() || trimmed.split('@')[0]!.replace(/[._-]+/g, ' ');
  return {
    email: trimmed,
    displayName: name,
    initials: computeInitials(name),
    isOwner: false,
    isUmmatPlus: false,
  };
}

export function getSession(): PrayCalcSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PrayCalcSession;
  } catch {
    return null;
  }
}

export function saveSession(session: PrayCalcSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable (private mode) — ignore
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
