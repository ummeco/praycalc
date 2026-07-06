/**
 * auth/client.ts — client-side auth calls for PrayCalc (Astro-clean).
 *
 * PURPOSE: Talk to PrayCalc's own same-origin /api/auth/* proxy routes for
 *   anything that issues or refreshes tokens, so the tokens themselves are
 *   set as httpOnly cookies server-side and never reach this module (ADR-010
 *   fix — tokens used to be returned here and stored in localStorage).
 *   requestMagicLink() is the one exception: it never returns a token (only
 *   triggers an email), so it still calls the shared Ummat Hasura Auth
 *   instance (auth.ummat.dev) directly.
 * INPUTS: email/password from the account island, or nothing (cookie-based
 *   refresh/sign-out) — refreshSession/signOut optionally accept a raw
 *   refresh token string for the one-time legacy-localStorage migration path.
 * OUTPUTS: AuthResult ({ user, accessTokenExpiresAt }) on success; throws an
 *   Error with a user-presentable .message on failure.
 * CONSTRAINTS: No next/* imports, no Node/process.env — uses
 *   import.meta.env.PUBLIC_AUTH_URL (Astro client-exposed env convention).
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

const AUTH_URL: string =
  (import.meta.env.PUBLIC_AUTH_URL as string | undefined) || 'https://auth.ummat.dev';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthResult {
  user: AuthUser;
  /** Epoch ms when the server-side access-token cookie expires. */
  accessTokenExpiresAt: number;
}

async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || 'Request failed.');
  }
  return data as T;
}

/** Sign in with email + password. Tokens are set as httpOnly cookies server-side. */
export function signIn(email: string, password: string): Promise<AuthResult> {
  return postJson<AuthResult>('/api/auth/signin', { email, password });
}

/** Register a new account with email + password. */
export function signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
  return postJson<AuthResult>('/api/auth/signup', { email, password, displayName });
}

/** Request a passwordless magic-link email. No session is created until the link is clicked. */
export async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/v1/auth/signin/passwordless/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message || 'Failed to send login link.');
  }
}

/**
 * Refresh the access token. In steady state, the refresh token comes from
 * the httpOnly cookie and no argument is needed. Pass `legacyRefreshToken`
 * only for the one-time migration of a pre-2026-07 localStorage session.
 */
export function refreshSession(legacyRefreshToken?: string): Promise<AuthResult> {
  return postJson<AuthResult>(
    '/api/auth/refresh',
    legacyRefreshToken ? { refreshToken: legacyRefreshToken } : undefined,
  );
}

/**
 * Sign out (invalidate the refresh token + clear cookies). Best-effort —
 * never throws. Pass `legacyRefreshToken` to also invalidate a pre-2026-07
 * localStorage token that was never migrated into a cookie.
 */
export async function signOut(legacyRefreshToken?: string): Promise<void> {
  try {
    await postJson('/api/auth/signout', legacyRefreshToken ? { refreshToken: legacyRefreshToken } : undefined);
  } catch {
    // Best-effort. Session is cleared client-side regardless.
  }
}
