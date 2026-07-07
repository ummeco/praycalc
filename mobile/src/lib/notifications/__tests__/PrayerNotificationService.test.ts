/**
 * Purpose: Regression tests for schedulePrayerNotifications — the core notification
 *   scheduling logic (prayer count, iqamah reminders, adhan-sound gating, past-time
 *   filtering) that reads the user's REAL settings instead of the previous hardcoded
 *   MWL/Shafi/all-5-prayers behavior.
 * Constraints: Mocks expo-notifications/expo-task-manager/expo-background-fetch (native
 *   modules — no real scheduling happens under test), AsyncStorage (community module not
 *   auto-mocked by jest-expo), and the Android widget dynamic import (never actually
 *   reached under jest's default iOS Platform.OS, but mocked defensively). Seeds
 *   useSettingsStore directly via setState per task instructions rather than going
 *   through UI, and freezes "now" so past/future trigger-time assertions are
 *   deterministic.
 */

import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '../../../features/settings/store/useSettingsStore';
import { schedulePrayerNotifications } from '../PrayerNotificationService';
import type { PrayerName } from '../../../types/prayer';

// jest-expo auto-mocks expo-owned native modules but not third-party community modules —
// AsyncStorage needs its own in-memory mock or useSettingsStore's persist middleware
// throws "NativeModule: AsyncStorage is null" at import time.
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

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  AndroidImportance: { HIGH: 4 },
  AndroidAudioUsage: { ALARM: 4 },
  AndroidAudioContentType: { SONIFICATION: 4 },
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
}));

jest.mock('expo-background-fetch', () => ({
  registerTaskAsync: jest.fn().mockResolvedValue(undefined),
  BackgroundFetchResult: { NewData: 1 },
}));

jest.mock('react-native-android-widget', () => ({
  requestWidgetUpdate: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../widgets/widgetTaskHandler', () => ({
  renderCurrentNextPrayerWidget: jest.fn(),
}));

// jest-expo runs with Platform.OS === 'ios', so refreshHomeScreenWidget takes the iOS
// branch and dynamically imports the WidgetKit writer (which pulls @bacons/apple-targets'
// native ExtensionStorage). Mock it defensively — the widget refresh is best-effort and
// irrelevant to the scheduling assertions here.
jest.mock('../../../features/home-widget/iosWidgetWriter', () => ({
  refreshIosHomeWidget: jest.fn().mockResolvedValue(undefined),
}));

// The i18n module pulls in expo-localization + react-native-mmkv + 21 bundled locale
// catalogs at import time, none of which are relevant to this service's scheduling
// logic (only `t()` is used, for notification title/body strings). Mock it to a plain
// passthrough so tests don't need the full i18n native-module chain.
jest.mock('../../../i18n', () => ({
  t: (key: string, options?: Record<string, unknown>) => {
    if (!options) return key;
    return Object.entries(options).reduce(
      (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
      key,
    );
  },
}));

// New York City — known coordinates, EST/EDT via IANA name (resolveTimezoneOffset handles DST).
const NYC_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
  city: 'New York',
  country: 'United States',
  timezone: 'America/New_York',
};

function resetSettingsToDefaultsWithLocation() {
  useSettingsStore.setState({
    ...useSettingsStore.getInitialState(),
    location: NYC_LOCATION,
    notificationsEnabled: true,
    method: 'MWL',
    madhab: 'Shafi',
    highLatRule: 'NightMiddle',
  });
}

describe('schedulePrayerNotifications', () => {
  // Freeze "now" just after local midnight of the base day. The service renders
  // computed prayer times onto the HOST-LOCAL clock (hoursToDate uses setHours),
  // so the anchor must be host-tz-independent: the local-tz Date constructor puts
  // "now" before day-0's Fajr in EVERY host timezone (a UTC-constructed instant
  // passed locally but filtered day-0 Fajr away on UTC CI runners).
  const FIXED_NOW = new Date(2026, 0, 15, 0, 5, 0);

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(FIXED_NOW);
    jest.clearAllMocks();
    resetSettingsToDefaultsWithLocation();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('schedules a notification for each enabled prayer across the 3-day window (default: 5 prayers x 3 days, iqamah off)', async () => {
    await schedulePrayerNotifications();

    // Default settings: all 5 notifiable prayers enabled, iqamah off for all -> exactly
    // 5 adhan-kind notifications per day x 3 days = 15 (no iqamah rows since offset=0).
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(15);
  });

  it('adds iqamah reminder rows only when offset>0, at prayer time + offset minutes', async () => {
    useSettingsStore.setState({
      iqamahOffsetMinutes: {
        Fajr: 15, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0,
      },
    });

    await schedulePrayerNotifications();

    // 5 adhan rows/day x 3 days = 15, plus 1 iqamah row/day (Fajr only) x 3 days = 3 -> 18 total.
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(18);

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const iqamahCalls = calls.filter(
      ([args]) => (args.content.data as { prayerName: PrayerName }).prayerName === 'Fajr'
        && String(args.content.title).toLowerCase().includes('iqamah'),
    );
    expect(iqamahCalls).toHaveLength(3);

    // Iqamah trigger must be prayer-time + 15 minutes, never the adhan sound/channel.
    for (const [args] of iqamahCalls) {
      const adhanCall = calls.find(
        ([c]) => (c.content.data as { prayerName: PrayerName; timestamp: number }).prayerName === 'Fajr'
          && (c.content.data as { timestamp: number }).timestamp === (args.content.data as { timestamp: number }).timestamp
          && !String(c.content.title).toLowerCase().includes('iqamah'),
      );
      expect(adhanCall).toBeDefined();
      const [adhanArgs] = adhanCall!;
      const prayerTimestamp = (adhanArgs.content.data as { timestamp: number }).timestamp;
      const iqamahTriggerDate = (args.trigger as { date: Date }).date;
      expect(iqamahTriggerDate.getTime() - prayerTimestamp).toBe(15 * 60_000);
      expect(args.content.sound).toBe('default');
    }
  });

  it('uses the adhan sound + adhan channel only for kind=adhan, advance<=0, with the per-prayer toggle on', async () => {
    useSettingsStore.setState({
      notificationAdvanceMinutes: {
        Fajr: 0, Sunrise: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0,
      },
      perPrayerAdhanEnabled: {
        Fajr: true, Sunrise: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false,
      },
    });

    await schedulePrayerNotifications();

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    const fajrCalls = calls.filter(
      ([args]) => (args.content.data as { prayerName: PrayerName }).prayerName === 'Fajr',
    );
    const dhuhrCalls = calls.filter(
      ([args]) => (args.content.data as { prayerName: PrayerName }).prayerName === 'Dhuhr',
    );

    expect(fajrCalls).toHaveLength(3); // 3 days, adhan enabled + advance<=0
    for (const [args] of fajrCalls) {
      expect(args.content.sound).toBe('adhan_takbir.wav');
      expect(args.trigger.channelId).toBe('prayer-alarms-adhan');
    }

    expect(dhuhrCalls).toHaveLength(3); // toggle off -> default sound/channel
    for (const [args] of dhuhrCalls) {
      expect(args.content.sound).toBe('default');
      expect(args.trigger.channelId).toBe('prayer-alarms');
    }
  });

  it('does not use the adhan sound when advance minutes > 0, even with the toggle on (early reminder keeps the default chime)', async () => {
    useSettingsStore.setState({
      notificationAdvanceMinutes: {
        Fajr: 10, Sunrise: 0, Dhuhr: 5, Asr: 5, Maghrib: 5, Isha: 5,
      },
      perPrayerAdhanEnabled: {
        Fajr: true, Sunrise: false, Dhuhr: true, Asr: true, Maghrib: true, Isha: true,
      },
    });

    await schedulePrayerNotifications();

    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    for (const [args] of calls) {
      expect(args.content.sound).toBe('default');
      expect(args.trigger.channelId).toBe('prayer-alarms');
    }
  });

  it('filters out prayers whose trigger time has already passed today', async () => {
    // Push "now" to just before LOCAL midnight so day 0's prayers (Fajr..Isha, all
    // earlier that local day) are all in the past -> only days 1 and 2 contribute,
    // i.e. fewer than the full 15 (5 x 3) adhan rows. Local-tz constructor keeps
    // this meaning identical on every host timezone (see FIXED_NOW note above).
    jest.setSystemTime(new Date(2026, 0, 15, 23, 50, 0));

    await schedulePrayerNotifications();

    const totalCalls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.length;
    expect(totalCalls).toBeLessThan(15);
    expect(totalCalls).toBeGreaterThan(0);
  });

  it('only schedules prayers enabled in perPrayerNotificationEnabled', async () => {
    useSettingsStore.setState({
      perPrayerNotificationEnabled: {
        Fajr: true, Sunrise: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false,
      },
    });

    await schedulePrayerNotifications();

    // Only Fajr enabled -> 1 adhan row/day x 3 days = 3.
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    const calls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    for (const [args] of calls) {
      expect((args.content.data as { prayerName: PrayerName }).prayerName).toBe('Fajr');
    }
  });

  it('cancels all previously-scheduled notifications before scheduling new ones (idempotent reschedule)', async () => {
    await schedulePrayerNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});
