/**
 * tv/client.ts — TV pairing management client (Ummat+ TV app).
 *
 * PURPOSE: List/update/delete the signed-in user's paired TVs via PrayCalc's
 *   own same-origin /api/tvs proxy route, which holds the Hasura Auth access
 *   token in an httpOnly cookie and forwards it server-side (ADR-010 fix —
 *   same pattern as src/lib/billing.ts). The client never sees the token.
 * OUTPUTS: TvSetting[] / a discriminated action result. Network/parse errors
 *   surface as a result-level error string rather than throwing, so the
 *   TvManagerClient island can render inline errors without a try/catch at
 *   every call site.
 * CONSTRAINTS: No next/* imports. credentials: 'same-origin' on every call.
 * REF: src/pages/api/tvs/index.ts · src/lib/billing.ts pattern
 */

export type TvStreamSource = 'makkah-tv' | 'saudi-quran' | 'medina';

export interface TvSetting {
  id: string;
  device_id: string;
  name: string;
  accent_color: string;
  stream_source: TvStreamSource;
  rotate_minutes: number;
  show_weather: boolean;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
}

export interface TvSettingPatch {
  name?: string;
  accent_color?: string;
  stream_source?: TvStreamSource;
  rotate_minutes?: number;
  show_weather?: boolean;
}

export type TvListResult = { ok: true; tvs: TvSetting[] } | { ok: false; error: string };
export type TvActionResult =
  | { ok: true; tv: TvSetting }
  | { ok: true }
  | { ok: false; error: string };

/** List every TV paired to the signed-in user. Never throws. */
export async function listTvs(): Promise<TvListResult> {
  try {
    const res = await fetch('/api/tvs', { credentials: 'same-origin' });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body as { error?: string }).error || 'Failed to load TVs.' };
    return { ok: true, tvs: (body as { tvs: TvSetting[] }).tvs };
  } catch {
    return { ok: false, error: 'Network error — could not load your TVs.' };
  }
}

/** Update a TV's settings (rename, accent color, stream, rotation, weather). Never throws. */
export async function updateTv(id: string, patch: TvSettingPatch): Promise<TvActionResult> {
  try {
    const res = await fetch('/api/tvs', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id, patch }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body as { error?: string }).error || 'Failed to update TV.' };
    return { ok: true, tv: (body as { tv: TvSetting }).tv };
  } catch {
    return { ok: false, error: 'Network error — could not save your changes.' };
  }
}

/** Unpair (delete) a TV. Never throws. */
export async function deleteTv(id: string): Promise<TvActionResult> {
  try {
    const res = await fetch('/api/tvs', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body as { error?: string }).error || 'Failed to remove TV.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not remove this TV.' };
  }
}
