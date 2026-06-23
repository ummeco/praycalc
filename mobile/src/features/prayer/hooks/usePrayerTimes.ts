/**
 * Purpose: Hook to calculate and return daily prayer times for given coords/date/method.
 *   Also provides next-prayer countdown (refreshed every second).
 * Inputs: date, coords (lat/lng), method key, madhab, timezone offset
 * Outputs: { times, nextPrayer, secondsToNextPrayer, loading, error }
 * Constraints: Must call calculatePrayerTimes (not hardcode). Countdown ticks every 1s.
 *   Returns all 7 UI states via status field.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-usePrayerTimes
 */

import { useState, useEffect, useCallback } from 'react';
import type { PrayerTimes, PrayerName } from '../../../types/prayer';
import type { CalcMethodKey } from '../../../constants/methods';
import type { Madhab } from '../../../types/prayer';
import { calculatePrayerTimes } from '../../../lib/prayer-calc';

export type PrayerTimesStatus =
  | 'loading'
  | 'success'
  | 'empty'
  | 'error'
  | 'offline'
  | 'permission-denied'
  | 'skeleton';

interface UsePrayerTimesResult {
  times: PrayerTimes | null;
  nextPrayer: PrayerName | null;
  secondsToNextPrayer: number;
  status: PrayerTimesStatus;
  error: string | null;
  refresh: () => void;
}

interface UsePrayerTimesOptions {
  date: Date;
  latitude: number | null;
  longitude: number | null;
  timezone: number;
  method: CalcMethodKey;
  madhab: Madhab;
  isOffline?: boolean;
  isPermissionDenied?: boolean;
}

export function usePrayerTimes({
  date,
  latitude,
  longitude,
  timezone,
  method,
  madhab,
  isOffline = false,
  isPermissionDenied = false,
}: UsePrayerTimesOptions): UsePrayerTimesResult {
  const [times, setTimes] = useState<PrayerTimes | null>(null);
  const [status, setStatus] = useState<PrayerTimesStatus>('skeleton');
  const [error, setError] = useState<string | null>(null);
  const [secondsToNextPrayer, setSecondsToNextPrayer] = useState(0);
  const [nextPrayer, setNextPrayer] = useState<PrayerName | null>(null);
  const [tick, setTick] = useState(0);

  const computeNextPrayer = useCallback(
    (prayerTimes: PrayerTimes): { name: PrayerName; seconds: number } => {
      const now = new Date();
      const prayers: [PrayerName, Date][] = [
        ['Fajr', prayerTimes.Fajr],
        ['Sunrise', prayerTimes.Sunrise],
        ['Dhuhr', prayerTimes.Dhuhr],
        ['Asr', prayerTimes.Asr],
        ['Maghrib', prayerTimes.Maghrib],
        ['Isha', prayerTimes.Isha],
      ];

      for (const [name, time] of prayers) {
        const diff = (time.getTime() - now.getTime()) / 1000;
        if (diff > 0) {
          return { name, seconds: Math.floor(diff) };
        }
      }

      // All prayers passed — next is Fajr tomorrow
      const tomorrow = new Date(prayerTimes.Fajr);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const diff = (tomorrow.getTime() - now.getTime()) / 1000;
      return { name: 'Fajr', seconds: Math.floor(diff) };
    },
    [],
  );

  // Calculate prayer times
  const calculate = useCallback(() => {
    if (isPermissionDenied) {
      setStatus('permission-denied');
      return;
    }
    if (isOffline && !times) {
      setStatus('offline');
      return;
    }
    if (latitude === null || longitude === null) {
      setStatus('empty');
      return;
    }

    setStatus('loading');
    try {
      const calculated = calculatePrayerTimes(
        date,
        latitude,
        longitude,
        timezone,
        method,
        madhab,
      );
      setTimes(calculated);
      setError(null);
      const { name, seconds } = computeNextPrayer(calculated);
      setNextPrayer(name);
      setSecondsToNextPrayer(seconds);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error');
      setStatus('error');
    }
  }, [date, latitude, longitude, timezone, method, madhab, isOffline, isPermissionDenied]);

  // Recalculate on inputs change
  useEffect(() => {
    calculate();
  }, [calculate]);

  // Countdown tick every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown on each tick
  useEffect(() => {
    if (times) {
      const { name, seconds } = computeNextPrayer(times);
      setNextPrayer(name);
      setSecondsToNextPrayer(seconds);
    }
  }, [tick, times, computeNextPrayer]);

  return { times, nextPrayer, secondsToNextPrayer, status, error, refresh: calculate };
}
