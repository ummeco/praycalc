/**
 * Purpose: Regression tests for the masjid-mute haversine distance + in-zone
 *   detection math — the core correctness of geofence enforcement depends on this.
 */

import { distanceMeters, isInsideZone } from '../lib/geo';

describe('distanceMeters', () => {
  it('returns ~0 for identical coordinates', () => {
    expect(distanceMeters(21.4225, 39.8262, 21.4225, 39.8262)).toBeCloseTo(0, 3);
  });

  it('matches a known reference distance (Masjid al-Haram to Masjid Nabawi, ~339km great-circle)', () => {
    // Makkah (Masjid al-Haram) to Madinah (Masjid an-Nabawi) — great-circle distance,
    // not driving distance (which is longer, ~450km via highway).
    const km = distanceMeters(21.4225, 39.8262, 24.4672, 39.6024) / 1000;
    expect(km).toBeGreaterThan(330);
    expect(km).toBeLessThan(350);
  });

  it('is symmetric (A to B equals B to A)', () => {
    const ab = distanceMeters(21.4225, 39.8262, 24.4672, 39.6024);
    const ba = distanceMeters(24.4672, 39.6024, 21.4225, 39.8262);
    expect(ab).toBeCloseTo(ba, 6);
  });

  it('computes a small, precise distance (~111m for 0.001 degree latitude)', () => {
    const meters = distanceMeters(21.4225, 39.8262, 21.4235, 39.8262);
    // 1 degree of latitude is ~111.32km, so 0.001 degree is ~111.32m
    expect(meters).toBeGreaterThan(100);
    expect(meters).toBeLessThan(120);
  });
});

describe('isInsideZone', () => {
  const zoneLat = 21.4225;
  const zoneLng = 39.8262;
  const radius = 100;

  it('returns true for the exact zone center', () => {
    expect(isInsideZone(zoneLat, zoneLng, zoneLat, zoneLng, radius)).toBe(true);
  });

  it('returns true for a point well within the radius', () => {
    // ~50m north
    expect(isInsideZone(21.42295, zoneLng, zoneLat, zoneLng, radius)).toBe(true);
  });

  it('returns false for a point well outside the radius', () => {
    // ~1km north — far outside a 100m zone
    expect(isInsideZone(21.4315, zoneLng, zoneLat, zoneLng, radius)).toBe(false);
  });

  it('is inclusive at the exact boundary', () => {
    // Construct a point at exactly `radius` meters away by using distanceMeters itself
    // to validate the boundary condition numerically rather than assume a fixed offset.
    const justInside = distanceMeters(zoneLat, zoneLng, 21.42315, zoneLng);
    const result = isInsideZone(21.42315, zoneLng, zoneLat, zoneLng, justInside);
    expect(result).toBe(true); // radius == distance should be inclusive (<=)
  });
});
