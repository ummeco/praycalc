/**
 * api/auth/signin.ts — email+password sign-in proxy.
 *
 * PURPOSE: POST /api/auth/signin — exchanges credentials with Hasura Auth
 *   server-side and sets httpOnly access/refresh cookies. The client never
 *   sees the raw tokens (ADR-010 fix).
 * INPUTS: JSON body { email, password }.
 * OUTPUTS: 200 { user, accessTokenExpiresAt } on success; 400/401/502 { error }.
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { signInEmailPassword } from '@/lib/auth/hasura.server';
import { setAuthCookies } from '@/lib/auth/cookies.server';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!body.email || !body.password) {
    return json({ error: 'Email and password are required.' }, 400);
  }

  const result = await signInEmailPassword(body.email, body.password);
  if (!result.ok) {
    return json({ error: result.message }, result.status);
  }

  setAuthCookies(cookies, result.session);
  const expiresIn = result.session.accessTokenExpiresIn ?? 900;
  return json(
    {
      user: {
        id: result.session.user.id ?? '',
        email: result.session.user.email || body.email,
        // Leave blank when Hasura has no displayName on file — buildSession()
        // client-side derives a nicely-formatted one from the email local-part
        // (dots/underscores -> spaces). Don't duplicate that logic here.
        displayName: result.session.user.displayName ?? '',
      },
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    },
    200,
  );
};
