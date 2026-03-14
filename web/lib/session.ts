import type { AuthResult, AuthTokens } from "./auth-client";

/** Hardcoded owner: always gets full access + all Ummat Pro entities, for free. */
export const OWNER_EMAIL = "alisalaah@gmail.com";

export interface PrayCalcSession {
  email: string;
  displayName: string;
  initials: string;
  photoUrl?: string;
  /** True only for the hardcoded owner account. */
  isOwner: boolean;
  /** True for owner + any future paid Ummat+ subscriber. */
  isUmmatPlus: boolean;
  /** Hasura Auth user ID (absent for legacy/test sessions). */
  userId?: string;
  /** JWT tokens (absent for legacy/test sessions). */
  tokens?: AuthTokens;
}

const SESSION_KEY = "praycalc-session";

function computeInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Build a session from an email (legacy stub path, used by E2E tests and stub forms). */
export function buildSession(
  email: string,
  displayName?: string,
): PrayCalcSession {
  const trimmed = email.trim().toLowerCase();
  const name =
    displayName?.trim() ||
    trimmed.split("@")[0].replace(/[._-]+/g, " ");
  const isOwner = trimmed === OWNER_EMAIL.toLowerCase();
  return {
    email: trimmed,
    displayName: name,
    initials: computeInitials(name),
    isOwner,
    isUmmatPlus: isOwner,
  };
}

/** Build a session from a Hasura Auth result (real auth path). */
export function buildSessionFromAuth(result: AuthResult): PrayCalcSession {
  const { user, tokens } = result;
  const email = user.email.toLowerCase();
  const name = user.displayName || email.split("@")[0].replace(/[._-]+/g, " ");
  const isOwner = email === OWNER_EMAIL.toLowerCase();
  return {
    email,
    displayName: name,
    initials: computeInitials(name),
    photoUrl: user.avatarUrl,
    isOwner,
    isUmmatPlus: isOwner,
    userId: user.id,
    tokens,
  };
}

export function getSession(): PrayCalcSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PrayCalcSession;
  } catch {
    return null;
  }
}

/** SEC-B2: Cookie name used to signal auth state to Next.js middleware.
 *  Non-httpOnly (readable by JS) — carries no sensitive data. The actual
 *  JWT is in localStorage; this cookie only tells the Edge Runtime whether
 *  to redirect unauthenticated users away from /dashboard/* routes. */
const AUTH_COOKIE = "pc-auth";

export function saveSession(session: PrayCalcSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    // Signal to middleware that a session exists (1-year, SameSite=Lax, no token value).
    document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    // localStorage unavailable
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
    // Remove the auth signal cookie.
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    // ignore
  }
}
