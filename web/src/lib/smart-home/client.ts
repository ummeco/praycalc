/**
 * smart-home/client.ts — Smart Home account-linking client.
 *
 * PURPOSE: List/unlink the signed-in user's linked smart-home providers
 *   (Alexa, Google Home, Home Assistant) via PrayCalc's own same-origin
 *   /api/smart-home/links proxy route (ADR-010 — the access token never
 *   reaches the browser).
 * OUTPUTS: listLinks() never throws (matches billing.ts's getBillingStatus
 *   contract — resolves to [] on any failure so the Dashboard's Smart Home
 *   card can always render). unlinkProvider() surfaces failures as a
 *   result-level error string, matching src/lib/tv/client.ts's discriminated-
 *   result pattern (this is a user-triggered action, unlike the read-only list).
 * CONSTRAINTS: No next/* imports. credentials: 'same-origin' on every call.
 *   Linking a NEW provider always starts from the assistant's own app (Alexa
 *   / Google Home) — there is no "link" call here, only list + unlink.
 * REF: src/pages/api/smart-home/links.ts · src/lib/tv/client.ts · src/lib/billing.ts
 */

export type SmartHomeProvider = 'google' | 'alexa' | 'homeassistant';

export interface LinkedProvider {
  provider: SmartHomeProvider;
  linked_at: string;
}

/** Display label + icon per provider — kept in parity with desktop's and mobile's copies. */
export const PROVIDER_META: Record<SmartHomeProvider, { label: string; icon: string }> = {
  google: { label: 'Google Home', icon: '🏠' },
  alexa: { label: 'Alexa', icon: '🔊' },
  homeassistant: { label: 'Home Assistant', icon: '🧩' },
};

/** List every smart-home provider linked to the signed-in user. Never throws. */
export async function listLinks(): Promise<LinkedProvider[]> {
  try {
    const res = await fetch('/api/smart-home/links', { credentials: 'same-origin' });
    const body = await res.json().catch(() => ({}));
    return (body as { links?: LinkedProvider[] }).links ?? [];
  } catch {
    return [];
  }
}

export type UnlinkResult = { ok: true } | { ok: false; error: string };

/** Revoke a linked provider. Never throws. */
export async function unlinkProvider(provider: SmartHomeProvider): Promise<UnlinkResult> {
  try {
    const res = await fetch(`/api/smart-home/links?provider=${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: (body as { error?: string }).error || 'Failed to unlink provider.' };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not unlink this provider.' };
  }
}
