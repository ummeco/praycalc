/**
 * Purpose: Hook test for usePrayerTimes — settings persistence + updateSettings.
 * Inputs: usePrayerTimes hook (mocked AsyncStorage + prayCalc)
 * Outputs: Jest/React Native Testing Library assertions
 * Constraints: Mocks AsyncStorage and prayCalc to isolate hook logic.
 * SPORT: __tests__/usePrayerTimes.test.ts
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/prayCalc', () => ({
  computePrayerTimes: jest.fn().mockReturnValue({
    prayers: [],
    nextPrayer: null,
    minutesUntilNext: null,
    date: new Date(),
  }),
}));

jest.mock('pray-calc', () => ({ getTimes: jest.fn(), METHODS: {} }));

import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePrayerTimes } from '../src/hooks/usePrayerTimes';

const mockLocation = {
  latitude: 40.7128,
  longitude: -74.006,
  cityName: 'New York',
  utcOffsetHours: -5,
};

describe('usePrayerTimes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('returns default settings when AsyncStorage is empty', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePrayerTimes(mockLocation));
    await waitForNextUpdate();
    expect(result.current.settings.calcMethod).toBe('dynamic');
    expect(result.current.settings.asrMethod).toBe('shafii');
    expect(result.current.settings.use24h).toBe(false);
  });

  it('loads persisted settings from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ calcMethod: 'mwl', asrMethod: 'hanafi', use24h: true }),
    );
    const { result, waitForNextUpdate } = renderHook(() => usePrayerTimes(mockLocation));
    await waitForNextUpdate();
    expect(result.current.settings.calcMethod).toBe('mwl');
    expect(result.current.settings.asrMethod).toBe('hanafi');
  });

  it('updateSettings merges partial changes and persists', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePrayerTimes(mockLocation));
    await waitForNextUpdate();

    act(() => {
      result.current.updateSettings({ calcMethod: 'isna' });
    });

    expect(result.current.settings.calcMethod).toBe('isna');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@praycalc/calc_settings',
      expect.stringContaining('"calcMethod":"isna"'),
    );
  });

  it('loading is true initially and false after resolve', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePrayerTimes(mockLocation));
    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();
    expect(result.current.loading).toBe(false);
  });

  it('returns null times when location is null', async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePrayerTimes(null));
    await waitForNextUpdate();
    expect(result.current.times).toBeNull();
  });
});
