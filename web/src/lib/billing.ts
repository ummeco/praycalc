/**
 * billing.ts — PrayCalc "smart" billing service client (Ummat+ entitlement).
 *
 * PURPOSE: Check subscription status and create Stripe Checkout sessions
 *   against the praycalc smart service (see praycalc/smart/src/routes/billing.ts).
 * INPUTS: A Hasura Auth access token (Bearer auth for both endpoints).
 * OUTPUTS: BillingStatus / checkout URL, or throws on hard failure.
 * CONSTRAINTS: No next/* imports. Uses import.meta.env.PUBLIC_BILLING_URL and
 *   PUBLIC_BILLING_MODE (Astro client-exposed env convention). When
 *   PUBLIC_BILLING_MODE === 'disabled' or checkout otherwise fails (Stripe
 *   not yet provisioned in prod), callers must show a graceful "launching
 *   soon" state rather than surfacing an error — see startCheckout().
 * REF: praycalc/smart/src/routes/billing.ts · real-auth task (2026-07)
 */

const BILLING_URL: string =
  (import.meta.env.PUBLIC_BILLING_URL as string | undefined) || 'https://api.praycalc.com/billing';

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
export async function getBillingStatus(accessToken: string): Promise<BillingStatus> {
  try {
    const res = await fetch(`${BILLING_URL}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
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
export async function startCheckout(accessToken: string): Promise<CheckoutResult> {
  if (BILLING_MODE === 'disabled') return { ok: false };
  try {
    const res = await fetch(`${BILLING_URL}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { ok: false };
    const body = (await res.json()) as { url?: string };
    if (!body.url) return { ok: false };
    return { ok: true, url: body.url };
  } catch {
    return { ok: false };
  }
}

/** True when billing is explicitly disabled via env (skip network calls entirely). */
export function isBillingDisabled(): boolean {
  return BILLING_MODE === 'disabled';
}
