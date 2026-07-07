/**
 * Purpose: Pure geo math for masjid-mute — haversine distance + in-zone detection.
 *   Deliberately independent of src/lib/mosques/overpass.ts's own haversine
 *   implementation (same rationale: no cross-feature coupling for a two-line formula)
 *   and of the qibla feature's great-circle bearing math.
 * Inputs: Two lat/lng points (decimal degrees), a zone radius in meters.
 * Outputs: distanceMeters(), isInsideZone().
 * Constraints: Pure functions, no side effects, no native module imports — must be
 *   safely importable from both the geofence TaskManager callback and unit tests.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-masjid-mute-geo
 */

const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance between two points in meters (haversine formula). */
export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/** True if the given point is within radiusMeters of the zone center (inclusive). */
export function isInsideZone(
  pointLat: number,
  pointLng: number,
  zoneLat: number,
  zoneLng: number,
  radiusMeters: number,
): boolean {
  return distanceMeters(pointLat, pointLng, zoneLat, zoneLng) <= radiusMeters;
}
