/**
 * Qibla direction utilities — pure math, no external deps.
 * The Ka'bah center coordinates are sourced from verified GPS data.
 */

/** Exact center of the Ka'bah (Ka'ba), Masjid al-Haram, Mecca */
export const KAABA_LAT = 21.422511;
export const KAABA_LNG = 39.826150;

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Qibla bearing in degrees clockwise from north (0°=N, 90°=E, 180°=S, 270°=W) */
export function qiblaAngle(lat: number, lng: number): number {
  const φ1 = toRad(lat), λ1 = toRad(lng);
  const φ2 = toRad(KAABA_LAT), λ2 = toRad(KAABA_LNG);
  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** 8-point compass abbreviation for a bearing */
export function compassDir(bearing: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(bearing / 45) % 8];
}

/** Full compass direction name for a bearing */
export function compassName(bearing: number): string {
  const names = [
    "North", "Northeast", "East", "Southeast",
    "South", "Southwest", "West", "Northwest",
  ];
  return names[Math.round(bearing / 45) % 8];
}

/**
 * Intermediate waypoints on the great circle from [lat1, lng1] to the Ka'bah.
 * Returns array of [lat, lng] pairs in degrees.
 */
export function qiblaGreatCircle(
  lat1: number,
  lng1: number,
  steps = 120,
): [number, number][] {
  const φ1 = toRad(lat1), λ1 = toRad(lng1);
  const φ2 = toRad(KAABA_LAT), λ2 = toRad(KAABA_LNG);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((φ2 - φ1) / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
      ),
    );

  if (d === 0) return [[lat1, lng1]];

  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x =
      A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y =
      A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    points.push([
      toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))),
      toDeg(Math.atan2(y, x)),
    ]);
  }
  return points;
}

/** Haversine distance in km between two coordinate pairs */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
