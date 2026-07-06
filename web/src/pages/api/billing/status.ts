/**
 * api/billing/status.ts — Ummat+ subscription status proxy.
 *
 * PURPOSE: GET /api/billing/status — reads the httpOnly access-token cookie
 *   server-side and forwards it as a Bearer header to the praycalc "smart"
 *   billing service (server-to-server; no CORS/cookie-domain concerns).
 *   Lets the client check billing status without ever holding the access
 *   token itself (ADR-010 fix).
 * OUTPUTS: 200 BillingStatus JSON. Never a non-2xx — falls back to the free
 *   plan on missing cookie, upstream failure, or network error, matching the
 *   previous client-side getBillingStatus() contract (never throws).
 * REF: src/lib/billing.ts · ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

import type { APIRoute } from 'astro';
import { readAccessToken } from '@/lib/auth/cookies.server';

const BILLING_URL: string =
  (import.meta.env.PUBLIC_BILLING_URL as string | undefined) || 'https://api.praycalc.com/billing';

const FREE_STATUS = {
  plan: 'free',
  status: 'none',
  isActive: false,
  expiresAt: null,
  currentPeriodEnd: null,
};

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json(FREE_STATUS);

  try {
    const res = await fetch(`${BILLING_URL}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return json(FREE_STATUS);
    return json(await res.json());
  } catch {
    return json(FREE_STATUS);
  }
};
