/**
 * hasura.server.ts — server-side Hasura Auth API calls for the /api/auth/* proxy routes.
 *
 * PURPOSE: Thin fetch wrappers to the shared Ummat Hasura Auth instance
 *   (auth.ummat.dev). Every call that exchanges or issues tokens goes through
 *   here so the routes themselves only deal with cookies, never raw HTTP.
 * INPUTS: email/password or a refresh token.
 * OUTPUTS: a discriminated result — { ok: true, session } with real tokens on
 *   success, or { ok: false, status, message } on failure. Never throws for
 *   expected auth failures (invalid credentials, expired token); network
 *   errors from fetch() itself still propagate.
 * CONSTRAINTS: Server-only — never imported by client-bundled code. Response
 *   parsing accepts both the flat shape ({ accessToken, refreshToken, user })
 *   and the nested Hasura Auth { session: {...} } shape, matching the
 *   defensive parsing the old client-side code used.
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

const AUTH_URL: string =
  (import.meta.env.PUBLIC_AUTH_URL as string | undefined) || 'https://auth.ummat.dev';

export interface HasuraAuthUser {
  id?: string;
  email?: string;
  displayName?: string;
}

export interface HasuraSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn?: number;
  user: HasuraAuthUser;
}

export type HasuraAuthResult =
  | { ok: true; session: HasuraSession }
  | { ok: false; status: number; message: string };

interface RawAuthResponse {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresIn?: number;
  user?: HasuraAuthUser;
  session?: {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: number;
    user?: HasuraAuthUser;
  };
  message?: string;
  error?: string;
}

async function postHasuraAuth(path: string, body: unknown): Promise<HasuraAuthResult> {
  const res = await fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as RawAuthResponse;

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message: data.message || data.error || 'Authentication failed.',
    };
  }

  const src = data.accessToken ? data : (data.session ?? data);
  if (!src.accessToken || !src.refreshToken) {
    return { ok: false, status: 502, message: 'Unexpected response from auth server.' };
  }

  return {
    ok: true,
    session: {
      accessToken: src.accessToken,
      refreshToken: src.refreshToken,
      accessTokenExpiresIn: src.accessTokenExpiresIn,
      user: src.user ?? {},
    },
  };
}

/** Sign in with email + password. */
export function signInEmailPassword(email: string, password: string): Promise<HasuraAuthResult> {
  return postHasuraAuth('/v1/auth/signin/email-password', { email, password });
}

/** Register a new account with email + password. */
export function signUpEmailPassword(
  email: string,
  password: string,
  displayName?: string,
): Promise<HasuraAuthResult> {
  return postHasuraAuth('/v1/auth/signup/email-password', {
    email,
    password,
    options: displayName ? { displayName } : undefined,
  });
}

/** Exchange a refresh token for a new access + refresh token pair. */
export function refreshWithToken(refreshToken: string): Promise<HasuraAuthResult> {
  return postHasuraAuth('/v1/auth/token', { refreshToken });
}

/** Invalidate a refresh token. Best-effort — never throws. */
export async function signOutWithToken(refreshToken: string): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/v1/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, all: false }),
    });
  } catch {
    // Best-effort. Cookies are cleared regardless by the caller.
  }
}
