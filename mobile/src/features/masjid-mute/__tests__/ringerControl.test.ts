/**
 * Purpose: Regression tests for ringerControl — Android ringer mute/restore via
 *   react-native-volume-manager, and the honest iOS no-op path (Apple forbids
 *   programmatic ringer/mute-switch control). Mocks react-native-volume-manager
 *   and react-native's Platform module per-test so both platform branches are
 *   exercised deterministically.
 */

const mockGetRingerMode = jest.fn();
const mockSetRingerMode = jest.fn();

jest.mock('react-native-volume-manager', () => ({
  VolumeManager: {
    getRingerMode: (...args: unknown[]) => mockGetRingerMode(...args),
    setRingerMode: (...args: unknown[]) => mockSetRingerMode(...args),
  },
  RINGER_MODE: { silent: 0, vibrate: 1, normal: 2 },
}));

// Mock only the Platform module (not all of 'react-native', which pulls in Flow
// syntax that jest-expo's transform can't parse when re-executed via requireActual
// inside a per-test jest.doMock factory) — this is the standard RN Jest pattern for
// switching Platform.OS between test cases. Platform.js is a `export default`
// (Babel-compiled to a `default` key), so the mock must match that shape.
function setPlatform(os: 'ios' | 'android') {
  jest.doMock('react-native/Libraries/Utilities/Platform', () => ({
    __esModule: true,
    default: {
      OS: os,
      select: (obj: Record<string, unknown>) => obj[os] ?? obj.default,
    },
  }));
}

describe('ringerControl on Android', () => {
  beforeEach(() => {
    jest.resetModules();
    mockGetRingerMode.mockReset();
    mockSetRingerMode.mockReset();
    setPlatform('android');
  });

  it('getCurrentRingerMode reads and maps the numeric mode to a string', async () => {
    mockGetRingerMode.mockResolvedValue(2);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCurrentRingerMode } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    await expect(getCurrentRingerMode()).resolves.toBe('normal');
  });

  it('muteDevice captures the previous mode and sets vibrate', async () => {
    mockGetRingerMode.mockResolvedValue(2); // was 'normal'
    mockSetRingerMode.mockResolvedValue(1);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { muteDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    const result = await muteDevice();
    expect(result).toEqual({ muted: true, previousMode: 'normal' });
    expect(mockSetRingerMode).toHaveBeenCalledWith(1); // RINGER_MODE.vibrate
  });

  it('restoreDevice sets the ringer back to the given mode', async () => {
    mockSetRingerMode.mockResolvedValue(2);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { restoreDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    const ok = await restoreDevice('normal');
    expect(ok).toBe(true);
    expect(mockSetRingerMode).toHaveBeenCalledWith(2); // RINGER_MODE.normal
  });

  it('restoreDevice is a no-op when previousMode is null', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { restoreDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    const ok = await restoreDevice(null);
    expect(ok).toBe(false);
    expect(mockSetRingerMode).not.toHaveBeenCalled();
  });

  it('muteDevice resolves gracefully (never throws) when the native call rejects', async () => {
    mockGetRingerMode.mockRejectedValue(new Error('native module unavailable'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { muteDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    await expect(muteDevice()).resolves.toEqual({ muted: false, previousMode: null });
  });
});

describe('ringerControl on iOS (Apple forbids programmatic ringer control)', () => {
  beforeEach(() => {
    jest.resetModules();
    mockGetRingerMode.mockReset();
    mockSetRingerMode.mockReset();
    setPlatform('ios');
  });

  it('getCurrentRingerMode resolves to null without calling the native module', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getCurrentRingerMode } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    await expect(getCurrentRingerMode()).resolves.toBeNull();
    expect(mockGetRingerMode).not.toHaveBeenCalled();
  });

  it('muteDevice is a documented no-op on iOS', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { muteDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    await expect(muteDevice()).resolves.toEqual({ muted: false, previousMode: null });
    expect(mockSetRingerMode).not.toHaveBeenCalled();
  });

  it('restoreDevice is a documented no-op on iOS', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { restoreDevice } = require('../lib/ringerControl') as typeof import('../lib/ringerControl');
    await expect(restoreDevice('normal')).resolves.toBe(false);
    expect(mockSetRingerMode).not.toHaveBeenCalled();
  });
});
