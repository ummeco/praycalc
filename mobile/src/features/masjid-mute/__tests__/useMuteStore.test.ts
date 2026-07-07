/**
 * Purpose: Regression tests for useMuteStore — zone CRUD, radius clamping, and
 *   AsyncStorage persistence (partialize excludes transient runtime fields).
 * Constraints: Mocks @react-native-async-storage/async-storage the same way
 *   PrayerNotificationService.test.ts does — jest-expo does not auto-mock
 *   third-party community native modules.
 */

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store.get(key) ?? null)),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value);
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key);
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  };
});

import {
  useMuteStore,
  clampRadius,
  MIN_RADIUS_METERS,
  MAX_RADIUS_METERS,
  DEFAULT_RADIUS_METERS,
} from '../store/useMuteStore';

describe('clampRadius', () => {
  it('clamps below the minimum up to MIN_RADIUS_METERS', () => {
    expect(clampRadius(10)).toBe(MIN_RADIUS_METERS);
  });

  it('clamps above the maximum down to MAX_RADIUS_METERS', () => {
    expect(clampRadius(9999)).toBe(MAX_RADIUS_METERS);
  });

  it('passes through an in-range value unchanged (rounded)', () => {
    expect(clampRadius(150.4)).toBe(150);
  });
});

describe('useMuteStore', () => {
  beforeEach(() => {
    useMuteStore.getState().reset();
  });

  it('starts with zero zones and auto-mute enabled by default', () => {
    const state = useMuteStore.getState();
    expect(state.zones).toEqual([]);
    expect(state.autoMuteEnabled).toBe(true);
  });

  it('addZone adds a zone with a generated id and clamped radius', () => {
    const zone = useMuteStore.getState().addZone({
      label: 'Masjid Al-Noor',
      latitude: 21.4225,
      longitude: 39.8262,
      radiusMeters: 9999,
    });
    expect(zone.id).toBeTruthy();
    expect(zone.radiusMeters).toBe(MAX_RADIUS_METERS);
    expect(useMuteStore.getState().zones).toHaveLength(1);
    expect(useMuteStore.getState().zones[0]?.label).toBe('Masjid Al-Noor');
  });

  it('addZone defaults are respected by the caller (DEFAULT_RADIUS_METERS constant)', () => {
    const zone = useMuteStore.getState().addZone({
      label: 'Local Masjid',
      latitude: 1,
      longitude: 1,
      radiusMeters: DEFAULT_RADIUS_METERS,
    });
    expect(zone.radiusMeters).toBe(DEFAULT_RADIUS_METERS);
  });

  it('updateZone patches fields and re-clamps radius', () => {
    const zone = useMuteStore.getState().addZone({
      label: 'Masjid A',
      latitude: 1,
      longitude: 1,
      radiusMeters: 100,
    });
    useMuteStore.getState().updateZone(zone.id, { label: 'Masjid B', radiusMeters: 5 });
    const updated = useMuteStore.getState().zones.find((z) => z.id === zone.id);
    expect(updated?.label).toBe('Masjid B');
    expect(updated?.radiusMeters).toBe(MIN_RADIUS_METERS);
  });

  it('removeZone removes the zone and clears it from activeZoneIds', () => {
    const zone = useMuteStore.getState().addZone({
      label: 'Masjid A',
      latitude: 1,
      longitude: 1,
      radiusMeters: 100,
    });
    useMuteStore.getState().setActiveZoneIds([zone.id]);
    useMuteStore.getState().removeZone(zone.id);
    expect(useMuteStore.getState().zones).toHaveLength(0);
    expect(useMuteStore.getState().activeZoneIds).toEqual([]);
  });

  it('setAutoMuteEnabled toggles the master flag', () => {
    useMuteStore.getState().setAutoMuteEnabled(false);
    expect(useMuteStore.getState().autoMuteEnabled).toBe(false);
  });

  it('setPreviousRingerMode stores the captured mode for later restore', () => {
    useMuteStore.getState().setPreviousRingerMode('normal');
    expect(useMuteStore.getState().previousRingerMode).toBe('normal');
    useMuteStore.getState().setPreviousRingerMode(null);
    expect(useMuteStore.getState().previousRingerMode).toBeNull();
  });

  it('persists zones across a simulated reload via AsyncStorage', async () => {
    useMuteStore.getState().addZone({
      label: 'Persisted Masjid',
      latitude: 5,
      longitude: 5,
      radiusMeters: 150,
    });
    // Give the persist middleware's async AsyncStorage.setItem a tick to flush.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const raw = await AsyncStorage.getItem('praycalc-masjid-mute');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.state.zones).toHaveLength(1);
    expect(parsed.state.zones[0].label).toBe('Persisted Masjid');
    // Transient fields must NOT be persisted (partialize excludes them).
    expect(parsed.state.activeZoneIds).toBeUndefined();
    expect(parsed.state.previousRingerMode).toBeUndefined();
  });

  it('reset restores initial state', () => {
    useMuteStore.getState().addZone({ label: 'X', latitude: 1, longitude: 1, radiusMeters: 100 });
    useMuteStore.getState().setAutoMuteEnabled(false);
    useMuteStore.getState().reset();
    expect(useMuteStore.getState().zones).toEqual([]);
    expect(useMuteStore.getState().autoMuteEnabled).toBe(true);
  });
});
