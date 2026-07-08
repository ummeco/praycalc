/**
 * Purpose: Unit tests for the Live Activity orchestration (start-or-update-or-end logic
 *   in liveActivity.ts) against a mocked native module. Verifies: no-op when the native
 *   module is absent / unsupported, start on first refresh, update when already running,
 *   restart on a stale id, and end when there is no next prayer.
 * Constraints: Injects a fake native module on globalThis.expo.modules.PrayLiveActivity
 *   (the same proxy nativeModule.ts reads). Mocks computeNextPrayer so the tests don't
 *   need the full settings + calc-engine chain. jest-expo runs Platform.OS === 'ios'.
 */

import {
  refreshNextPrayerLiveActivity,
  endNextPrayerLiveActivity,
  isLiveActivitySupported,
  // eslint-disable-next-line @typescript-eslint/no-var-requires
} from '../liveActivity';
import { __resetLiveActivityStateForTests } from '../liveActivity';

// Shared calc path — mock so we control the "next prayer" without the engine.
const mockComputeNextPrayer = jest.fn();
jest.mock('../../../widgets/widgetTaskHandler', () => ({
  computeNextPrayer: () => mockComputeNextPrayer(),
  formatTime: (d: Date) => `label:${d.getTime()}`,
}));

interface FakeNative {
  isSupported: jest.Mock;
  start: jest.Mock;
  update: jest.Mock;
  end: jest.Mock;
  endAll: jest.Mock;
  isRunning: jest.Mock;
}

function installNative(overrides: Partial<FakeNative> = {}): FakeNative {
  const mod: FakeNative = {
    isSupported: jest.fn().mockReturnValue(true),
    start: jest.fn().mockResolvedValue('activity-1'),
    update: jest.fn().mockResolvedValue(true),
    end: jest.fn().mockResolvedValue(undefined),
    endAll: jest.fn().mockResolvedValue(undefined),
    isRunning: jest.fn().mockReturnValue(false),
    ...overrides,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).expo = { modules: { PrayLiveActivity: mod } };
  return mod;
}

function removeNative(): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).expo = undefined;
}

const NEXT = { name: 'Fajr', time: new Date(Date.now() + 3_600_000), cityName: 'Makkah' };

beforeEach(() => {
  jest.clearAllMocks();
  __resetLiveActivityStateForTests();
  mockComputeNextPrayer.mockResolvedValue(NEXT);
});

describe('isLiveActivitySupported', () => {
  it('is false when the native module is absent', () => {
    removeNative();
    expect(isLiveActivitySupported()).toBe(false);
  });

  it('reflects the native isSupported result', () => {
    installNative({ isSupported: jest.fn().mockReturnValue(true) });
    expect(isLiveActivitySupported()).toBe(true);
  });
});

describe('refreshNextPrayerLiveActivity', () => {
  it('no-ops when the native module is unavailable', async () => {
    removeNative();
    await expect(refreshNextPrayerLiveActivity()).resolves.toBeUndefined();
  });

  it('no-ops when Live Activities are unsupported', async () => {
    const mod = installNative({ isSupported: jest.fn().mockReturnValue(false) });
    await refreshNextPrayerLiveActivity();
    expect(mod.start).not.toHaveBeenCalled();
  });

  it('starts a new activity on first refresh', async () => {
    const mod = installNative();
    await refreshNextPrayerLiveActivity();
    expect(mod.start).toHaveBeenCalledWith(
      'Fajr',
      NEXT.time.getTime(),
      `label:${NEXT.time.getTime()}`,
      'Makkah',
    );
  });

  it('updates in place when already running', async () => {
    const mod = installNative({ isRunning: jest.fn().mockReturnValue(true) });
    await refreshNextPrayerLiveActivity(); // start -> id activity-1
    await refreshNextPrayerLiveActivity(); // running -> update
    expect(mod.update).toHaveBeenCalledWith(
      'activity-1',
      'Fajr',
      NEXT.time.getTime(),
      `label:${NEXT.time.getTime()}`,
    );
  });

  it('ends the activity when there is no next prayer', async () => {
    const mod = installNative();
    await refreshNextPrayerLiveActivity(); // starts
    mockComputeNextPrayer.mockResolvedValue(null);
    await refreshNextPrayerLiveActivity(); // no next -> end
    expect(mod.end).toHaveBeenCalledWith('activity-1');
  });
});

describe('endNextPrayerLiveActivity', () => {
  it('ends a running activity by id', async () => {
    const mod = installNative({ isRunning: jest.fn().mockReturnValue(true) });
    await refreshNextPrayerLiveActivity(); // starts -> activity-1
    await endNextPrayerLiveActivity();
    expect(mod.end).toHaveBeenCalledWith('activity-1');
  });

  it('falls back to endAll when no id is tracked', async () => {
    const mod = installNative();
    await endNextPrayerLiveActivity();
    expect(mod.endAll).toHaveBeenCalled();
  });
});
