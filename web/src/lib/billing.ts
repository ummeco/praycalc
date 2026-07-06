/**
 * billing.ts — PrayCalc "smart" billing client (Ummat+ entitlement).
 *
 * PURPOSE: Check subscription status and start Stripe Checkout via PrayCalc's
 *   own same-origin /api/billing/* proxy routes, which hold the Hasura Auth
 *   access token in an httpOnly cookie and forward it server-side. The
 *   client never handles the token directly (ADR-010 fix — this used to take
 *   an accessToken argument and send it as a Bearer header from the browser).
 * OUTPUTS: BillingStatus / checkout URL. Both functions never throw — network
 *   or server errors resolve to the free-plan / { ok: false } default so the
 *   dashboard can render without a hard failure.
 * CONSTRAINTS: No next/* imports. Uses import.meta.env.PUBLIC_BILLING_MODE
 *   (Astro client-exposed env convention) only as a UI feature flag; the
 *   authoritative disabled-check also runs server-side in the proxy route.
 * REF: src/pages/api/billing/*.ts · ADR-010 · no-localstorage-token rampart fix (2026-07)
 */

const BILLING_MODE: string | undefined = import.meta.env.PUBLIC_BILLING_MODE as string | undefined;

export interface BillingStatus {
  plan: 'free' | 'plus';
  status: string;
  isActive: boolean;
  expiresAt: string | null;
  currentPeriodEnd: string | null;
}

const FREE_STATUS: BillingStatus = {
  plan: 'free',
  status: 'none',
  isActive: false,
  expiresAt: null,
  currentPeriodEnd: null,
};

/**
 * Fetch subscription status. Never throws — network/server errors resolve to
 * the free-plan default so the dashboard can render without a hard failure.
 */
export async function getBillingStatus(): Promise<BillingStatus> {
  try {
    const res = await fetch('/api/billing/status', { credentials: 'same-origin' });
    if (!res.ok) return FREE_STATUS;
    return (await res.json()) as BillingStatus;
  } catch {
    return FREE_STATUS;
  }
}

export type CheckoutResult = { ok: true; url: string } | { ok: false };

/**
 * Start a Stripe Checkout session. Returns { ok: false } (never throws) when
 * billing is disabled or the checkout call fails for any reason — callers
 * show a graceful "launching soon" state in that case.
 */
export async function startCheckout(): Promise<CheckoutResult> {
  if (BILLING_MODE === 'disabled') return { ok: false };
  try {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (!res.ok) return { ok: false };
    return (await res.json()) as CheckoutResult;
  } catch {
    return { ok: false };
  }
}

/** True when billing is explicitly disabled via env (skip network calls entirely). */
export function isBillingDisabled(): boolean {
  return BILLING_MODE === 'disabled';
}
