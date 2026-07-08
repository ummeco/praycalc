/**
 * tv/hasura.server.ts — server-side Hasura GraphQL calls for pc_tv_settings.
 *
 * PURPOSE: Thin fetch wrapper to the shared Ummat Hasura GraphQL endpoint for
 *   the signed-in user's TV pairings (pc_tv_settings). Mirrors the
 *   src/lib/auth/hasura.server.ts pattern (server-only, Bearer forward) so the
 *   /api/tvs/* routes never talk to Hasura directly and the user's access
 *   token never reaches Hasura from anywhere but here.
 * INPUTS: the caller's Hasura access token (from the httpOnly cookie) plus
 *   query variables. Row scoping to the signed-in user is enforced by Hasura's
 *   `user` role permissions on pc_tv_settings (select/insert/update/delete own
 *   rows only) — this module does not add its own user_id filter beyond what
 *   the mutations/queries pass, since the role already guarantees isolation.
 * OUTPUTS: a discriminated result — { ok: true, data } on success or
 *   { ok: false, status, message } on failure (GraphQL errors or transport
 *   errors). Never throws.
 * CONSTRAINTS: Server-only — never imported by client-bundled code.
 *   claimTvPairing() NEVER sends/overwrites pc_tv_pairing.device_id — the TV
 *   owns that id; the claim mutation only flips `paired` on the row matching
 *   the pin (verified live against prod under the Hasura `user` role).
 * REF: PR #67 hasura.server.ts pattern · pc_tv_settings (Hasura `user` role) ·
 *   mobile/src/lib/pairing/pairingMutation.ts (pc_tv_pairing column contract)
 */

const HASURA_URL: string =
  (import.meta.env.PUBLIC_HASURA_URL as string | undefined) || 'https://api.praycalc.com/v1/graphql';

export type TvMadhab = 'shafii' | 'hanafi';
export type TvTimeFormat = '12h' | '24h';

/** Minutes-after-adhan iqama offsets. No sunrise key — sunrise has no iqama. */
export interface IqamaOffsets {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export interface TvSetting {
  id: string;
  user_id: string;
  device_id: string;
  name: string;
  accent_color: string;
  stream_source: 'makkah-tv' | 'saudi-quran' | 'medina';
  rotate_minutes: number;
  show_weather: boolean;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
  countdown_takeover_enabled: boolean;
  countdown_minutes: number;
  iqama_enabled: boolean;
  iqama_offsets: IqamaOffsets;
  name_only_enabled: boolean;
  name_only_minutes: number;
  calc_method: string;
  madhab: TvMadhab;
  time_format: TvTimeFormat;
}

export type HasuraGraphqlResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

interface GraphqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function callHasura<T>(
  accessToken: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<HasuraGraphqlResult<T>> {
  let res: Response;
  try {
    res = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    return { ok: false, status: 502, message: 'Unable to reach the backend.' };
  }

  const body = (await res.json().catch(() => ({}))) as GraphqlResponse<T>;

  if (!res.ok) {
    return { ok: false, status: res.status, message: body.errors?.[0]?.message || 'Request failed.' };
  }
  if (body.errors?.length) {
    return { ok: false, status: 400, message: body.errors[0]!.message };
  }
  if (!body.data) {
    return { ok: false, status: 502, message: 'Unexpected response from backend.' };
  }
  return { ok: true, data: body.data };
}

const LIST_QUERY = /* GraphQL */ `
  query ListTvSettings {
    pc_tv_settings(order_by: { name: asc }) {
      id
      user_id
      device_id
      name
      accent_color
      stream_source
      rotate_minutes
      show_weather
      latitude
      longitude
      city
      timezone
      countdown_takeover_enabled
      countdown_minutes
      iqama_enabled
      iqama_offsets
      name_only_enabled
      name_only_minutes
      calc_method
      madhab
      time_format
    }
  }
`;

/** List every TV paired to the signed-in user (scoped by Hasura `user` role). */
export async function listTvSettings(
  accessToken: string,
): Promise<HasuraGraphqlResult<TvSetting[]>> {
  const result = await callHasura<{ pc_tv_settings: TvSetting[] }>(accessToken, LIST_QUERY);
  if (!result.ok) return result;
  return { ok: true, data: result.data.pc_tv_settings };
}

const UPDATE_MUTATION = /* GraphQL */ `
  mutation UpdateTvSetting($id: uuid!, $set: pc_tv_settings_set_input!) {
    update_pc_tv_settings_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      user_id
      device_id
      name
      accent_color
      stream_source
      rotate_minutes
      show_weather
      latitude
      longitude
      city
      timezone
      countdown_takeover_enabled
      countdown_minutes
      iqama_enabled
      iqama_offsets
      name_only_enabled
      name_only_minutes
      calc_method
      madhab
      time_format
    }
  }
`;

export interface TvSettingPatch {
  name?: string;
  accent_color?: string;
  stream_source?: 'makkah-tv' | 'saudi-quran' | 'medina';
  rotate_minutes?: number;
  show_weather?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  timezone?: string | null;
  countdown_takeover_enabled?: boolean;
  countdown_minutes?: number;
  iqama_enabled?: boolean;
  iqama_offsets?: IqamaOffsets;
  name_only_enabled?: boolean;
  name_only_minutes?: number;
  calc_method?: string;
  madhab?: TvMadhab;
  time_format?: TvTimeFormat;
}

/** Update one of the signed-in user's TVs. Hasura's `user` role restricts this to rows the caller owns. */
export async function updateTvSetting(
  accessToken: string,
  id: string,
  patch: TvSettingPatch,
): Promise<HasuraGraphqlResult<TvSetting>> {
  const result = await callHasura<{ update_pc_tv_settings_by_pk: TvSetting | null }>(
    accessToken,
    UPDATE_MUTATION,
    { id, set: patch },
  );
  if (!result.ok) return result;
  if (!result.data.update_pc_tv_settings_by_pk) {
    return { ok: false, status: 404, message: 'TV not found.' };
  }
  return { ok: true, data: result.data.update_pc_tv_settings_by_pk };
}

const DELETE_MUTATION = /* GraphQL */ `
  mutation DeleteTvSetting($id: uuid!) {
    delete_pc_tv_settings_by_pk(id: $id) {
      id
    }
  }
`;

/** Delete (unpair) one of the signed-in user's TVs. Hasura's `user` role restricts this to rows the caller owns. */
export async function deleteTvSetting(
  accessToken: string,
  id: string,
): Promise<HasuraGraphqlResult<{ id: string }>> {
  const result = await callHasura<{ delete_pc_tv_settings_by_pk: { id: string } | null }>(
    accessToken,
    DELETE_MUTATION,
    { id },
  );
  if (!result.ok) return result;
  if (!result.data.delete_pc_tv_settings_by_pk) {
    return { ok: false, status: 404, message: 'TV not found.' };
  }
  return { ok: true, data: result.data.delete_pc_tv_settings_by_pk };
}

const CLAIM_PAIRING_MUTATION = /* GraphQL */ `
  mutation ClaimTvPairing($pin: String!) {
    update_pc_tv_pairing(
      where: { pin: { _eq: $pin }, is_active: { _eq: true }, paired: { _eq: false } }
      _set: { paired: true }
    ) {
      affected_rows
      returning {
        device_id
      }
    }
  }
`;

const SEED_TV_SETTINGS_MUTATION = /* GraphQL */ `
  mutation SeedTvSettings($deviceId: String!, $name: String!) {
    insert_pc_tv_settings_one(
      object: { device_id: $deviceId, name: $name }
      on_conflict: { constraint: pc_tv_settings_device_key, update_columns: [] }
    ) {
      id
      device_id
      name
    }
  }
`;

/**
 * Claim a TV by its 6-digit pairing code. Flips `paired` on the matching,
 * still-unpaired pc_tv_pairing row — never writes device_id (server-owned,
 * set by the TV itself at boot). Then best-effort seeds a pc_tv_settings row
 * for the claimed device_id so "My TVs" has data immediately; a seed failure
 * does not undo an already-successful claim.
 */
export async function claimTvPairing(
  accessToken: string,
  pin: string,
): Promise<HasuraGraphqlResult<{ device_id: string }>> {
  const claimResult = await callHasura<{
    update_pc_tv_pairing: { affected_rows: number; returning: { device_id: string }[] };
  }>(accessToken, CLAIM_PAIRING_MUTATION, { pin });
  if (!claimResult.ok) return claimResult;

  const { affected_rows, returning } = claimResult.data.update_pc_tv_pairing;
  if (affected_rows === 0 || !returning[0]) {
    return { ok: false, status: 404, message: 'Invalid or expired code.' };
  }
  const deviceId = returning[0].device_id;

  // Best-effort seed — the claim already succeeded even if this fails.
  await callHasura(accessToken, SEED_TV_SETTINGS_MUTATION, { deviceId, name: 'My TV' });

  return { ok: true, data: { device_id: deviceId } };
}
