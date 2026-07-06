/**
 * api/auth/signout.ts — sign-out proxy.
 *
 * PURPOSE: POST /api/auth/signout — invalidates the refresh token with
 *   Hasura Auth (best-effort) and clears both auth cookies.
 * INPUTS: no body needed in steady state (refresh token comes from the
 *   cookie). Accepts an optional JSON body { refreshToken } so a client
 *   still holding a pre-2026-07 legacy localStorage token can invalidate it
 *   on sign-out even if it was never migrated into a cookie.
 * OUTPUTS: 200 { ok: true } always — sign-out clears local state regardless
 *   of whether the upstream invalidation call succeeds.
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { signOutWithToken } from '@/lib/auth/hasura.server';
import { clearAuthCookies, readRefreshToken } from '@/lib/auth/cookies.server';

export const POST: APIRoute = async ({ request, cookies }) => {
  let refreshToken = readRefreshToken(cookies);
  if (!refreshToken) {
    const body = (await request.json().catch(() => ({}))) as { refreshToken?: string };
    refreshToken = body.refreshToken;
  }

  if (refreshToken) {
    await signOutWithToken(refreshToken);
  }
  clearAuthCookies(cookies);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
