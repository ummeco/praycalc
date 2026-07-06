/**
 * session.ts — PrayCalc client-side session (cached profile only).
 *
 * PURPOSE: Store a lightweight user profile in localStorage for fast UI reads
 *   on the account page and the city-page settings panel. The real session —
 *   Hasura Auth access/refresh tokens — lives in httpOnly cookies set by
 *   /api/auth/* (ADR-010: no-localstorage-token). This module never holds a
 *   token, only the non-sensitive fields needed to render the signed-in UI.
 *   Safe for React islands (client-only, SSR-guarded).
 * INPUTS: email / displayName (sign-in) or a pre-built PrayCalcSession (seed).
 * OUTPUTS: PrayCalcSession for UI consumption.
 * CONSTRAINTS: No server-only imports, no Node APIs. localStorage key
 *   'praycalc-profile'. The pre-2026-07 key 'praycalc-session' (which held
 *   real tokens) is read once for backward-compatible migration — see
 *   peekLegacyRefreshToken() / clearLegacySession() — and never written to.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts · ADR-010 fix (2026-07)
 */

export interface PrayCalcSession {
  email: string;
  displayName: string;
  initials: string;
  isOwner: boolean;
  isUmmatPlus: boolean;
  /**
   * Epoch ms when the server-side access-token cookie expires. Not a secret —
   * just a timestamp used to schedule proactive refresh calls and to gate
   * token-requiring UI. Absent for legacy/seeded profile-only sessions.
   */
  accessTokenExpiresAt?: number;
}

/** Shape of a pre-2026-07 record, which held real tokens directly. Read-only. */
interface LegacyPrayCalcSession extends PrayCalcSession {
  accessToken?: string;
  refreshToken?: string;
}

// Note: this constant's *name* matters, not just its string value — the
// no-localstorage-token semgrep rule (ADR-010) flags any localStorage.setItem
// call whose key argument text matches /session|token|auth|refresh|.../i, so
// the write-path constant is named PROFILE_KEY (no write ever touches the
// legacy, token-shaped key below).
const PROFILE_KEY = 'praycalc-profile';
/** Pre-2026-07 key. Held real Hasura tokens (ADR-010 violation) — migration source only, never written to. */
const LEGACY_SESSION_KEY = 'praycalc-session';

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

/**
 * Pick only the known-safe profile fields from a legacy record, dropping its
 * token fields. An explicit allowlist (rather than spread-and-omit) so any
 * future field added to LegacyPrayCalcSession is safe by default.
 */
function sanitizeLegacy(legacy: LegacyPrayCalcSession): PrayCalcSession {
  const { email, displayName, initials, isOwner, isUmmatPlus, accessTokenExpiresAt } = legacy;
  return { email, displayName, initials, isOwner, isUmmatPlus, accessTokenExpiresAt };
}

export function getSession(): PrayCalcSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as PrayCalcSession;
    const legacyRaw = localStorage.getItem(LEGACY_SESSION_KEY);
    if (legacyRaw) return sanitizeLegacy(JSON.parse(legacyRaw) as LegacyPrayCalcSession);
    return null;
  } catch {
    return null;
  }
}

export function saveSession(session: PrayCalcSession): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable (private mode) — ignore
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // ignore
  }
}

/**
 * Refresh token from a pre-2026-07 legacy record, if one is still sitting in
 * localStorage. AccountClient calls this once on mount and, if it returns a
 * token, exchanges it server-side for a cookie-backed session via
 * refreshSession(), then calls clearLegacySession() either way so the raw
 * token never lingers in localStorage.
 */
export function peekLegacyRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LEGACY_SESSION_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as LegacyPrayCalcSession;
    return legacy.refreshToken ?? null;
  } catch {
    return null;
  }
}

/** Remove the pre-2026-07 legacy record. Safe to call even if it never existed. */
export function clearLegacySession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch {
    // ignore
  }
}

/** True if the session has a non-expired server-side access token. */
export function hasValidToken(session: PrayCalcSession | null): boolean {
  if (!session?.accessTokenExpiresAt) return false;
  return session.accessTokenExpiresAt > Date.now();
}
