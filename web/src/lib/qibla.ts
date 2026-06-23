/**
 * qibla.ts — Qibla direction utilities.
 *
 * PURPOSE: Pure math for Qibla bearing calculation.
 *   Safe for client islands (no external deps).
 * INPUTS: lat/lng coordinates
 * OUTPUTS: bearing in degrees, compass abbreviation
 * CONSTRAINTS: No server-only imports
 * REF: P2-E3-W02-S02-T03
 */

/** Exact center of the Ka'bah, Masjid al-Haram, Mecca */
export const KAABA_LAT = 21.422511;
export const KAABA_LNG = 39.826150;

const toRad = (d: number) => (d * Math.PI) / 180;

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
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(bearing / 45) % 8] ?? 'N';
}
