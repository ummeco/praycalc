/**
 * Purpose: Compute Qibla direction and stream live compass heading via Expo Sensors.
 * Inputs: UserLocation (lat, lng)
 * Outputs: QiblaData with bearing, heading, rotated kaabaDeg, distance, directionLabel
 * Constraints: Magnetometer may be unavailable on simulators — heading returns -1.
 *   Subscription cleaned up on unmount. Bearing computed once from location;
 *   heading updates at ~4 Hz from the magnetometer.
 * SPORT: hooks/useQibla.ts
 */

import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import type { UserLocation, QiblaData } from '../types';

// Kaaba coordinates (centre of tawaf circumambulation point).
const MECCA_LAT = 21.42251;
const MECCA_LNG = 39.82616;
const MECCA_LAT_RAD = (MECCA_LAT * Math.PI) / 180;
const MECCA_LNG_RAD = (MECCA_LNG * Math.PI) / 180;

const COMPASS_ABBR = [
  'N','NNE','NE','ENE','E','ESE','SE','SSE',
  'S','SSW','SW','WSW','W','WNW','NW','NNW',
];

function qiblaBearing(lat: number, lng: number): number {
  const latR = (lat * Math.PI) / 180;
  const lngR = (lng * Math.PI) / 180;
  const dLng = MECCA_LNG_RAD - lngR;
  const y = Math.sin(dLng) * Math.cos(MECCA_LAT_RAD);
  const x =
    Math.cos(latR) * Math.sin(MECCA_LAT_RAD) -
    Math.sin(latR) * Math.cos(MECCA_LAT_RAD) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const la1 = (lat1 * Math.PI) / 180;
  const la2 = (lat2 * Math.PI) / 180;
  const dLat = la2 - la1;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(la1) * Math.cos(la2) * Math.pow(Math.sin(dLng / 2), 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function compassAbbr(bearing: number): string {
  const idx = Math.round(bearing / 22.5) % 16;
  return COMPASS_ABBR[idx];
}

/** Derive compass heading (0–360) from raw magnetometer x/y values. */
function headingFromMagnetometer(x: number, y: number): number {
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export function useQibla(location: UserLocation | null): QiblaData | null {
  const [qibla, setQibla] = useState<QiblaData | null>(null);
  const headingRef = useRef(-1);

  useEffect(() => {
    if (!location) return;

    const bearing = qiblaBearing(location.lat, location.lng);
    const dist = distanceKm(location.lat, location.lng, MECCA_LAT, MECCA_LNG);

    const update = (heading: number) => {
      headingRef.current = heading;
      const kaabaDeg = (bearing - heading + 360) % 360;
      setQibla({
        bearingDeg: bearing,
        compassHeading: heading,
        kaabaDeg,
        distanceKm: dist,
        directionLabel: compassAbbr(bearing),
      });
    };

    // Initial render without sensor (heading = -1).
    update(-1);

    Magnetometer.setUpdateInterval(250);
    const sub = Magnetometer.addListener(({ x, y }) => {
      const heading = headingFromMagnetometer(x, y);
      update(heading);
    });

    return () => sub.remove();
  }, [location]);

  return qibla;
}
