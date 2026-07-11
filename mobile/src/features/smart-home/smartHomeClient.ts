/**
 * Purpose: Smart Home account-linking client — list/unlink the signed-in
 *   user's linked providers (Alexa, Google Home, Home Assistant) via a
 *   direct Bearer-token fetch to the praycalc "smart" service. Not a Hasura
 *   table, so this is a plain REST fetch (like useAuthStore's
 *   fetchEntitlement), not a urql GraphQL query like TvManagerScreen's
 *   pc_tv_settings.
 * Inputs: none (reads the JWT from SecureStore via lib/graphql's getToken()).
 * Outputs: listLinks()/unlinkProvider() never throw — resolve to a
 *   discriminated result so SmartHomeScreen can render inline errors.
 * Constraints: no `any`. Linking a NEW provider always starts from the
 *   assistant's own app (Alexa / Google Home) — there is no "link" call
 *   here, only list + unlink, matching web's and desktop's clients.
 * SPORT: praycalc mobile — Smart Home account linking (client).
 */
import { getToken } from '../../lib/graphql';
import { SMART_HOME_URL } from '../../constants';

export type SmartHomeProvider = 'google' | 'alexa' | 'homeassistant';

export interface LinkedProvider {
  provider: SmartHomeProvider;
  linked_at: string;
}

/** Display label + icon per provider — kept in parity with web's and desktop's copies. */
export const PROVIDER_META: Record<SmartHomeProvider, { label: string; icon: string }> = {
  google: { label: 'Google Home', icon: '🏠' },
  alexa: { label: 'Alexa', icon: '🔊' },
  homeassistant: { label: 'Home Assistant', icon: '🧩' },
};

export type ListLinksResult = { ok: true; links: LinkedProvider[] } | { ok: false; error: string };

/** List every smart-home provider linked to the signed-in user. Never throws. */
export async function listLinks(): Promise<ListLinksResult> {
  try {
    const token = await getToken();
    if (!token) return { ok: false, error: 'Not signed in.' };
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { ok: false, error: `Could not load Smart Home links (${res.status}).` };
    const body = (await res.json().catch(() => ({}))) as { links?: LinkedProvider[] };
    return { ok: true, links: body.links ?? [] };
  } catch {
    return { ok: false, error: 'Could not reach the Smart Home service.' };
  }
}

export type UnlinkResult = { ok: true } | { ok: false; error: string };

/** Revoke a linked provider. Never throws. */
export async function unlinkProvider(provider: SmartHomeProvider): Promise<UnlinkResult> {
  try {
    const token = await getToken();
    if (!token) return { ok: false, error: 'Not signed in.' };
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links/${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return { ok: false, error: 'Provider not linked.' };
    if (!res.ok) return { ok: false, error: `Failed to unlink provider (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the Smart Home service.' };
  }
}
