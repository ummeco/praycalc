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
 * REF: PR #67 hasura.server.ts pattern · pc_tv_settings (Hasura `user` role)
 */

const HASURA_URL: string =
  (import.meta.env.PUBLIC_HASURA_URL as string | undefined) || 'https://api.praycalc.com/v1/graphql';

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
