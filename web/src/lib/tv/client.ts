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
 *   pairTv() never sends device_id — the TV owns that id; claiming only
 *   flips `paired` on the pc_tv_pairing row matching the code.
 * REF: src/pages/api/tvs/index.ts · src/lib/billing.ts pattern
 */

export type TvStreamSource = 'makkah-tv' | 'saudi-quran' | 'medina';
export type TvMadhab = 'shafii' | 'hanafi';
export type TvTimeFormat = '12h' | '24h';
export type TvLayout = 'classic' | 'flipped' | 'stream-full' | 'times-only' | 'ambient';
export type TvTheme = 'ummat-green' | 'midnight' | 'warm-sand' | 'mono';

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
  countdown_takeover_enabled: boolean;
  countdown_minutes: number;
  iqama_enabled: boolean;
  iqama_offsets: IqamaOffsets;
  name_only_enabled: boolean;
  name_only_minutes: number;
  calc_method: string;
  madhab: TvMadhab;
  time_format: TvTimeFormat;
  layout: TvLayout;
  theme: TvTheme;
}

export interface TvSettingPatch {
  name?: string;
  accent_color?: string;
  stream_source?: TvStreamSource;
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
  layout?: TvLayout;
  theme?: TvTheme;
}

export type TvListResult = { ok: true; tvs: TvSetting[] } | { ok: false; error: string };
export type TvActionResult =
  | { ok: true; tv: TvSetting }
  | { ok: true }
  | { ok: false; error: string };
export type TvPairResult = { ok: true } | { ok: false; error: string };

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

/** Claim a TV by the 6-digit code shown on its pairing screen. Never throws. */
export async function pairTv(code: string): Promise<TvPairResult> {
  try {
    const res = await fetch('/api/tvs', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pair', code }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: (body as { error?: string }).error || 'Failed to add TV.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error — could not add this TV.' };
  }
}
