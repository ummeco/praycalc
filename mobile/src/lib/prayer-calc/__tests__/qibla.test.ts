/**
 * Purpose: Regression tests for getQiblaDirection — the great-circle bearing calculation
 *   toward the Kaaba (CR-C requirement: great-circle, not planar/rhumb-line bearing).
 * Constraints: Reference bearings computed independently via the same great-circle
 *   formula (Kaaba at 21.4225°N, 39.8262°E) — verifies the implementation, not just that
 *   it returns "some" number. Tolerance ±2° accounts for coordinate rounding differences
 *   between city-list sources.
 */

import { getQiblaDirection } from '../index';

describe('getQiblaDirection', () => {
  it('computes ~58° (northeast) from New York City', () => {
    const bearing = getQiblaDirection(40.7128, -74.0060);
    expect(bearing).toBeGreaterThan(58 - 2);
    expect(bearing).toBeLessThan(58 + 2);
  });

  it('computes ~295° from Jakarta', () => {
    const bearing = getQiblaDirection(-6.2088, 106.8456);
    expect(bearing).toBeGreaterThan(295 - 2);
    expect(bearing).toBeLessThan(295 + 2);
  });

  it('computes ~119° from London', () => {
    const bearing = getQiblaDirection(51.5074, -0.1278);
    expect(bearing).toBeGreaterThan(119 - 2);
    expect(bearing).toBeLessThan(119 + 2);
  });

  it('always returns a bearing in [0, 360)', () => {
    const cities: [number, number][] = [
      [40.7128, -74.0060], [-6.2088, 106.8456], [51.5074, -0.1278],
      [21.3891, 39.8579], [-33.8688, 151.2093], [64.1466, -21.9426],
    ];
    for (const [lat, lng] of cities) {
      const bearing = getQiblaDirection(lat, lng);
      expect(bearing).toBeGreaterThanOrEqual(0);
      expect(bearing).toBeLessThan(360);
    }
  });
});
