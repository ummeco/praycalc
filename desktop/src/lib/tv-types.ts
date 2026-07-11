/**
 * Purpose: Shared types for the "My TVs" management feature (pc_tv_settings table).
 * Inputs: n/a (type-only module).
 * Outputs: TvSettings row shape + the stream-source union + accent-color presets + the
 *   deep-settings enums (calc method / madhab / time format) + iqama offsets shape.
 * Constraints: no `any`; mirrors pc_tv_settings columns exactly per the live prod column
 *   contract (base 14 + 9 deep-settings columns added by T1: countdown_takeover_enabled,
 *   countdown_minutes, iqama_enabled, iqama_offsets, name_only_enabled, name_only_minutes,
 *   calc_method, madhab, time_format). user_id/device_id are server-owned (device_id set
 *   at pairing time, user_id via Hasura session variable) and never sent on update.
 *   iqama_offsets is a jsonb object with exactly 5 keys (fajr/dhuhr/asr/maghrib/isha, no
 *   sunrise) — minutes AFTER adhan; always send the full object on write (per T1 notes).
 * SPORT: praycalc desktop — TV management (types).
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

/** Fields the desktop app is allowed to edit. id/user_id/device_id are immutable here. */
export type TvSettingsPatch = Partial<
  Pick<
    TvSettings,
    | 'name'
    | 'accent_color'
    | 'stream_source'
    | 'rotate_minutes'
    | 'show_weather'
    | 'latitude'
    | 'longitude'
    | 'city'
    | 'timezone'
    | 'countdown_takeover_enabled'
    | 'countdown_minutes'
    | 'iqama_enabled'
    | 'iqama_offsets'
    | 'name_only_enabled'
    | 'name_only_minutes'
    | 'calc_method'
    | 'madhab'
    | 'time_format'
    | 'layout'
    | 'theme'
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

/** Screen-reader-friendly names for ACCENT_COLOR_PRESETS, keyed by hex value. */
export const ACCENT_COLOR_NAMES: Record<string, string> = {
  '#79C24C': 'Brand green',
  '#1E5E2F': 'Forest green',
  '#C9F27A': 'Light green',
  '#4C9BC2': 'Blue',
  '#C24C79': 'Rose',
  '#C2A34C': 'Gold',
};

export const STREAM_SOURCE_OPTIONS: { value: TvStreamSource; label: string }[] = [
  { value: 'makkah-tv', label: 'Makkah Live (Haramain)' },
  { value: 'saudi-quran', label: 'Saudi Quran Channel' },
  { value: 'medina', label: 'Medina Live (Haramain)' },
];

export const DEFAULT_ROTATE_MINUTES = 5;
export const MIN_ROTATE_MINUTES = 1;
export const MAX_ROTATE_MINUTES = 30;

export const MIN_COUNTDOWN_MINUTES = 1;
export const MAX_COUNTDOWN_MINUTES = 60;
export const MIN_NAME_ONLY_MINUTES = 1;
export const MAX_NAME_ONLY_MINUTES = 60;

export const DEFAULT_IQAMA_OFFSETS: IqamaOffsets = {
  fajr: 20,
  dhuhr: 10,
  asr: 10,
  maghrib: 5,
  isha: 10,
};

/** Ordered so the editor renders prayers in daily sequence (no sunrise — no iqama). */
export const IQAMA_PRAYER_ORDER: (keyof IqamaOffsets)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const IQAMA_PRAYER_LABELS: Record<keyof IqamaOffsets, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Mirrors ipc-types.ts METHODS values so the TV computes with the same method ids. */
export const CALC_METHOD_OPTIONS: { value: string; label: string }[] = [
  { value: 'dpc', label: 'Dynamic (PrayCalc DPC) — Recommended' },
  { value: 'ISNA', label: 'ISNA — Islamic Society of North America' },
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'Egypt', label: 'Egyptian General Authority of Survey' },
  { value: 'UAQ', label: 'Umm al-Qura University, Makkah' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi' },
  { value: 'IGUT', label: 'Institute of Geophysics, University of Tehran' },
  { value: 'Kuwait', label: 'Kuwait Ministry of Islamic Affairs' },
  { value: 'Qatar', label: 'Qatar / Gulf Standard' },
  { value: 'MUIS', label: 'Majlis Ugama Islam Singapura' },
  { value: 'UOIF', label: 'Union des Organisations Islamiques de France' },
  { value: 'DIBT', label: 'Diyanet İşleri Başkanlığı, Turkey' },
  { value: 'SAMR', label: 'Spiritual Administration of Muslims of Russia' },
  { value: 'ISNACA', label: 'IQNA / Islamic Council of North America' },
  { value: 'MSC', label: 'Moonsighting Committee Worldwide' },
];

export const MADHAB_OPTIONS: { value: TvMadhab; label: string }[] = [
  { value: 'shafii', label: "Shafi'i / Maliki / Hanbali (standard)" },
  { value: 'hanafi', label: 'Hanafi' },
];

export const TIME_FORMAT_OPTIONS: { value: TvTimeFormat; label: string }[] = [
  { value: '24h', label: '24-hour' },
  { value: '12h', label: '12-hour (AM/PM)' },
];

/** Mirrors web's TvLayoutThemePicker.tsx + mobile's tvManagerConstants.ts — same 5
 *  layouts, same labels/descriptions, across all three "My TVs" surfaces. */
export const LAYOUT_OPTIONS: { value: TvLayout; label: string; description: string }[] = [
  { value: 'classic', label: 'Classic', description: 'Times + live stream side-by-side' },
  { value: 'flipped', label: 'Flipped', description: 'Same split, mirrored' },
  { value: 'stream-full', label: 'Stream Full', description: 'Full-screen stream with a times strip' },
  { value: 'times-only', label: 'Times Only', description: 'Prayer times only, no live stream' },
  { value: 'ambient', label: 'Ambient', description: 'Minimal ambient clock display' },
];

/** Same 4 themes + swatch hexes as web's TvLayoutThemePicker.tsx + mobile's
 *  tvManagerConstants.ts THEME_SWATCHES. */
export const THEME_OPTIONS: { value: TvTheme; label: string; swatches: string[] }[] = [
  { value: 'ummat-green', label: 'Ummat Green', swatches: ['#0D2F17', '#1E5E2F', '#79C24C', '#C9F27A'] },
  { value: 'midnight', label: 'Midnight', swatches: ['#05070a', '#0d1117', '#3fb950', '#aff5b4'] },
  { value: 'warm-sand', label: 'Warm Sand', swatches: ['#14100b', '#241c12', '#d4a24c', '#f2dcb3'] },
  { value: 'mono', label: 'Mono', swatches: ['#0a0a0a', '#181818', '#bdbdbd', '#f5f5f5'] },
];
