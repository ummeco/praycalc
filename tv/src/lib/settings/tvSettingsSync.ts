/**
 * Purpose: Poll pc_tv_settings (public role) for this TV's full settings (cosmetic,
 *   deep-settings, and location) and merge them into the local settings store. Runs on
 *   boot and every ~5 seconds so account-side changes reflect near-instantly.
 * Inputs: urql client, device id, a store-updater callback.
 * Outputs: side-effect — applies the mapped TvSettings patch to the store when a row
 *   exists. No row → leaves current (default) values untouched.
 * Constraints: read-only, public role, api.praycalc.com. Never throws — network errors
 *   are swallowed so the dashboard keeps running on the last-known settings.
 * SPORT: praycalc/tv lib/settings
 */

import { Client } from 'urql';
import { clampRotateMinutes, clampMinutes1to60 } from '@praycalc/ui-utils';
import { GET_TV_SETTINGS } from '../graphql/queries';
import {
  IqamaOffsets,
  Madhab,
  TimeFormat,
  TvLayoutId,
  TvRemoteSettings,
  TvSettings,
  TvThemeId,
} from '../../types';

/** ~5s so account-side edits (web/mobile/desktop) reach the TV near-instantly. */
const POLL_INTERVAL_MS = 5 * 1000;

/** Default iqama offsets matching the pc_tv_settings column default. No sunrise key. */
export const DEFAULT_IQAMA_OFFSETS: IqamaOffsets = {
  fajr: 20,
  dhuhr: 10,
  asr: 10,
  maghrib: 5,
  isha: 10,
};

/**
 * Maps a remote iqama_offsets jsonb value to the typed IqamaOffsets shape, filling any
 * missing/non-numeric key from the default. Postgres does not preserve key order, so
 * every key is read by name, never positionally.
 */
export function mapIqamaOffsets(value: unknown): IqamaOffsets {
  const raw = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  const pick = (key: keyof IqamaOffsets): number =>
    typeof raw[key] === 'number' && Number.isFinite(raw[key] as number)
      ? (raw[key] as number)
      : DEFAULT_IQAMA_OFFSETS[key];
  return {
    fajr: pick('fajr'),
    dhuhr: pick('dhuhr'),
    asr: pick('asr'),
    maghrib: pick('maghrib'),
    isha: pick('isha'),
  };
}

/** DB stores 'shafii'|'hanafi'; local Madhab type is 'shafi'|'hanafi'. */
function mapMadhab(value: string): Madhab | undefined {
  if (value === 'shafii') return 'shafi';
  if (value === 'hanafi') return 'hanafi';
  return undefined;
}

function mapTimeFormat(value: string): TimeFormat | undefined {
  return value === '12h' || value === '24h' ? value : undefined;
}

/** Valid dashboard layout ids — kept in sync with TvLayoutId in types/index.ts. */
const VALID_LAYOUTS: readonly TvLayoutId[] = [
  'classic',
  'flipped',
  'stream-full',
  'times-only',
  'ambient',
];

/** Unknown/legacy layout ids fall back to undefined (caller keeps the current/default value). */
function mapLayout(value: string): TvLayoutId | undefined {
  return (VALID_LAYOUTS as readonly string[]).includes(value) ? (value as TvLayoutId) : undefined;
}

/** Valid dashboard theme ids — kept in sync with TvThemeId in types/index.ts. */
const VALID_THEMES: readonly TvThemeId[] = ['ummat-green', 'midnight', 'warm-sand', 'mono'];

/** Unknown/legacy theme ids fall back to undefined (caller keeps the current/default value). */
function mapTheme(value: string): TvThemeId | undefined {
  return (VALID_THEMES as readonly string[]).includes(value) ? (value as TvThemeId) : undefined;
}

/**
 * Maps a remote pc_tv_settings row to the subset of TvSettings the dashboard reads.
 * Only fields present (non-null) on the row are included, so partial rows apply cleanly
 * over existing defaults. Pure — unit-testable without a store.
 */
export function mapRemoteSettings(row: TvRemoteSettings): Partial<TvSettings> {
  const patch: Partial<TvSettings> = {};
  if (typeof row.accent_color === 'string' && row.accent_color) {
    patch.accentColor = row.accent_color;
  }
  if (typeof row.stream_source === 'string' && row.stream_source) {
    patch.streamSource = row.stream_source;
  }
  if (typeof row.rotate_minutes === 'number') {
    patch.rotateMinutes = clampRotateMinutes(row.rotate_minutes);
  }
  if (typeof row.show_weather === 'boolean') {
    patch.showWeather = row.show_weather;
  }
  if (typeof row.countdown_takeover_enabled === 'boolean') {
    patch.countdownTakeoverEnabled = row.countdown_takeover_enabled;
  }
  if (typeof row.countdown_minutes === 'number') {
    patch.countdownMinutes = clampMinutes1to60(row.countdown_minutes, 5);
  }
  if (typeof row.iqama_enabled === 'boolean') {
    patch.iqamaEnabled = row.iqama_enabled;
  }
  if (row.iqama_offsets && typeof row.iqama_offsets === 'object') {
    patch.iqamaOffsets = mapIqamaOffsets(row.iqama_offsets);
  }
  if (typeof row.name_only_enabled === 'boolean') {
    patch.nameOnlyEnabled = row.name_only_enabled;
  }
  if (typeof row.name_only_minutes === 'number') {
    patch.nameOnlyMinutes = clampMinutes1to60(row.name_only_minutes, 10);
  }
  if (typeof row.calc_method === 'string' && row.calc_method) {
    patch.calculationMethodId = row.calc_method;
  }
  if (typeof row.madhab === 'string' && row.madhab) {
    const mapped = mapMadhab(row.madhab);
    if (mapped) patch.madhab = mapped;
  }
  if (typeof row.time_format === 'string' && row.time_format) {
    const mapped = mapTimeFormat(row.time_format);
    if (mapped) patch.timeFormat = mapped;
  }
  if (typeof row.latitude === 'number') {
    patch.latitude = row.latitude;
  }
  if (typeof row.longitude === 'number') {
    patch.longitude = row.longitude;
  }
  if (typeof row.city === 'string' && row.city) {
    patch.cityName = row.city;
  }
  if (typeof row.timezone === 'string' && row.timezone) {
    patch.timezone = row.timezone;
  }
  if (typeof row.layout === 'string' && row.layout) {
    const mapped = mapLayout(row.layout);
    if (mapped) patch.layout = mapped;
  }
  if (typeof row.theme === 'string' && row.theme) {
    const mapped = mapTheme(row.theme);
    if (mapped) patch.theme = mapped;
  }
  return patch;
}

/**
 * TvSettingsSync — polls pc_tv_settings and applies cosmetic settings via [applyPatch].
 * Call start() once on boot; stop() on teardown.
 */
export class TvSettingsSync {
  private client: Client;
  private deviceId: string;
  private applyPatch: (patch: Partial<TvSettings>) => void;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    client: Client,
    deviceId: string,
    applyPatch: (patch: Partial<TvSettings>) => void
  ) {
    this.client = client;
    this.deviceId = deviceId;
    this.applyPatch = applyPatch;
  }

  /** Runs an immediate fetch, then schedules a ~5-second poll. */
  async start(): Promise<void> {
    await this.poll();
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.poll();
    }, POLL_INTERVAL_MS);
  }

  /**
   * One fetch → map → apply. Errors are swallowed. Uses 'network-only' so the client's
   * cacheExchange never serves a stale row on the fast poll cadence.
   */
  async poll(): Promise<void> {
    try {
      const result = await this.client
        .query(GET_TV_SETTINGS, { deviceId: this.deviceId }, { requestPolicy: 'network-only' })
        .toPromise();
      const row = result.data?.pc_tv_settings?.[0] as TvRemoteSettings | undefined;
      if (!row) return; // No row → keep defaults.
      const patch = mapRemoteSettings(row);
      if (Object.keys(patch).length > 0) this.applyPatch(patch);
    } catch {
      // Network/parse error — keep last-known settings.
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
