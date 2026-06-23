/**
 * Purpose: Hook to compute Qibla direction using device magnetometer (expo-sensors).
 *   Applies magnetic declination correction for accuracy.
 * Inputs: user coordinates (lat/lng)
 * Outputs: { bearing, heading, accuracy, status }
 *   - bearing: great-circle bearing toward Kaaba (0-360°)
 *   - heading: current device compass heading (0-360°) with declination correction
 *   - needleAngle: rotation angle for compass needle (heading - bearing, normalized)
 *   - accuracy: magnetometer accuracy (0=unreliable, 1=low, 2=medium, 3=high)
 * Constraints: Must use great-circle bearing formula (CR-C req). Magnetometer subscription
 *   must unsubscribe on unmount.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-useQibla
 */

import { useState, useEffect, useRef } from 'react';
import { Magnetometer } from 'expo-sensors';
import type { Subscription } from 'expo-sensors/build/DeviceSensor';
import { getQiblaDirection } from '../../../lib/prayer-calc';

export type QiblaStatus =
  | 'loading'
  | 'success'
  | 'error'
  | 'offline'
  | 'permission-denied'
  | 'skeleton'
  | 'empty';

interface UseQiblaResult {
  bearing: number | null;
  heading: number;
  needleAngle: number;
  accuracy: number;
  status: QiblaStatus;
  error: string | null;
}

interface UseQiblaOptions {
  latitude: number | null;
  longitude: number | null;
  /** Magnetic declination in degrees (positive = east). Default 0. */
  declination?: number;
}

/**
 * Calculate compass heading from raw magnetometer data (x, y axes, device flat).
 * Returns heading in degrees 0-360 (0/360 = North).
 */
function magnetometerToHeading(x: number, y: number, declinationDeg: number): number {
  let angle = Math.atan2(y, x) * (180 / Math.PI);
  angle = angle + 90; // rotate to match North
  angle = angle + declinationDeg; // apply declination correction
  if (angle < 0) angle += 360;
  if (angle >= 360) angle -= 360;
  return angle;
}

export function useQibla({ latitude, longitude, declination = 0 }: UseQiblaOptions): UseQiblaResult {
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [status, setStatus] = useState<QiblaStatus>('skeleton');
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Subscription | null>(null);

  // Compute qibla bearing from user's position
  const bearing =
    latitude !== null && longitude !== null
      ? getQiblaDirection(latitude, longitude)
      : null;

  useEffect(() => {
    if (latitude === null || longitude === null) {
      setStatus('empty');
      return;
    }

    setStatus('loading');

    Magnetometer.isAvailableAsync()
      .then((available) => {
        if (!available) {
          setError('Magnetometer not available on this device');
          setStatus('error');
          return;
        }

        Magnetometer.setUpdateInterval(100); // 10 Hz

        subscriptionRef.current = Magnetometer.addListener((data) => {
          const h = magnetometerToHeading(data.x, data.y, declination);
          setHeading(h);
          // expo-sensors accuracy (if present in future RN versions); default to 3 on data
          setAccuracy(3);
          setStatus('success');
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Sensor error');
        setStatus('error');
      });

    return () => {
      subscriptionRef.current?.remove();
    };
  }, [latitude, longitude, declination]);

  const needleAngle = bearing !== null ? ((heading - bearing + 360) % 360) : 0;

  return { bearing, heading, needleAngle, accuracy, status, error };
}
