/**
 * api/tvs/index.ts — TV pairing management proxy (pc_tv_settings).
 *
 * PURPOSE: GET /api/tvs — list the signed-in user's paired TVs.
 *   POST /api/tvs — update or delete one of the signed-in user's TVs
 *   (action-based body, see TvActionBody). Reads the httpOnly access-token
 *   cookie server-side and forwards it as a Bearer header to Hasura GraphQL
 *   (src/lib/tv/hasura.server.ts) — the token never reaches the browser
 *   (ADR-010 fix, same pattern as /api/billing/*).
 * INPUTS: GET — none. POST — JSON body { action: 'update', id, patch } or
 *   { action: 'delete', id }.
 * OUTPUTS: GET — 200 { tvs: TvSetting[] }; 401 { error } without a session.
 *   POST — 200 { ok: true, tv } (update) or { ok: true, id } (delete); 400/401/404
 *   { error } on bad input, missing session, or unknown/foreign TV id.
 * CONSTRAINTS: Never calls Hasura from the browser. All GraphQL happens
 *   server-side with the user's own JWT — Hasura's `user` role permissions on
 *   pc_tv_settings enforce row ownership, so this route does not need its own
 *   authorization check beyond "is there a valid session."
 * REF: src/pages/api/billing/status.ts (proxy-route pattern) · pc_tv_settings
 */

import type { APIRoute } from 'astro';
import { readAccessToken } from '@/lib/auth/cookies.server';
import {
  listTvSettings,
  updateTvSetting,
  deleteTvSetting,
  type TvSettingPatch,
} from '@/lib/tv/hasura.server';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const STREAM_SOURCES = new Set(['makkah-tv', 'saudi-quran', 'medina']);

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json({ error: 'Not authenticated.' }, 401);

  const result = await listTvSettings(accessToken);
  if (!result.ok) return json({ error: result.message }, result.status);
  return json({ tvs: result.data }, 200);
};

interface UpdateActionBody {
  action: 'update';
  id?: string;
  patch?: TvSettingPatch;
}

interface DeleteActionBody {
  action: 'delete';
  id?: string;
}

type TvActionBody = UpdateActionBody | DeleteActionBody;

function validatePatch(patch: TvSettingPatch): string | null {
  if (patch.name !== undefined && !patch.name.trim()) return 'Name cannot be empty.';
  if (patch.stream_source !== undefined && !STREAM_SOURCES.has(patch.stream_source)) {
    return 'Invalid stream source.';
  }
  if (
    patch.rotate_minutes !== undefined &&
    (!Number.isFinite(patch.rotate_minutes) || patch.rotate_minutes < 1 || patch.rotate_minutes > 30)
  ) {
    return 'Rotation minutes must be between 1 and 30.';
  }
  if (patch.accent_color !== undefined && !/^#[0-9a-fA-F]{6}$/.test(patch.accent_color)) {
    return 'Invalid accent color.';
  }
  return null;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const accessToken = readAccessToken(cookies);
  if (!accessToken) return json({ error: 'Not authenticated.' }, 401);

  let body: TvActionBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!body.id) {
    return json({ error: 'A TV id is required.' }, 400);
  }

  if (body.action === 'delete') {
    const result = await deleteTvSetting(accessToken, body.id);
    if (!result.ok) return json({ error: result.message }, result.status);
    return json({ ok: true, id: result.data.id }, 200);
  }

  if (body.action === 'update') {
    const patch = body.patch ?? {};
    const validationError = validatePatch(patch);
    if (validationError) return json({ error: validationError }, 400);

    const result = await updateTvSetting(accessToken, body.id, patch);
    if (!result.ok) return json({ error: result.message }, result.status);
    return json({ ok: true, tv: result.data }, 200);
  }

  return json({ error: 'Unknown action.' }, 400);
};
