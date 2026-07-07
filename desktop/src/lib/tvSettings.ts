/**
 * Purpose: Typed Hasura GraphQL client for the "My TVs" feature (pc_tv_settings, role
 *   `user`) — list/update/delete the signed-in user's paired TVs from the desktop app.
 * Inputs: an AuthSession (from lib/auth-store.ts) for the Bearer token; TvSettingsPatch
 *   objects for updates.
 * Outputs: TvSettings[] / TvSettings on success; throws a short Error message on failure
 *   (mirrors auth.ts's signIn/signUp contract) so callers can show it in the UI.
 * Constraints: no `any`; per-app CORS endpoint (api.praycalc.com, NOT admin api.ummat.dev)
 *   per PRI; on a 401 response, attempts exactly one token refresh via auth.ts's
 *   refreshToken() and retries the request once before giving up — mirrors the
 *   scheduleRefresh pattern already used for the proactive 60s-before-expiry refresh.
 *   Rows are scoped to the signed-in user by Hasura's `user` role permissions
 *   (session variable), not by a client-supplied where-clause, so no user_id filter is
 *   sent from here.
 * SPORT: praycalc desktop — TV management (GraphQL client).
 */
import type { AuthSession } from './auth-types';
import type { TvSettings, TvSettingsPatch } from './tv-types';
import { refreshToken } from './auth';
import { loadPersistedSession } from './auth-store';

const GRAPHQL_URL: string =
  (import.meta.env.VITE_GRAPHQL_URL as string | undefined) ?? 'https://api.praycalc.com/v1/graphql';

interface GraphQlError {
  message: string;
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

async function postGraphQl<T>(
  query: string,
  variables: Record<string, unknown>,
  accessToken: string,
): Promise<{ status: number; body: GraphQlResponse<T> | null }> {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await res.json().catch(() => null)) as GraphQlResponse<T> | null;
  return { status: res.status, body };
}

/**
 * Runs a GraphQL request with the given session's access token. On a 401 (expired/
 * invalid token), refreshes once via auth.ts's refreshToken() and retries once with
 * the new token. Returns the fresh session alongside the result so callers can persist
 * it into their own state (mirrors AccountTab's scheduleRefresh callback pattern).
 */
async function requestWithRefresh<T>(
  session: AuthSession,
  query: string,
  variables: Record<string, unknown>,
): Promise<{ data: T; session: AuthSession }> {
  let current = session;
  let { status, body } = await postGraphQl<T>(query, variables, current.accessToken);

  if (status === 401) {
    current = await refreshToken(current.refreshToken, current.email, current.displayName);
    ({ status, body } = await postGraphQl<T>(query, variables, current.accessToken));
  }

  if (!body) throw new Error(`Request failed (${status})`);
  if (body.errors?.length) throw new Error(body.errors[0]?.message ?? 'GraphQL error');
  if (status < 200 || status >= 300) throw new Error(`Request failed (${status})`);
  if (body.data === undefined) throw new Error('No data returned');
  return { data: body.data, session: current };
}

const TV_FIELDS = `
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
`;

const LIST_TVS_QUERY = `
  query ListMyTvs {
    pc_tv_settings(order_by: { name: asc }) {
      ${TV_FIELDS}
    }
  }
`;

const UPDATE_TV_MUTATION = `
  mutation UpdateMyTv($id: uuid!, $patch: pc_tv_settings_set_input!) {
    update_pc_tv_settings_by_pk(pk_columns: { id: $id }, _set: $patch) {
      ${TV_FIELDS}
    }
  }
`;

const DELETE_TV_MUTATION = `
  mutation DeleteMyTv($id: uuid!) {
    delete_pc_tv_settings_by_pk(id: $id) {
      id
    }
  }
`;

/** List all TVs owned by the signed-in user (Hasura `user` role scopes rows server-side). */
export async function listTvSettings(
  session: AuthSession,
): Promise<{ tvs: TvSettings[]; session: AuthSession }> {
  const { data, session: next } = await requestWithRefresh<{ pc_tv_settings: TvSettings[] }>(
    session,
    LIST_TVS_QUERY,
    {},
  );
  return { tvs: data.pc_tv_settings, session: next };
}

/** Update one of the signed-in user's TVs. Throws if the row does not belong to the user. */
export async function updateTvSettings(
  session: AuthSession,
  id: string,
  patch: TvSettingsPatch,
): Promise<{ tv: TvSettings; session: AuthSession }> {
  const { data, session: next } = await requestWithRefresh<{
    update_pc_tv_settings_by_pk: TvSettings | null;
  }>(session, UPDATE_TV_MUTATION, { id, patch });
  if (!data.update_pc_tv_settings_by_pk) throw new Error('TV not found');
  return { tv: data.update_pc_tv_settings_by_pk, session: next };
}

/** Delete (unpair) one of the signed-in user's TVs. */
export async function deleteTvSettings(
  session: AuthSession,
  id: string,
): Promise<{ session: AuthSession }> {
  const { data, session: next } = await requestWithRefresh<{
    delete_pc_tv_settings_by_pk: { id: string } | null;
  }>(session, DELETE_TV_MUTATION, { id });
  if (!data.delete_pc_tv_settings_by_pk) throw new Error('TV not found');
  return { session: next };
}

/** Convenience: load the persisted session (used by TvManager to avoid re-reading auth-store). */
export async function loadSessionForTvs(): Promise<AuthSession | null> {
  return loadPersistedSession();
}
