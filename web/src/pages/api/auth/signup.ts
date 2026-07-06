/**
 * api/auth/signup.ts — email+password registration proxy.
 *
 * PURPOSE: POST /api/auth/signup — registers a new account with Hasura Auth
 *   server-side and sets httpOnly access/refresh cookies (ADR-010 fix).
 * INPUTS: JSON body { email, password, displayName? }.
 * OUTPUTS: 200 { user, accessTokenExpiresAt } on success; 400/409/502 { error }.
 * REF: ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { signUpEmailPassword } from '@/lib/auth/hasura.server';
import { setAuthCookies } from '@/lib/auth/cookies.server';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  let body: { email?: string; password?: string; displayName?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }
  if (!body.email || !body.password) {
    return json({ error: 'Email and password are required.' }, 400);
  }

  const result = await signUpEmailPassword(body.email, body.password, body.displayName);
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
        // Leave blank when neither Hasura nor the signup form supplied one —
        // buildSession() client-side derives a nicely-formatted one from the
        // email local-part (dots/underscores -> spaces). Don't duplicate that here.
        displayName: result.session.user.displayName || body.displayName || '',
      },
      accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    },
    200,
  );
};
