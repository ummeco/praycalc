/**
 * api/auth/refresh.ts — access-token refresh proxy.
 *
 * PURPOSE: POST /api/auth/refresh — reads the refresh token from the httpOnly
 *   cookie, exchanges it with Hasura Auth, and re-sets both cookies with the
 *   new tokens. AccountClient calls this on a timer before the access token
 *   expires (ADR-010 fix — no tokens ever touch client JS).
 * INPUTS: no body needed in steady state (refresh token comes from the
 *   cookie). Accepts an optional JSON body { refreshToken } as a one-time
 *   migration path: pre-2026-07 builds stored the refresh token in
 *   localStorage, so AccountClient hands it here once to exchange it for a
 *   cookie-backed session, then deletes the legacy localStorage record.
 * OUTPUTS: 200 { user, accessTokenExpiresAt } on success; 401/502 { error }
 *   (cookies cleared on failure so the client falls back to signed-out UI).
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { refreshWithToken } from '@/lib/auth/hasura.server';
import { setAuthCookies, clearAuthCookies, readRefreshToken } from '@/lib/auth/cookies.server';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let refreshToken = readRefreshToken(cookies);
  if (!refreshToken) {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    refreshToken = body.refreshToken;
  }
  if (!refreshToken) {
    return json({ error: 'Not authenticated.' }, 401);
  }

  const result = await refreshWithToken(refreshToken);
  if (!result.ok) {
    clearAuthCookies(cookies);
    return json({ error: result.message }, result.status);
  }

  setAuthCookies(cookies, result.session);
  const expiresIn = result.session.accessTokenExpiresIn ?? 900;
  return json(
    {
      user: {
        id: result.session.user.id ?? '',
        email: result.session.user.email ?? '',
        displayName:
          result.session.user.displayName ||
          result.session.user.email?.split('@')[0] ||
          '',
      },
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    },
    200,
  );
};
