/**
 * Purpose: nhost/hasura-auth REST client — signup, signin, token refresh.
 * Inputs: email, password, optional displayName
 * Outputs: { accessToken, refreshToken, user } on success; throws on failure
 * Constraints: hasura-auth 0.36 serves BARE paths (/signin/email-password, /token,
 *   /signout) — verified live on auth.ummat.dev AND local nginx. The /v1/auth/*
 *   prefix 502s in production (no such upstream route); do not reintroduce it.
 *   AUTH_URL from EXPO_PUBLIC_AUTH_URL, default https://auth.ummat.dev.
 *   Anonymous mode never calls this module (D-P2-AUTH-TRANSPORT invariant).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-auth-client
 */

import { AUTH_URL } from '../../constants';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface HasuraAuthSignupResponse {
  session: AuthSession | null;
}

interface HasuraAuthSigninResponse {
  session: AuthSession;
}

interface HasuraAuthRefreshResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${AUTH_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null) as { message?: string } | null;
    throw new Error(errorBody?.message ?? `Auth request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

/** Create a new account. Returns null session when email verification is required. */
export async function signup(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthSession | null> {
  const data = await postJson<HasuraAuthSignupResponse>('/signup/email-password', {
    email,
    password,
    options: displayName ? { displayName } : undefined,
  });
  return data.session;
}

/** Sign in with an existing account. */
export async function signin(email: string, password: string): Promise<AuthSession> {
  const data = await postJson<HasuraAuthSigninResponse>('/signin/email-password', {
    email,
    password,
  });
  return data.session;
}

/** Exchange a refresh token for a new access token. */
export async function refreshToken(refreshTokenValue: string): Promise<HasuraAuthRefreshResponse> {
  return postJson<HasuraAuthRefreshResponse>('/token', {
    refreshToken: refreshTokenValue,
  });
}
