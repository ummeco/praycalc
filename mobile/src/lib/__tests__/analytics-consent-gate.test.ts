/**
 * Purpose: Verify src/lib/analytics.ts is consent-gated — no Umami beacon fires
 *   unless useConsentStore's analyticsConsent === 'granted' (default-deny).
 * Constraints:
 *   - analytics.ts reads EXPO_PUBLIC_UMAMI_URL/EXPO_PUBLIC_UMAMI_WEBSITE_ID into
 *     top-level `const`s at module-evaluation time, so the env vars must be set
 *     BEFORE the module is first required — hence jest.resetModules() + require()
 *     inside each test (a static top-level import would freeze stale/undefined
 *     env values from whenever the module first loaded).
 *   - Mocks fetch (via globalThis, matching reporter.test.ts's pattern).
 *   - Mocks @react-native-async-storage/async-storage the same way
 *     useMuteStore.test.ts / PrayerNotificationService.test.ts do — jest-expo
 *     does not auto-mock third-party community native modules, and
 *     useConsentStore's persist middleware imports it at module load time.
 *   - Mocks ../../i18n/index the same way PrayerNotificationService.test.ts mocks
 *     ../../../i18n — analytics.ts only reads i18next.language, so a plain
 *     passthrough avoids pulling in expo-localization's native module.
 */

import type { useConsentStore as UseConsentStoreType } from '../../features/consent/store/useConsentStore';
import type * as AnalyticsModule from '../analytics';

// type-only imports above are erased at compile time (no runtime footprint), so
// moving them ahead of the jest.mock() calls below cannot affect mock timing.
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

jest.mock('../../i18n/index', () => ({
  __esModule: true,
  default: { language: 'en' },
}));

function mockFetchOnce() {
  globalThis.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
}

/** logAppOpen/logPrayerEvent fire-and-forget an async sendEvent() (`void sendEvent(...)`)
 *  — the actual fetch call happens on a microtask after the sync call returns, so tests
 *  asserting the fetch mock must flush microtasks first. */
function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/** Re-requires analytics.ts + useConsentStore fresh, with the Umami env vars already
 *  set — required because analytics.ts reads process.env into top-level consts. */
function loadAnalyticsWithEnv(): {
  analytics: typeof AnalyticsModule;
  consentStore: typeof UseConsentStoreType;
} {
  jest.resetModules();
  process.env.EXPO_PUBLIC_UMAMI_URL = 'https://umami.example.com';
  process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID = 'test-website-id';
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- resetModules()-driven fresh require, not a static dep
  const consentStore = require('../../features/consent/store/useConsentStore').useConsentStore;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- resetModules()-driven fresh require, not a static dep
  const analytics = require('../analytics') as typeof AnalyticsModule;
  return { analytics, consentStore };
}

describe('analytics consent gating', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('does NOT fire when consent is unset', () => {
    const { analytics, consentStore } = loadAnalyticsWithEnv();
    mockFetchOnce();
    consentStore.setState({ analyticsConsent: 'unset' });
    analytics.logAppOpen();
    analytics.logPrayerEvent('fajr');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('does NOT fire when consent is denied', () => {
    const { analytics, consentStore } = loadAnalyticsWithEnv();
    mockFetchOnce();
    consentStore.setState({ analyticsConsent: 'denied' });
    analytics.logAppOpen();
    analytics.logPrayerEvent('dhuhr');
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('fires (attempts) when consent is granted', async () => {
    const { analytics, consentStore } = loadAnalyticsWithEnv();
    mockFetchOnce();
    consentStore.setState({ analyticsConsent: 'granted' });
    analytics.logAppOpen();
    await flushMicrotasks();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/send'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('fires logPrayerEvent when consent is granted', async () => {
    const { analytics, consentStore } = loadAnalyticsWithEnv();
    mockFetchOnce();
    consentStore.setState({ analyticsConsent: 'granted' });
    analytics.logPrayerEvent('isha', '2026-01-01T20:00:00.000Z');
    await flushMicrotasks();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it('stops firing immediately after consent is revoked', async () => {
    const { analytics, consentStore } = loadAnalyticsWithEnv();
    mockFetchOnce();
    consentStore.setState({ analyticsConsent: 'granted' });
    analytics.logAppOpen();
    await flushMicrotasks();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);

    consentStore.setState({ analyticsConsent: 'denied' });
    analytics.logAppOpen();
    await flushMicrotasks();
    expect(globalThis.fetch).toHaveBeenCalledTimes(1); // still 1 — second call suppressed
  });
});
