/**
 * Purpose: Manage notification permission and scheduling lifecycle.
 * Inputs: DailyPrayerTimes, persisted NotifSettings from AsyncStorage
 * Outputs: { settings, updateSettings, permissionGranted, requestPermission }
 * Constraints: Schedules are re-applied whenever prayer times or settings change.
 *   AsyncStorage key is '@praycalc/notif_settings'. Uses lib/notifications.ts.
 * SPORT: hooks/useNotifications.ts
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestNotificationPermission,
  schedulePrayerNotifications,
} from '../lib/notifications';
import type { DailyPrayerTimes, NotifSettings, PrayerName } from '../types';

const NOTIF_SETTINGS_KEY = '@praycalc/notif_settings';

const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Qiyam'];

function defaultNotifSettings(): NotifSettings {
  const prayers = Object.fromEntries(
    PRAYER_NAMES.map((name) => [
      name,
      {
        prayerName: name,
        enabled: name !== 'Sunrise' && name !== 'Qiyam',
        triggers: ['at_adhan' as const],
        soundEnabled: true,
      },
    ]),
  ) as NotifSettings['prayers'];
  return { globalEnabled: true, prayers };
}

interface UseNotificationsResult {
  settings: NotifSettings;
  updateSettings: (patch: Partial<NotifSettings>) => Promise<void>;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
}

export function useNotifications(times: DailyPrayerTimes | null): UseNotificationsResult {
  const [settings, setSettings] = useState<NotifSettings>(defaultNotifSettings());
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Load persisted settings.
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...defaultNotifSettings(), ...JSON.parse(raw) });
        } catch {}
      }
    }).catch(() => {});
  }, []);

  // Re-schedule whenever prayer times or settings change.
  useEffect(() => {
    if (!times || !permissionGranted) return;
    schedulePrayerNotifications(times, settings).catch(console.warn);
  }, [times, settings, permissionGranted]);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
  }, []);

  const updateSettings = useCallback(async (patch: Partial<NotifSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(NOTIF_SETTINGS_KEY, JSON.stringify(next));
  }, [settings]);

  return { settings, updateSettings, permissionGranted, requestPermission };
}
