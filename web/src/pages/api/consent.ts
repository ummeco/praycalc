/**
 * api/consent.ts — GDPR/CCPA cookie-consent decision recorder.
 *
 * PURPOSE: POST /api/consent — records accept/reject/preferences decisions
 *   from the ConsentGate banner into the shared lg_consent_record table
 *   (GDPR Art. 7 audit trail, insert-only). Thin wrapper around the
 *   @ummat/consent server handler shared across every Ummeco web app.
 * INPUTS: POST body — either { consent: base64(ConsentRecord) } (current
 *   client shape, see vendor/consent/src/useConsent.tsx) or the spec shape
 *   { categories, policy_version, locale }.
 * OUTPUTS: { ok: true, recordIds, policy_version } on 200; error body otherwise.
 * CONSTRAINTS: HASURA_ADMIN_URL / HASURA_GRAPHQL_ADMIN_SECRET are server-only
 *   env vars (never PUBLIC_-prefixed) — see web/.env.local.example.
 * REF: ADR-consent-banner-astro-gate.md deferred item (S-C-S05-T05a)
 */

import type { APIRoute } from 'astro';
import { handleConsentRequest } from '@ummat/consent';

const DOMAIN = 'praycalc.com';

export const POST: APIRoute = async ({ request }) => {
  const endpoint = import.meta.env.HASURA_ADMIN_URL as string | undefined;
  const adminSecret = import.meta.env.HASURA_GRAPHQL_ADMIN_SECRET as string | undefined;
  if (!endpoint || !adminSecret) {
    return new Response(JSON.stringify({ error: 'server_misconfigured', code: 'CONFIG' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json', code: 'BAD_REQUEST' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await handleConsentRequest({
    method: 'POST',
    headers: request.headers,
    body,
    countryCode: request.headers.get('x-vercel-ip-country'),
    domain: DOMAIN,
    hasura: { endpoint, adminSecret },
  });

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
