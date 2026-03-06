/**
 * Hasura Auth API client for PrayCalc.
 *
 * All authentication goes through the shared Hasura Auth instance at auth.ummat.dev.
 * This module handles token exchange, sign-in, sign-up, magic links, and sign-out.
 */

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.ummat.dev";

interface TokenResponse {
  session: {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
    user: {
      id: string;
      email?: string;
      displayName?: string;
      avatarUrl?: string;
      metadata?: Record<string, unknown>;
    };
  };
}

interface SignInResponse {
  session?: TokenResponse["session"];
  mfa?: { ticket: string };
  error?: { message: string; status: number };
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
}

export interface AuthResult {
  user: AuthUser;
  tokens: AuthTokens;
}

function parseTokenResponse(data: TokenResponse): AuthResult {
  const { session } = data;
  return {
    user: {
      id: session.user.id,
      email: session.user.email || "",
      displayName: session.user.displayName || session.user.email?.split("@")[0] || "",
      avatarUrl: session.user.avatarUrl,
    },
    tokens: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessTokenExpiresAt: Date.now() + session.accessTokenExpiresIn * 1000,
    },
  };
}

/** Exchange a refresh token for a new access token + user info. */
export async function refreshSession(
  refreshToken: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${text}`);
  }
  const data: TokenResponse = await res.json();
  return parseTokenResponse(data);
}

/** Sign in with email + password. */
export async function signInEmailPassword(
  email: string,
  password: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/signin/email-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as { message?: string }).message || "Invalid email or password.";
    throw new Error(msg);
  }
  const data = (await res.json()) as SignInResponse;
  if (!data.session) {
    throw new Error("Unexpected response from auth server.");
  }
  return parseTokenResponse({ session: data.session });
}

/** Register a new account with email + password. */
export async function signUpEmailPassword(
  email: string,
  password: string,
  displayName?: string,
): Promise<AuthResult> {
  const res = await fetch(`${AUTH_URL}/signup/email-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      options: { displayName: displayName || undefined },
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg =
      (body as { message?: string }).message || "Registration failed.";
    throw new Error(msg);
  }
  const data = (await res.json()) as SignInResponse;
  if (!data.session) {
    throw new Error("Unexpected response from auth server.");
  }
  return parseTokenResponse({ session: data.session });
}

/** Request a magic link email. */
export async function requestMagicLink(email: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/signin/passwordless/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || "Failed to send login link.",
    );
  }
}

/** Request a password reset email. */
export async function requestPasswordReset(email: string): Promise<void> {
  const res = await fetch(`${AUTH_URL}/user/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message || "Failed to send reset link.",
    );
  }
}

/** Sign out (invalidate refresh token). */
export async function signOut(refreshToken: string): Promise<void> {
  await fetch(`${AUTH_URL}/signout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken, all: false }),
  }).catch(() => {
    // Best-effort. Session is cleared client-side regardless.
  });
}

/** Build the Google OAuth redirect URL with redirectTo for return. */
export function googleOAuthUrl(): string {
  const redirectTo = typeof window !== "undefined"
    ? `${window.location.origin}/account`
    : "https://praycalc.com/account";
  return `${AUTH_URL}/signin/provider/google?redirectTo=${encodeURIComponent(redirectTo)}`;
}
