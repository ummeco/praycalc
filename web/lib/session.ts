/**
 * session.ts — PrayCalc client-side session state (non-sensitive profile only).
 *
 * Purpose: Store non-sensitive user profile in localStorage for fast UI reads.
 *          JWT tokens are stored exclusively in httpOnly cookies set by the
 *          server at /api/auth/signin, /api/auth/refresh, /api/auth/signout.
 *          JS code never has access to the JWT.
 * Inputs:  Profile data from server auth endpoints (no token fields).
 * Outputs: PrayCalcSession object for UI consumption.
 * Constraints:
 *   - No JWT or refresh token stored here — httpOnly cookies only.
 *   - isOwner derived from Hasura JWT claims (x-hasura-default-role = 'owner')
 *     via the verified JWT in the cookie; never from a hardcoded email.
 *   - isUmmatPlus derived from x-hasura-allowed-roles claim in the JWT.
 * SPORT: P2-E1-W01 Track E (praycalc session httpOnly cookie + isOwner fix).
 */

export interface PrayCalcSession {
  email: string
  displayName: string
  initials: string
  photoUrl?: string
  /** True only when x-hasura-default-role = 'owner' in the verified JWT. */
  isOwner: boolean
  /** True for owner + any Ummat+ subscriber. */
  isUmmatPlus: boolean
  /** Hasura Auth user ID. */
  userId?: string
  /** Expiry timestamp (ms) for the access token — used to schedule refresh. */
  accessTokenExpiresAt?: number
}

const SESSION_KEY = 'praycalc-session'

function computeInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

/**
 * Build a session from the server-side auth response profile.
 * isOwner + isUmmatPlus are set by the server based on verified JWT claims —
 * never hardcoded client-side.
 */
export function buildSessionFromProfile(profile: {
  userId: string
  email: string
  displayName?: string | null
  avatarUrl?: string | null
  accessTokenExpiresAt?: number
  isOwner?: boolean
  isUmmatPlus?: boolean
}): PrayCalcSession {
  const email = profile.email.toLowerCase()
  const name = profile.displayName?.trim() || email.split('@')[0].replace(/[._-]+/g, ' ')
  return {
    email,
    displayName: name,
    initials: computeInitials(name),
    photoUrl: profile.avatarUrl ?? undefined,
    isOwner: profile.isOwner ?? false,
    isUmmatPlus: profile.isUmmatPlus ?? profile.isOwner ?? false,
    userId: profile.userId,
    accessTokenExpiresAt: profile.accessTokenExpiresAt,
  }
}

/**
 * @deprecated Legacy stub path for E2E tests only.
 * New code must use buildSessionFromProfile with server-verified claims.
 */
export function buildSession(email: string, displayName?: string): PrayCalcSession {
  const trimmed = email.trim().toLowerCase()
  const name = displayName?.trim() || trimmed.split('@')[0].replace(/[._-]+/g, ' ')
  return {
    email: trimmed,
    displayName: name,
    initials: computeInitials(name),
    isOwner: false, // never set from client-side email match
    isUmmatPlus: false,
  }
}

export function getSession(): PrayCalcSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PrayCalcSession
  } catch {
    return null
  }
}

/**
 * Middleware signal cookie — non-httpOnly (readable by JS), carries no sensitive data.
 * Used by Next.js Edge middleware to determine whether to redirect unauthenticated users.
 */
const AUTH_SIGNAL_COOKIE = 'pc-auth'

export function saveSession(session: PrayCalcSession): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    // Signal cookie for middleware (1 year, SameSite=Lax, no token value).
    document.cookie = `${AUTH_SIGNAL_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
  } catch {
    // localStorage unavailable — signal cookie still set
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(SESSION_KEY)
    document.cookie = `${AUTH_SIGNAL_COOKIE}=; path=/; max-age=0; SameSite=Lax`
  } catch {
    // ignore
  }
}
