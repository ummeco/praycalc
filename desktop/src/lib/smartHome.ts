/**
 * Purpose: Smart Home account-linking client — list/unlink the signed-in
 *   user's linked providers (Alexa, Google Home, Home Assistant) via a direct
 *   Bearer-token fetch to the praycalc "smart" service. Not a Hasura table
 *   (unlike pc_tv_settings), so this is a plain REST fetch — same shape as
 *   auth.ts's checkEntitlement(), not tvSettings.ts's requestWithRefresh().
 * Inputs: an AuthSession (from lib/auth-store.ts) for the Bearer token; a
 *   SmartHomeProvider id for unlink.
 * Outputs: listLinks()/unlinkProvider() never throw — resolve to a
 *   discriminated result so SmartHomeManager can render inline errors.
 * Constraints: no `any`. CORS NOTE (read-only finding, not fixed here):
 *   smart/src/index.ts's cors() allowlist is an explicit origin list
 *   (praycalc.com / api.praycalc.com / *.google.com / *.amazon(aws).com +
 *   a few localhost dev ports) with no entry for the Tauri webview's origin
 *   (tauri://localhost on macOS, https://tauri.localhost on Windows). A
 *   cross-origin fetch with an Authorization header is a preflighted
 *   request, so it likely fails CORS in production — the same latent gap
 *   checkEntitlement() in auth.ts already has and already handles by
 *   falling back gracefully. This client follows the identical
 *   graceful-degrade contract: every function never throws and resolves to
 *   an explicit error result instead of a hard failure. tauri.conf.json's
 *   CSP already allow-lists smart.praycalc.com under connect-src, so the
 *   request itself is not blocked client-side — only the server's CORS
 *   response header (if enforced by the webview) would reject it.
 * SPORT: praycalc desktop — Smart Home account linking (client).
 */
import type { AuthSession } from './auth-types';

const SMART_HOME_URL: string =
  (import.meta.env.VITE_SMART_HOME_URL as string | undefined) ?? 'https://smart.praycalc.com';

export type SmartHomeProvider = 'google' | 'alexa' | 'homeassistant';

export interface LinkedProvider {
  provider: SmartHomeProvider;
  linked_at: string;
}

/** Display label + icon per provider — kept in parity with web's and mobile's copies. */
export const PROVIDER_META: Record<SmartHomeProvider, { label: string; icon: string }> = {
  google: { label: 'Google Home', icon: '🏠' },
  alexa: { label: 'Alexa', icon: '🔊' },
  homeassistant: { label: 'Home Assistant', icon: '🧩' },
};

export type ListLinksResult = { ok: true; links: LinkedProvider[] } | { ok: false; error: string };

/** List every smart-home provider linked to the signed-in user. Never throws. */
export async function listLinks(session: AuthSession): Promise<ListLinksResult> {
  try {
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
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
export async function unlinkProvider(session: AuthSession, provider: SmartHomeProvider): Promise<UnlinkResult> {
  try {
    const res = await fetch(`${SMART_HOME_URL}/api/v1/links/${encodeURIComponent(provider)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    if (res.status === 404) return { ok: false, error: 'Provider not linked.' };
    if (!res.ok) return { ok: false, error: `Failed to unlink provider (${res.status}).` };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not reach the Smart Home service.' };
  }
}
