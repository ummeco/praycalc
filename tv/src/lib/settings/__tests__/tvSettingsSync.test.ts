/**
 * Purpose: Verify pc_tv_settings row → TvSettings patch mapping, rotate_minutes clamping,
 *   and that the poll applies a patch (mocked urql client, no network).
 * SPORT: praycalc/tv lib/settings tests
 */

import {
  mapRemoteSettings,
  mapIqamaOffsets,
  DEFAULT_IQAMA_OFFSETS,
  TvSettingsSync,
} from '../tvSettingsSync';
import type { Client } from 'urql';
import type { TvSettings } from '../../../types';

// clampRotateMinutes / clampMinutes1to60 moved to @praycalc/ui-utils — see
// packages/ui-utils/src/__tests__/clamp.test.ts for their unit tests.

describe('mapIqamaOffsets', () => {
  it('reads all 5 keys by name regardless of object key order', () => {
    expect(mapIqamaOffsets({ isha: 15, fajr: 25, asr: 12, dhuhr: 8, maghrib: 3 })).toEqual({
      fajr: 25,
      dhuhr: 8,
      asr: 12,
      maghrib: 3,
      isha: 15,
    });
  });

  it('fills missing/non-numeric keys from the default', () => {
    expect(mapIqamaOffsets({ fajr: 30 })).toEqual({
      ...DEFAULT_IQAMA_OFFSETS,
      fajr: 30,
    });
    expect(mapIqamaOffsets(null)).toEqual(DEFAULT_IQAMA_OFFSETS);
    expect(mapIqamaOffsets({})).toEqual(DEFAULT_IQAMA_OFFSETS);
  });
});

describe('mapRemoteSettings', () => {
  it('maps a full row to the cosmetic patch', () => {
    expect(
      mapRemoteSettings({
        accent_color: '#C9F27A',
        stream_source: 'saudi-quran',
        rotate_minutes: 5,
        show_weather: false,
      })
    ).toEqual({
      accentColor: '#C9F27A',
      streamSource: 'saudi-quran',
      rotateMinutes: 5,
      showWeather: false,
    });
  });

  it('ignores null/absent fields (partial rows apply over defaults)', () => {
    expect(
      mapRemoteSettings({ accent_color: null, stream_source: 'medina' })
    ).toEqual({ streamSource: 'medina' });
    expect(mapRemoteSettings({})).toEqual({});
  });

  it('clamps rotate_minutes from the row', () => {
    expect(mapRemoteSettings({ rotate_minutes: 99 })).toEqual({ rotateMinutes: 30 });
  });

  it('maps deep settings, remapping madhab shafii -> shafi and clamping minute fields', () => {
    expect(
      mapRemoteSettings({
        countdown_takeover_enabled: true,
        countdown_minutes: 90,
        iqama_enabled: true,
        iqama_offsets: { fajr: 15, dhuhr: 5, asr: 5, maghrib: 3, isha: 8 },
        name_only_enabled: true,
        name_only_minutes: 0,
        calc_method: 'isna',
        madhab: 'shafii',
        time_format: '12h',
        latitude: 40.7128,
        longitude: -74.006,
        city: 'New York',
        timezone: 'America/New_York',
      })
    ).toEqual({
      countdownTakeoverEnabled: true,
      countdownMinutes: 60,
      iqamaEnabled: true,
      iqamaOffsets: { fajr: 15, dhuhr: 5, asr: 5, maghrib: 3, isha: 8 },
      nameOnlyEnabled: true,
      nameOnlyMinutes: 1,
      calculationMethodId: 'isna',
      madhab: 'shafi',
      timeFormat: '12h',
      latitude: 40.7128,
      longitude: -74.006,
      cityName: 'New York',
      timezone: 'America/New_York',
    });
  });

  it('maps madhab hanafi unchanged and ignores unknown madhab/time_format values', () => {
    expect(mapRemoteSettings({ madhab: 'hanafi' })).toEqual({ madhab: 'hanafi' });
    expect(mapRemoteSettings({ madhab: 'bogus' })).toEqual({});
    expect(mapRemoteSettings({ time_format: 'bogus' })).toEqual({});
  });
});

describe('TvSettingsSync.poll', () => {
  function mockClient(data: unknown): Client {
    return {
      query: jest.fn(() => ({ toPromise: () => Promise.resolve({ data }) })),
    } as unknown as Client;
  }

  it('applies a patch when a settings row exists', async () => {
    const client = mockClient({
      pc_tv_settings: [{ accent_color: '#123456', show_weather: true }],
    });
    const applied: Partial<TvSettings>[] = [];
    const sync = new TvSettingsSync(client, 'tv-abc', (p) => applied.push(p));
    await sync.poll();
    sync.stop();
    expect(applied).toEqual([{ accentColor: '#123456', showWeather: true }]);
  });

  it('applies nothing when no row exists (keeps defaults)', async () => {
    const client = mockClient({ pc_tv_settings: [] });
    const applied: Partial<TvSettings>[] = [];
    const sync = new TvSettingsSync(client, 'tv-abc', (p) => applied.push(p));
    await sync.poll();
    sync.stop();
    expect(applied).toEqual([]);
  });
});
