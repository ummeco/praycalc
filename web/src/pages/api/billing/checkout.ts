/**
 * api/billing/checkout.ts — Stripe Checkout session proxy.
 *
 * PURPOSE: POST /api/billing/checkout — reads the httpOnly access-token
 *   cookie server-side and forwards it as a Bearer header to the praycalc
 *   "smart" billing service to create a Stripe Checkout session. Keeps the
 *   access token off the client entirely (ADR-010 fix).
 * OUTPUTS: 200 { url } on success; 200 { ok: false } for any failure
 *   (disabled, no session, upstream error) — callers show a graceful
 *   "launching soon" state rather than an error, matching the previous
 *   client-side startCheckout() contract (never throws).
 * REF: src/lib/billing.ts · ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { readAccessToken } from '@/lib/auth/cookies.server';

const BILLING_URL: string =
  (import.meta.env.PUBLIC_BILLING_URL as string | undefined) || 'https://smart.praycalc.com/billing';
const BILLING_MODE: string | undefined = import.meta.env.PUBLIC_BILLING_MODE as string | undefined;

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ cookies }) => {
  if (BILLING_MODE === 'disabled') return json({ ok: false });

  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json({ ok: false });

  try {
    const res = await fetch(`${BILLING_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return json({ ok: false });
    const body = (await res.json()) as { url?: string };
    if (!body.url) return json({ ok: false });
    return json({ ok: true, url: body.url });
  } catch {
    return json({ ok: false });
  }
};
