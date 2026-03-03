/** Hardcoded owner — always gets full access + all Ummat Pro entities, for free. */
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
}

const SESSION_KEY = "praycalc-session";

export function buildSession(
  email: string,
  displayName?: string,
): PrayCalcSession {
  const trimmed = email.trim().toLowerCase();
  const name =
    displayName?.trim() ||
    trimmed.split("@")[0].replace(/[._-]+/g, " ");
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  const isOwner = trimmed === OWNER_EMAIL.toLowerCase();
  return {
    email: trimmed,
    displayName: name,
    initials,
    isOwner,
    isUmmatPlus: isOwner, // expand when Ummat+ billing ships
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

export function saveSession(session: PrayCalcSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // localStorage unavailable
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
