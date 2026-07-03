/**
 * auth/client.ts — Hasura Auth client for PrayCalc (client-side, Astro-clean).
 *
 * PURPOSE: Talk directly to the shared Ummat Hasura Auth instance
 *   (auth.ummat.dev) from the browser. No server-side proxy routes exist in
 *   this Astro app, so requests go straight to AUTH_URL.
 * INPUTS: email/password or refresh tokens from the account island.
 * OUTPUTS: AuthResult ({ user, tokens }) on success; throws Error with a
 *   user-presentable .message on failure.
 * CONSTRAINTS: No next/* imports, no Node/process.env — uses
 *   import.meta.env.PUBLIC_AUTH_URL (Astro client-exposed env convention).
 *   Response parsing is defensive: accepts the flat shape used by the live
 *   sibling app (ummat/app/web) — { accessToken, refreshToken, user } — and
 *   falls back to unwrapping a nested { session: {...} } shape (Hasura
 *   Auth's documented contract) so either backend response works.
 * REF: task — real auth for account island (2026-07)
 */

const AUTH_URL: string =
  (import.meta.env.PUBLIC_AUTH_URL as string | undefined) || 'https://auth.ummat.dev';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when the access token expires. */
  accessTokenExpiresAt: number;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

/** Raw shapes we tolerate from the backend. */
interface FlatAuthResponse {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresIn?: number;
  user?: { id?: string; email?: string; displayName?: string };
  session?: {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresIn?: number;
    user?: { id?: string; email?: string; displayName?: string };
  };
}

const DEFAULT_EXPIRES_IN_SECONDS = 15 * 60; // 15 minutes, used when the backend omits it.

/**
 * Normalize a Hasura Auth response into AuthResult. Accepts the flat shape
 * ({ accessToken, refreshToken, user }) as primary and falls back to
 * unwrapping a nested `session` object if present.
 */
function parseAuthResponse(data: FlatAuthResponse): AuthResult {
  const src = data.accessToken ? data : (data.session ?? data);
  const accessToken = src.accessToken;
  const refreshToken = src.refreshToken;
  if (!accessToken || !refreshToken) {
    throw new Error('Unexpected response from auth server.');
  }
  const expiresInSeconds = src.accessTokenExpiresIn ?? DEFAULT_EXPIRES_IN_SECONDS;
  const user = src.user ?? {};
  return {
    user: {
      id: user.id ?? '',
      email: user.email ?? '',
      // When the server sends no display name, derive a friendly one from the
      // email local-part (john.doe@… → "john doe"), matching buildSession.
      displayName:
        user.displayName || user.email?.split('@')[0]?.replace(/[._-]+/g, ' ') || '',
    },
    tokens: {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: Date.now() + expiresInSeconds * 1000,
    },
  };
}

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string };
    return body.message || body.error || fallback;
  } catch {
    return fallback;
  }
}

/** Sign in with email + password. */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/v1/auth/signin/email-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Invalid email or password.'));
  }
  return parseAuthResponse((await res.json()) as FlatAuthResponse);
}

/** Register a new account with email + password. */
export async function signUp(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/v1/auth/signup/email-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      options: displayName ? { displayName } : undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Registration failed.'));
  }
  return parseAuthResponse((await res.json()) as FlatAuthResponse);
}

/** Request a passwordless magic-link email. No session is created until the link is clicked. */
export async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/v1/auth/signin/passwordless/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Failed to send login link.'));
  }
}

/** Exchange a refresh token for a new access token + user info. */
export async function refreshSession(refreshToken: string): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, 'Session refresh failed.'));
  }
  return parseAuthResponse((await res.json()) as FlatAuthResponse);
}

/** Sign out (invalidate refresh token). Best-effort — never throws. */
export async function signOut(refreshToken: string): Promise<void> {
  try {
    await fetch(`${AUTH_URL}/v1/auth/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken, all: false }),
    });
  } catch {
    // Best-effort. Session is cleared client-side regardless.
  }
}
