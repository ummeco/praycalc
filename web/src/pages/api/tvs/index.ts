/**
 * api/tvs/index.ts — TV pairing management proxy (pc_tv_settings).
 *
 * PURPOSE: GET /api/tvs — list the signed-in user's paired TVs.
 *   POST /api/tvs — update, delete, or pair one of the signed-in user's TVs
 *   (action-based body, see TvActionBody). Reads the httpOnly access-token
 *   cookie server-side and forwards it as a Bearer header to Hasura GraphQL
 *   (src/lib/tv/hasura.server.ts) — the token never reaches the browser
 *   (ADR-010 fix, same pattern as /api/billing/*).
 * INPUTS: GET — none. POST — JSON body { action: 'update', id, patch },
 *   { action: 'delete', id }, or { action: 'pair', code }.
 * OUTPUTS: GET — 200 { tvs: TvSetting[] }; 401 { error } without a session.
 *   POST — 200 { ok: true, tv } (update), { ok: true, id } (delete), or
 *   { ok: true } (pair); 400/401/403/404 { error } on bad input, missing
 *   session, missing Ummat+ entitlement, or an unknown/foreign/invalid id/code.
 * CONSTRAINTS: Never calls Hasura from the browser. All GraphQL happens
 *   server-side with the user's own JWT — Hasura's `user` role permissions on
 *   pc_tv_settings enforce row ownership, so update/delete do not need their
 *   own authorization check beyond "is there a valid session." The `pair`
 *   action DOES need an explicit server-side check: it enforces Ummat+ before
 *   calling Hasura, mirroring /api/billing/status.ts's own status fetch
 *   (Hasura's pc_tv_pairing permission alone isn't a paywall gate).
 * REF: src/pages/api/billing/status.ts (proxy-route + Plus-gate pattern) ·
 *   pc_tv_settings · pc_tv_pairing
 */

import type { APIRoute } from 'astro';
import { readAccessToken } from '@/lib/auth/cookies.server';
import {
  listTvSettings,
  updateTvSetting,
  deleteTvSetting,
  claimTvPairing,
  type TvSettingPatch,
  type IqamaOffsets,
} from '@/lib/tv/hasura.server';

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const STREAM_SOURCES = new Set(['makkah-tv', 'saudi-quran', 'medina']);
const MADHABS = new Set(['shafii', 'hanafi']);
const TIME_FORMATS = new Set(['12h', '24h']);
const LAYOUTS = new Set(['classic', 'flipped', 'stream-full', 'times-only', 'ambient']);
const THEMES = new Set(['ummat-green', 'midnight', 'warm-sand', 'mono']);
const PIN_PATTERN = /^\d{6}$/;
const IQAMA_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

const BILLING_URL: string =
  (import.meta.env.PUBLIC_BILLING_URL as string | undefined) || 'https://smart.praycalc.com/billing';

/** Server-side Ummat+ entitlement check for the pairing action — mirrors /api/billing/status.ts's own fetch. */
async function isUmmatPlusActive(accessToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${BILLING_URL}/status`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return false;
    const body = (await res.json().catch(() => ({}))) as { plan?: string; isActive?: boolean };
    return body.plan === 'plus' && body.isActive === true;
  } catch {
    return false;
  }
}

function isValidIqamaOffsets(value: unknown): value is IqamaOffsets {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    Object.keys(obj).length === IQAMA_KEYS.length &&
    IQAMA_KEYS.every((key) => typeof obj[key] === 'number' && Number.isFinite(obj[key]))
  );
}

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

interface PairActionBody {
  action: 'pair';
  code?: string;
}

type TvActionBody = UpdateActionBody | DeleteActionBody | PairActionBody;

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
  if (
    patch.countdown_minutes !== undefined &&
    (!Number.isFinite(patch.countdown_minutes) || patch.countdown_minutes < 1 || patch.countdown_minutes > 60)
  ) {
    return 'Countdown minutes must be between 1 and 60.';
  }
  if (
    patch.name_only_minutes !== undefined &&
    (!Number.isFinite(patch.name_only_minutes) || patch.name_only_minutes < 1 || patch.name_only_minutes > 60)
  ) {
    return 'Name-only minutes must be between 1 and 60.';
  }
  if (patch.iqama_offsets !== undefined && !isValidIqamaOffsets(patch.iqama_offsets)) {
    return 'Invalid iqama offsets.';
  }
  if (patch.calc_method !== undefined && !patch.calc_method.trim()) {
    return 'Calculation method cannot be empty.';
  }
  if (patch.madhab !== undefined && !MADHABS.has(patch.madhab)) {
    return 'Invalid madhab.';
  }
  if (patch.time_format !== undefined && !TIME_FORMATS.has(patch.time_format)) {
    return 'Invalid time format.';
  }
  if (patch.layout !== undefined && !LAYOUTS.has(patch.layout)) {
    return 'Invalid layout.';
  }
  if (patch.theme !== undefined && !THEMES.has(patch.theme)) {
    return 'Invalid theme.';
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

  if (body.action === 'pair') {
    const code = body.code;
    if (!code || !PIN_PATTERN.test(code)) {
      return json({ error: 'Enter the 6-digit code shown on your TV.' }, 400);
    }
    const isPlus = await isUmmatPlusActive(accessToken);
    if (!isPlus) return json({ error: 'Ummat+ is required to add a TV.' }, 403);

    const result = await claimTvPairing(accessToken, code);
    if (!result.ok) return json({ error: result.message }, result.status);
    return json({ ok: true }, 200);
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
