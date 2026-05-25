/**
 * Purpose: Location resolution using Expo Location API.
 * Inputs: n/a (reads device GPS)
 * Outputs: UserLocation with lat, lng, timezone, cityName, utcOffsetHours
 * Constraints: Requires expo-location permission granted before call.
 *   Timezone is derived from device locale (Intl) since RN has no geocoding
 *   for timezone out of the box.
 * SPORT: lib/location.ts
 */

import * as ExpoLocation from 'expo-location';
import type { UserLocation } from '../types';

/** Request location permission and return current position. Throws if denied. */
export async function requestLocationPermission(): Promise<void> {
  const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied. Please enable location access in Settings.');
  }
}

/** Get current device coordinates. Assumes permission already granted. */
export async function getCurrentLocation(): Promise<UserLocation> {
  const position = await ExpoLocation.getCurrentPositionAsync({
    accuracy: ExpoLocation.Accuracy.Balanced,
  });

  const { latitude: lat, longitude: lng } = position.coords;

  // Reverse-geocode for human-readable city name.
  let cityName = 'Current Location';
  try {
    const [geo] = await ExpoLocation.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    cityName = geo.city ?? geo.region ?? geo.country ?? 'Current Location';
  } catch {
    // Non-fatal — fall back to generic label.
  }

  // Derive timezone from device Intl (accurate for the device's configured location).
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const utcOffsetHours = -(new Date().getTimezoneOffset() / 60);

  return { lat, lng, timezone, cityName, utcOffsetHours };
}
