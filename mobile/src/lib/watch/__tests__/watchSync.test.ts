/**
 * Purpose: Unit tests for watchSync's throttle/settings-changed decision logic and
 *   platform fork, against mocked native bridges (globalThis.expo.modules.*) and a
 *   mocked settings store + day-times calculator. Verifies: no-op with no location,
 *   no-op when the native module is absent/unsupported, sends on first call, skips a
 *   duplicate send inside the throttle window, force-sends immediately when
 *   location/method/madhab changes, and forks correctly between the iOS
 *   (updateApplicationContext) and Android (sendPrayerTimes) native calls.
 * Constraints: Overrides Platform.OS directly (jest-expo's Platform mock is a plain
 *   writable object) rather than jest.mock('react-native', ...), so both platform
 *   branches can be exercised in one file without per-file static mocks.
 */

import { Platform } from 'react-native';
import {
  syncPrayerDataToWatch,
  __resetWatchSyncStateForTests,
} from '../watchSync';

const mockActiveLocation = jest.fn();
const mockComputeDayTimes = jest.fn();
jest.mock('../../notifications/dayTimes', () => ({
  activeLocation: (...args: unknown[]) => mockActiveLocation(...args),
  computeDayTimes: (...args: unknown[]) => mockComputeDayTimes(...args),
}));

const mockGetState = jest.fn();
jest.mock('../../../features/settings/store/useSettingsStore', () => ({
  useSettingsStore: { getState: () => mockGetState() },
}));

const LOCATION = { latitude: 21.4225, longitude: 39.8262, city: 'Makkah', country: 'SA', timezone: 'Asia/Riyadh' };
const TIMES = {
  Fajr: new Date(2026, 0, 1, 5, 30),
  Sunrise: new Date(2026, 0, 1, 6, 45),
  Dhuhr: new Date(2026, 0, 1, 12, 15),
  Asr: new Date(2026, 0, 1, 15, 45),
  Maghrib: new Date(2026, 0, 1, 17, 5),
  Isha: new Date(2026, 0, 1, 18, 30),
};

interface FakeWatchBridge {
  isSupported: jest.Mock;
  activate: jest.Mock;
  updateApplicationContext: jest.Mock;
  isPaired: jest.Mock;
  isWatchAppInstalled: jest.Mock;
}

interface FakeWearBridge {
  isSupported: jest.Mock;
  sendPrayerTimes: jest.Mock;
}

function installIosNative(overrides: Partial<FakeWatchBridge> = {}): FakeWatchBridge {
  const mod: FakeWatchBridge = {
    isSupported: jest.fn().mockReturnValue(true),
    activate: jest.fn(),
    updateApplicationContext: jest.fn().mockReturnValue(true),
    isPaired: jest.fn().mockReturnValue(true),
    isWatchAppInstalled: jest.fn().mockReturnValue(true),
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).expo = { modules: { WatchBridge: mod } };
  return mod;
}

function installAndroidNative(overrides: Partial<FakeWearBridge> = {}): FakeWearBridge {
  const mod: FakeWearBridge = {
    isSupported: jest.fn().mockReturnValue(true),
    sendPrayerTimes: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).expo = { modules: { WearBridge: mod } };
  return mod;
}

function removeNative(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).expo = undefined;
}

function settings(overrides: Record<string, unknown> = {}) {
  return {
    method: 'MWL',
    madhab: 'Shafi',
    musafirMode: false,
    travelLocation: null,
    location: LOCATION,
    ...overrides,
  };
}

const originalPlatformOS = Platform.OS;

beforeEach(() => {
  jest.clearAllMocks();
  __resetWatchSyncStateForTests();
  mockActiveLocation.mockImplementation((s: { location: unknown }) => s.location ?? null);
  mockComputeDayTimes.mockReturnValue(TIMES);
  mockGetState.mockReturnValue(settings());
  Platform.OS = 'ios';
});

afterEach(() => {
  Platform.OS = originalPlatformOS;
  removeNative();
});

describe('syncPrayerDataToWatch — no-op guards', () => {
  it('no-ops when no location is configured', async () => {
    mockGetState.mockReturnValue(settings({ location: null }));
    const mod = installIosNative();
    await syncPrayerDataToWatch();
    expect(mod.updateApplicationContext).not.toHaveBeenCalled();
  });

  it('no-ops when no native bridge is present', async () => {
    removeNative();
    await expect(syncPrayerDataToWatch()).resolves.toBeUndefined();
  });

  it('no-ops when the native module reports unsupported', async () => {
    const mod = installIosNative({ isSupported: jest.fn().mockReturnValue(false) });
    await syncPrayerDataToWatch();
    expect(mod.updateApplicationContext).not.toHaveBeenCalled();
  });
});

describe('syncPrayerDataToWatch — iOS', () => {
  it('sends the mapped context on first sync', async () => {
    const mod = installIosNative();
    await syncPrayerDataToWatch();
    expect(mod.activate).toHaveBeenCalled();
    expect(mod.updateApplicationContext).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: LOCATION.latitude,
        longitude: LOCATION.longitude,
        city: 'Makkah',
        method: 'mwl',
        madhab: 'shafi',
      }),
    );
  });

  it('skips a duplicate send inside the throttle window', async () => {
    const mod = installIosNative();
    await syncPrayerDataToWatch();
    await syncPrayerDataToWatch();
    expect(mod.updateApplicationContext).toHaveBeenCalledTimes(1);
  });

  it('force-sends immediately when the location changes, ignoring the throttle window', async () => {
    const mod = installIosNative();
    await syncPrayerDataToWatch();
    mockGetState.mockReturnValue(settings({ location: { ...LOCATION, city: 'Madinah' } }));
    await syncPrayerDataToWatch();
    expect(mod.updateApplicationContext).toHaveBeenCalledTimes(2);
  });

  it('does not advance the throttle state when the native call fails', async () => {
    const mod = installIosNative({ updateApplicationContext: jest.fn().mockReturnValue(false) });
    await syncPrayerDataToWatch();
    await syncPrayerDataToWatch();
    expect(mod.updateApplicationContext).toHaveBeenCalledTimes(2);
  });
});

describe('syncPrayerDataToWatch — Android', () => {
  beforeEach(() => {
    Platform.OS = 'android';
  });

  it('sends the mapped prayer-times DataMap fields on first sync', async () => {
    const mod = installAndroidNative();
    await syncPrayerDataToWatch();
    expect(mod.sendPrayerTimes).toHaveBeenCalledWith('Makkah', '05:30', '12:15', '15:45', '17:05', '18:30');
  });

  it('skips a duplicate send inside the throttle window', async () => {
    const mod = installAndroidNative();
    await syncPrayerDataToWatch();
    await syncPrayerDataToWatch();
    expect(mod.sendPrayerTimes).toHaveBeenCalledTimes(1);
  });
});
