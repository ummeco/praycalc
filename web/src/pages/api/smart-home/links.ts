/**
 * api/smart-home/links.ts — Smart Home account-linking status proxy.
 *
 * PURPOSE: GET /api/smart-home/links — list which smart-home/voice providers
 *   (Google Home, Alexa, Home Assistant) are linked to the signed-in user's
 *   account. DELETE /api/smart-home/links?provider=<id> — revoke a linked
 *   provider. Reads the httpOnly access-token cookie server-side and forwards
 *   it as a Bearer header to the praycalc "smart" service (server-to-server;
 *   no CORS/cookie-domain concerns from the browser's perspective) — same
 *   ADR-010 pattern as /api/billing/* and /api/tvs.
 * INPUTS: GET — none. DELETE — `provider` query param (google | alexa |
 *   homeassistant, matching smart/src/routes/links.ts's oauth client_id-
 *   derived provider column).
 * OUTPUTS: GET — always 200 { links: LinkedProvider[] }, mirroring
 *   /api/billing/status's never-a-non-2xx contract (falls back to an empty
 *   list on missing cookie, upstream failure, or network error) so the
 *   Dashboard's Smart Home card can always render without a hard failure.
 *   DELETE — 200 { ok: true } on success; 400/401/404/5xx { error } on bad
 *   input, missing session, unknown provider, or upstream failure — this is
 *   a user-triggered action, so (unlike GET) failures are surfaced, matching
 *   /api/tvs's POST-action contract.
 * CONSTRAINTS: OAuth linking itself always starts from the assistant side
 *   (the Alexa app or Google Home app initiates account-linking) — this
 *   route only ever reads status or revokes, it never initiates OAuth.
 * REF: src/pages/api/billing/status.ts (proxy + never-throws GET pattern) ·
 *   src/pages/api/tvs/index.ts (action-result pattern) · smart/src/routes/links.ts
 */

import type { APIRoute } from 'astro';
import { readAccessToken } from '@/lib/auth/cookies.server';

const SMART_HOME_URL: string =
  (import.meta.env.PUBLIC_SMART_HOME_URL as string | undefined) || 'https://smart.praycalc.com';

export interface LinkedProvider {
  provider: string;
  linked_at: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json({ links: [] });

  try {
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return json({ links: [] });
    const body = (await res.json().catch(() => ({}))) as { links?: LinkedProvider[] };
    return json({ links: body.links ?? [] });
  } catch {
    return json({ links: [] });
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json({ error: 'Not authenticated.' }, 401);

  const provider = new URL(request.url).searchParams.get('provider');
  if (!provider) return json({ error: 'A provider is required.' }, 400);

  try {
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links/${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.status === 404) return json({ error: 'Provider not linked.' }, 404);
    if (!res.ok) return json({ error: 'Failed to unlink provider.' }, res.status);
    return json({ ok: true });
  } catch {
    return json({ error: 'Network error — could not unlink provider.' }, 500);
  }
};
