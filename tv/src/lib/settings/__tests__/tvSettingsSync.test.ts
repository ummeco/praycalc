/**
 * Purpose: Verify pc_tv_settings row → TvSettings patch mapping, rotate_minutes clamping,
 *   and that the poll applies a patch (mocked urql client, no network).
 * SPORT: praycalc/tv lib/settings tests
 */

import { mapRemoteSettings, clampRotateMinutes, TvSettingsSync } from '../tvSettingsSync';
import type { Client } from 'urql';
import type { TvSettings } from '../../../types';

describe('clampRotateMinutes', () => {
  it('clamps into 1..30 and rounds', () => {
    expect(clampRotateMinutes(0)).toBe(1);
    expect(clampRotateMinutes(50)).toBe(30);
    expect(clampRotateMinutes(10.4)).toBe(10);
    expect(clampRotateMinutes(NaN)).toBe(10);
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
