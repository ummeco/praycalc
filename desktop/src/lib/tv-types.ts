/**
 * Purpose: Shared types for the "My TVs" management feature (pc_tv_settings table).
 * Inputs: n/a (type-only module).
 * Outputs: TvSettings row shape + the stream-source union + accent-color presets.
 * Constraints: no `any`; mirrors pc_tv_settings columns exactly (id, user_id, device_id,
 *   name, accent_color, stream_source, rotate_minutes, show_weather, latitude, longitude,
 *   city, timezone). user_id/device_id are server-owned (device_id set at pairing time,
 *   user_id via Hasura session variable) and never sent on update.
 * SPORT: praycalc desktop — TV management (types).
 */

export type TvStreamSource = 'makkah-tv' | 'saudi-quran' | 'medina';

export interface TvSettings {
  id: string;
  user_id: string;
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

/** Fields the desktop app is allowed to edit. id/user_id/device_id are immutable here. */
export type TvSettingsPatch = Partial<
  Pick<
    TvSettings,
    'name' | 'accent_color' | 'stream_source' | 'rotate_minutes' | 'show_weather' | 'latitude' | 'longitude' | 'city' | 'timezone'
  >
>;

/** 6 preset accent-color swatches offered in the TV editor; #79C24C (brand mid) is default. */
export const ACCENT_COLOR_PRESETS: string[] = [
  '#79C24C', // brand mid (default)
  '#1E5E2F', // brand dark
  '#C9F27A', // brand light
  '#4C9BC2', // blue
  '#C24C79', // rose
  '#C2A34C', // gold
];

export const STREAM_SOURCE_OPTIONS: { value: TvStreamSource; label: string }[] = [
  { value: 'makkah-tv', label: 'Makkah Live (Haramain)' },
  { value: 'saudi-quran', label: 'Saudi Quran Channel' },
  { value: 'medina', label: 'Medina Live (Haramain)' },
];

export const DEFAULT_ROTATE_MINUTES = 5;
export const MIN_ROTATE_MINUTES = 1;
export const MAX_ROTATE_MINUTES = 30;
