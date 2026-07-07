/**
 * Purpose: Poll pc_tv_settings (public role) for this TV's cosmetic settings and merge
 *   them into the local settings store. Runs on boot and every 5 minutes.
 * Inputs: urql client, device id, a store-updater callback.
 * Outputs: side-effect — applies { accentColor, streamSource, rotateMinutes, showWeather }
 *   to the store when a row exists. No row → leaves current (default) values untouched.
 * Constraints: read-only, public role, api.praycalc.com. Never throws — network errors
 *   are swallowed so the dashboard keeps running on the last-known settings.
 * SPORT: praycalc/tv lib/settings
 */

import { Client } from 'urql';
import { GET_TV_SETTINGS } from '../graphql/queries';
import { TvRemoteSettings, TvSettings } from '../../types';

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/** rotate_minutes is clamped to the supported 1–30 range. */
export function clampRotateMinutes(value: number): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(30, Math.max(1, Math.round(value)));
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

  /** Runs an immediate fetch, then schedules a 5-minute poll. */
  async start(): Promise<void> {
    await this.poll();
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.poll();
    }, POLL_INTERVAL_MS);
  }

  /** One fetch → map → apply. Errors are swallowed. */
  async poll(): Promise<void> {
    try {
      const result = await this.client
        .query(GET_TV_SETTINGS, { deviceId: this.deviceId })
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
