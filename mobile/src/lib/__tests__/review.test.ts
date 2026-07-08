/**
 * Purpose: Unit tests for the rate-us review gate — pure decision logic
 *   (shouldRequestReview) plus the persisted counter/flag flow
 *   (recordSuccessAndMaybeRequestReview) against an in-memory MMKV mock.
 * Constraints: react-native-mmkv is a native module (not auto-mocked by jest-expo,
 *   same as AsyncStorage elsewhere in this repo) — mocked in-memory here, matching
 *   the pattern in notifications/__tests__/PrayerNotificationService.test.ts.
 *   expo-store-review is also mocked so no real StoreReview call happens under test.
 */

// In-memory MMKV mock — same shape as react-native-mmkv's API surface this module uses.
jest.mock('../storage/mmkv', () => {
  const store = new Map<string, string | boolean>();
  return {
    mmkv: {
      getString: (key: string) => {
        const v = store.get(key);
        return typeof v === 'string' ? v : undefined;
      },
      getBoolean: (key: string) => {
        const v = store.get(key);
        return typeof v === 'boolean' ? v : undefined;
      },
      set: (key: string, value: string | boolean) => {
        store.set(key, value);
      },
      delete: (key: string) => {
        store.delete(key);
      },
    },
  };
});

const mockIsAvailableAsync = jest.fn();
const mockRequestReview = jest.fn();
jest.mock('expo-store-review', () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailableAsync(...args),
  requestReview: (...args: unknown[]) => mockRequestReview(...args),
}));

import {
  shouldRequestReview,
  REVIEW_SUCCESS_THRESHOLD,
  getReviewSuccessCount,
  hasAlreadyAskedForReview,
  recordSuccessAndMaybeRequestReview,
  resetReviewGateForTesting,
} from '../review';

describe('shouldRequestReview (pure gate logic)', () => {
  it('does not request below the threshold', () => {
    expect(shouldRequestReview(REVIEW_SUCCESS_THRESHOLD - 1, false)).toBe(false);
  });

  it('requests once the threshold is reached', () => {
    expect(shouldRequestReview(REVIEW_SUCCESS_THRESHOLD, false)).toBe(true);
  });

  it('requests when past the threshold', () => {
    expect(shouldRequestReview(REVIEW_SUCCESS_THRESHOLD + 5, false)).toBe(true);
  });

  it('never requests again once alreadyAsked is true, regardless of count', () => {
    expect(shouldRequestReview(REVIEW_SUCCESS_THRESHOLD + 100, true)).toBe(false);
  });
});

describe('recordSuccessAndMaybeRequestReview (persisted flow)', () => {
  beforeEach(() => {
    resetReviewGateForTesting();
    mockIsAvailableAsync.mockReset().mockResolvedValue(true);
    mockRequestReview.mockReset().mockResolvedValue(undefined);
  });

  it('increments the success counter on every call', async () => {
    await recordSuccessAndMaybeRequestReview();
    expect(getReviewSuccessCount()).toBe(1);
    await recordSuccessAndMaybeRequestReview();
    expect(getReviewSuccessCount()).toBe(2);
  });

  it('does not call StoreReview before the threshold', async () => {
    for (let i = 0; i < REVIEW_SUCCESS_THRESHOLD - 1; i++) {
      await recordSuccessAndMaybeRequestReview();
    }
    expect(mockRequestReview).not.toHaveBeenCalled();
    expect(hasAlreadyAskedForReview()).toBe(false);
  });

  it('calls StoreReview exactly once when the threshold is crossed, then never again', async () => {
    for (let i = 0; i < REVIEW_SUCCESS_THRESHOLD + 10; i++) {
      await recordSuccessAndMaybeRequestReview();
    }
    expect(mockRequestReview).toHaveBeenCalledTimes(1);
    expect(hasAlreadyAskedForReview()).toBe(true);
  });

  it('does not request when StoreReview is unavailable on this device', async () => {
    mockIsAvailableAsync.mockResolvedValue(false);
    for (let i = 0; i < REVIEW_SUCCESS_THRESHOLD + 5; i++) {
      await recordSuccessAndMaybeRequestReview();
    }
    expect(mockRequestReview).not.toHaveBeenCalled();
    // Never marked "asked" since we never actually attempted the request.
    expect(hasAlreadyAskedForReview()).toBe(false);
  });
});
