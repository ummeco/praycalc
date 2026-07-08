/**
 * Purpose: Ummat account sign-in client (hasura-auth REST) + Ummat+ entitlement check.
 * Inputs: email/password for sign-in/sign-up; a persisted AuthSession for refresh/sign-out.
 * Outputs: AuthSession on success (also persisted via auth-store.ts); EntitlementStatus.
 * Constraints: pure `fetch()` — no Rust invoke() needed (public HTTP APIs). Defensive
 *   parsing throughout: network/parse/4xx failures never throw past the public functions
 *   except signIn/signUp/refreshToken which throw a short Error message for the caller's
 *   UI to display. signOut/checkEntitlement never throw (best-effort).
 * SPORT: praycalc desktop — account sign-in (auth client).
 */
import type {
  AuthSession,
  EntitlementStatus,
  HasuraAuthSuccess,
  HasuraAuthRefreshSuccess,
} from './auth-types';
import { loadPersistedSession, persistSession, clearPersistedSession } from './auth-store';
import { loadCachedEntitlement, saveCachedEntitlement, isCacheFresh } from './entitlement-store';

const AUTH_URL: string =
  (import.meta.env.VITE_AUTH_URL as string | undefined) ?? 'https://auth.ummat.dev';
const BILLING_URL: string =
  (import.meta.env.VITE_BILLING_URL as string | undefined) ?? 'https://smart.praycalc.com/billing';

function sessionFromHasura(resp: HasuraAuthSuccess, fallbackEmail: string): AuthSession {
  const s = resp.session;
  if (!s) throw new Error('No session returned');
  return {
    accessToken: s.accessToken,
    refreshToken: s.refreshToken,
    expiresAt: Date.now() + s.accessTokenExpiresIn * 1000,
    email: s.user?.email ?? fallbackEmail,
    displayName: s.user?.displayName ?? '',
  };
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : null) ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

/** Sign in with email + password. Persists and returns the new session. */
export async function signIn(email: string, password: string): Promise<AuthSession> {
  const resp = await postJson<HasuraAuthSuccess>(`${AUTH_URL}/signin/email-password`, {
    email,
    password,
  });
  const session = sessionFromHasura(resp, email);
  await persistSession(session);
  return session;
}

/** Create a new Ummat account with email + password. Persists and returns the new session. */
export async function signUp(email: string, password: string): Promise<AuthSession> {
  const resp = await postJson<HasuraAuthSuccess>(`${AUTH_URL}/signup/email-password`, {
    email,
    password,
  });
  const session = sessionFromHasura(resp, email);
  await persistSession(session);
  return session;
}

/** Exchange a refresh token for a new access token. Persists and returns the refreshed session. */
export async function refreshToken(
  refreshTokenValue: string,
  knownEmail = '',
  knownDisplayName = '',
): Promise<AuthSession> {
  const resp = await postJson<HasuraAuthRefreshSuccess>(`${AUTH_URL}/token`, {
    refreshToken: refreshTokenValue,
  });
  const session: AuthSession = {
    accessToken: resp.accessToken,
    refreshToken: resp.refreshToken,
    expiresAt: Date.now() + resp.accessTokenExpiresIn * 1000,
    email: knownEmail,
    displayName: knownDisplayName,
  };
  await persistSession(session);
  return session;
}

/** Best-effort sign-out — clears local session regardless of network outcome. */
export async function signOut(refreshTokenValue: string): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenValue, all: false }),
    });
  } catch {
    // best-effort — ignore network errors, still clear local state below
  }
  await clearPersistedSession();
}

/** Clear local session state only (no network call). */
export async function clearAuth(): Promise<void> {
  await clearPersistedSession();
}

/**
 * Restore a persisted session on startup. If it has already expired, attempts a
 * refresh immediately. Returns null if there is no session or the refresh fails
 * (in which case the stale local session is also cleared).
 */
export async function loadAuthState(): Promise<AuthSession | null> {
  const saved = await loadPersistedSession();
  if (!saved) return null;
  if (Date.now() < saved.expiresAt) return saved;
  try {
    return await refreshToken(saved.refreshToken, saved.email, saved.displayName);
  } catch {
    await clearPersistedSession();
    return null;
  }
}

/**
 * Schedule an automatic refresh 60s before the session expires.
 * Returns a cancel function (same cleanup-fn-return pattern as App.tsx's useEffects).
 */
export function scheduleRefresh(
  state: AuthSession,
  onRefreshed: (next: AuthSession | null) => void,
): () => void {
  const delay = Math.max(0, state.expiresAt - Date.now() - 60_000);
  const id = setTimeout(() => {
    refreshToken(state.refreshToken, state.email, state.displayName)
      .then(onRefreshed)
      .catch(() => onRefreshed(null));
  }, delay);
  return () => clearTimeout(id);
}

/**
 * Check Ummat+ entitlement for the signed-in user. Parses defensively and never
 * throws. On a *transient* failure (network error, non-2xx status, or a
 * malformed body — anything that isn't a clean "yes"/"no" answer from the
 * server) this falls back to the last network-confirmed ("last-known-good")
 * entitlement instead of assuming `{ isPlus: false }`, so a paying Ummat+ user
 * is never wrongly downgraded to the free upsell by a billing-API blip or a
 * brief offline stretch. The fallback itself expires after
 * `ENTITLEMENT_CACHE_MAX_AGE_MS` so a lapsed/cancelled subscription still
 * eventually reverts to free once the cache goes stale. A genuine 2xx response
 * (even one that says `isPlus: false`) always wins and refreshes the cache —
 * only failures fall back to it.
 */
export async function checkEntitlement(accessToken: string): Promise<EntitlementStatus> {
  try {
    const res = await fetch(`${BILLING_URL}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return await fallbackToCachedEntitlement();
    const data: unknown = await res.json().catch(() => null);
    if (data && typeof data === 'object' && 'isPlus' in data) {
      const status: EntitlementStatus = { isPlus: Boolean((data as { isPlus: unknown }).isPlus) };
      await saveCachedEntitlement(status);
      return status;
    }
    return await fallbackToCachedEntitlement();
  } catch {
    return await fallbackToCachedEntitlement();
  }
}

/** Shared fallback for checkEntitlement's failure paths — see its doc comment. */
async function fallbackToCachedEntitlement(): Promise<EntitlementStatus> {
  const cached = await loadCachedEntitlement();
  if (cached && isCacheFresh(cached)) return cached.status;
  return { isPlus: false };
}
