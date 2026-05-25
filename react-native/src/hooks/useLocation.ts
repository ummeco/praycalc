/**
 * Purpose: React hook for requesting and watching device location.
 * Inputs: none (reads from device GPS)
 * Outputs: { location, loading, error, refresh }
 * Constraints: Calls requestLocationPermission() on mount.
 *   Does not set up continuous watch — uses one-shot getCurrentLocation().
 *   Persists last-known location to AsyncStorage for offline use.
 * SPORT: hooks/useLocation.ts
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestLocationPermission, getCurrentLocation } from '../lib/location';
import type { UserLocation } from '../types';

const LOCATION_CACHE_KEY = '@praycalc/last_location';

interface UseLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await requestLocationPermission();
      const loc = await getCurrentLocation();
      setLocation(loc);
      // Cache for offline/cold-start use.
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(loc));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get location.';
      setError(msg);
      // Try loading cached location as fallback.
      try {
        const raw = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
        if (raw) setLocation(JSON.parse(raw) as UserLocation);
      } catch {
        // No cache — leave location null.
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load cached location immediately for faster initial render.
    AsyncStorage.getItem(LOCATION_CACHE_KEY).then((raw) => {
      if (raw) setLocation(JSON.parse(raw) as UserLocation);
    }).catch(() => {});

    fetchLocation();
  }, [fetchLocation]);

  return { location, loading, error, refresh: fetchLocation };
}
