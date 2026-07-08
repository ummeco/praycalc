/**
 * Purpose: Regression tests for geofenceTask's ENTER/EXIT handling logic — the
 *   Android mute-on-enter/restore-on-exit flow, the iOS reminder-notification
 *   fallback, and the "stay muted while still inside another zone" multi-zone
 *   invariant. The native TaskManager.defineTask callback is captured via the
 *   mocked defineTask so it can be invoked directly under test.
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

const mockMuteDevice = jest.fn();
const mockRestoreDevice = jest.fn();
const mockGetCurrentRingerMode = jest.fn();

jest.mock('../lib/ringerControl', () => ({
  muteDevice: (...args: unknown[]) => mockMuteDevice(...args),
  restoreDevice: (...args: unknown[]) => mockRestoreDevice(...args),
  getCurrentRingerMode: (...args: unknown[]) => mockGetCurrentRingerMode(...args),
}));

const mockDefinedTasks = new Map<string, (opts: { data: unknown; error: unknown }) => Promise<void>>();

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn((name: string, cb: (opts: { data: unknown; error: unknown }) => Promise<void>) => {
    mockDefinedTasks.set(name, cb);
  }),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
}));

const mockScheduleNotificationAsync = jest.fn().mockResolvedValue('id');

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: (...args: unknown[]) => mockScheduleNotificationAsync(...args),
}));

jest.mock('expo-location', () => ({
  GeofencingEventType: { Enter: 1, Exit: 2 },
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  startGeofencingAsync: jest.fn().mockResolvedValue(undefined),
  stopGeofencingAsync: jest.fn().mockResolvedValue(undefined),
}));

// Returns "key|opt1=val1|opt2=val2" rather than the real English template — this
// module's translation keys don't literally contain "{{zone}}" (that placeholder
// only exists in the resolved en.json template string, which this lightweight
// mock deliberately does not load), so tests assert against this deterministic
// "key + serialized options" shape instead of real interpolated English text.
jest.mock('../../../i18n', () => ({
  t: (key: string, options?: Record<string, unknown>) => {
    if (!options) return key;
    const optsStr = Object.entries(options).map(([k, v]) => `${k}=${String(v)}`).join('|');
    return `${key}|${optsStr}`;
  },
}));

// Mock only the Platform module (not all of 'react-native', which pulls in Flow
// syntax that jest-expo's transform can't parse when re-executed via requireActual
// inside a per-test jest.doMock factory) — same fix as ringerControl.test.ts.
function setPlatform(os: 'ios' | 'android') {
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    __esModule: true,
    default: {
      OS: os,
      select: (obj: Record<string, unknown>) => obj[os] ?? obj.default,
    },
  }));
}

// require() rather than dynamic import() — this project's Babel/CJS Jest transform
// does not reliably support dynamic import() inside a test body (see reporter.test.ts).
function requireMuteStore(): typeof import('../store/useMuteStore') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- resetModules()-driven fresh require, not a static dep
  return require('../store/useMuteStore') as typeof import('../store/useMuteStore');
}

function requireGeofenceTask(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- resetModules()-driven fresh require, not a static dep
  require('../lib/geofenceTask');
}

describe('geofenceTask ENTER/EXIT (Android)', () => {
  let useMuteStore: typeof import('../store/useMuteStore').useMuteStore;

  beforeEach(() => {
    jest.resetModules();
    mockDefinedTasks.clear();
    mockMuteDevice.mockReset();
    mockRestoreDevice.mockReset();
    mockGetCurrentRingerMode.mockReset();
    mockScheduleNotificationAsync.mockClear();
    setPlatform('android');

    ({ useMuteStore } = requireMuteStore());
    useMuteStore.getState().reset();
    requireGeofenceTask(); // registers the task via defineTask
  });

  it('registers the geofence task under GEOFENCE_TASK_NAME', () => {
    expect(mockDefinedTasks.has('MASJID_MUTE_GEOFENCE')).toBe(true);
  });

  it('on ENTER: mutes the device and captures the previous ringer mode', async () => {
    const zone = useMuteStore.getState().addZone({ label: 'Masjid A', latitude: 1, longitude: 1, radiusMeters: 100 });
    mockMuteDevice.mockResolvedValue({ muted: true, previousMode: 'normal' });

    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 1, region: { identifier: zone.id } }, error: null });

    expect(mockMuteDevice).toHaveBeenCalledTimes(1);
    expect(useMuteStore.getState().previousRingerMode).toBe('normal');
    expect(useMuteStore.getState().activeZoneIds).toContain(zone.id);
  });

  it('on EXIT (last zone): restores the previous ringer mode and clears activeZoneIds', async () => {
    const zone = useMuteStore.getState().addZone({ label: 'Masjid A', latitude: 1, longitude: 1, radiusMeters: 100 });
    useMuteStore.getState().setActiveZoneIds([zone.id]);
    useMuteStore.getState().setPreviousRingerMode('vibrate');
    mockRestoreDevice.mockResolvedValue(true);

    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 2, region: { identifier: zone.id } }, error: null });

    expect(mockRestoreDevice).toHaveBeenCalledWith('vibrate');
    expect(useMuteStore.getState().previousRingerMode).toBeNull();
    expect(useMuteStore.getState().activeZoneIds).toEqual([]);
  });

  it('on EXIT while still inside another zone: does NOT restore', async () => {
    const zoneA = useMuteStore.getState().addZone({ label: 'A', latitude: 1, longitude: 1, radiusMeters: 100 });
    const zoneB = useMuteStore.getState().addZone({ label: 'B', latitude: 2, longitude: 2, radiusMeters: 100 });
    useMuteStore.getState().setActiveZoneIds([zoneA.id, zoneB.id]);
    useMuteStore.getState().setPreviousRingerMode('normal');

    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 2, region: { identifier: zoneA.id } }, error: null });

    expect(mockRestoreDevice).not.toHaveBeenCalled();
    expect(useMuteStore.getState().previousRingerMode).toBe('normal');
    expect(useMuteStore.getState().activeZoneIds).toEqual([zoneB.id]);
  });

  it('does nothing when autoMuteEnabled is false', async () => {
    const zone = useMuteStore.getState().addZone({ label: 'A', latitude: 1, longitude: 1, radiusMeters: 100 });
    useMuteStore.getState().setAutoMuteEnabled(false);

    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 1, region: { identifier: zone.id } }, error: null });

    expect(mockMuteDevice).not.toHaveBeenCalled();
  });

  it('does nothing when the task callback receives an error', async () => {
    const zone = useMuteStore.getState().addZone({ label: 'A', latitude: 1, longitude: 1, radiusMeters: 100 });
    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 1, region: { identifier: zone.id } }, error: new Error('geofence error') });
    expect(mockMuteDevice).not.toHaveBeenCalled();
  });
});

describe('geofenceTask ENTER (iOS — reminder notification fallback)', () => {
  let useMuteStore: typeof import('../store/useMuteStore').useMuteStore;

  beforeEach(() => {
    jest.resetModules();
    mockDefinedTasks.clear();
    mockMuteDevice.mockReset();
    mockScheduleNotificationAsync.mockClear();
    setPlatform('ios');

    ({ useMuteStore } = requireMuteStore());
    useMuteStore.getState().reset();
    requireGeofenceTask();
  });

  it('on ENTER: fires a reminder notification instead of muting (Apple forbids programmatic mute)', async () => {
    const zone = useMuteStore.getState().addZone({ label: 'Masjid An-Noor', latitude: 1, longitude: 1, radiusMeters: 100 });

    const task = mockDefinedTasks.get('MASJID_MUTE_GEOFENCE')!;
    await task({ data: { eventType: 1, region: { identifier: zone.id } }, error: null });

    expect(mockMuteDevice).not.toHaveBeenCalled();
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const call = mockScheduleNotificationAsync.mock.calls[0][0];
    expect(call.content.body).toBe('screens.masjidMute.iosReminderBody|zone=Masjid An-Noor');
  });
});
