/**
 * Purpose: Compute and auto-refresh daily prayer times from a UserLocation.
 * Inputs: UserLocation (lat, lng, utcOffsetHours), CalcSettings
 * Outputs: { times, loading, error } — refreshes at midnight and on location change
 * Constraints: Recomputes on date change (midnight tick). Timer cleared on unmount.
 *   Returns null while location is unavailable.
 * SPORT: hooks/usePrayerTimes.ts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computePrayerTimes } from '../lib/prayCalc';
import type { UserLocation, DailyPrayerTimes, CalcSettings } from '../types';

const SETTINGS_KEY = '@praycalc/calc_settings';

const DEFAULT_SETTINGS: CalcSettings = {
  method: 'dynamic',
  asrMethod: 'shafii',
  use24h: false,
  darkMode: false,
  locale: null,
};

interface UsePrayerTimesResult {
  times: DailyPrayerTimes | null;
  settings: CalcSettings;
  updateSettings: (patch: Partial<CalcSettings>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function usePrayerTimes(location: UserLocation | null): UsePrayerTimesResult {
  const [times, setTimes] = useState<DailyPrayerTimes | null>(null);
  const [settings, setSettings] = useState<CalcSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted settings on mount.
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        } catch {}
      }
    }).catch(() => {});
  }, []);

  const compute = useCallback(() => {
    if (!location) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = computePrayerTimes(
        location.lat,
        location.lng,
        location.utcOffsetHours,
        new Date(),
        { asrMethod: settings.asrMethod, use24h: settings.use24h },
      );
      setTimes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute prayer times.');
    } finally {
      setLoading(false);
    }
  }, [location, settings.asrMethod, settings.use24h]);

  // Recompute whenever location or settings change.
  useEffect(() => {
    compute();
  }, [compute]);

  // Schedule recompute at local midnight.
  useEffect(() => {
    const scheduleNextMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight.getTime() - now.getTime();
      midnightTimerRef.current = setTimeout(() => {
        compute();
        scheduleNextMidnight();
      }, msUntilMidnight);
    };
    scheduleNextMidnight();
    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  }, [compute]);

  const updateSettings = useCallback(async (patch: Partial<CalcSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, [settings]);

  return { times, settings, updateSettings, loading, error };
}
