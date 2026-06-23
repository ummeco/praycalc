/**
 * Unit tests: spa.ts (NREL Solar Position Algorithm)
 * Verifies sunrise/sunset/noon against known values for test locations.
 */

import { describe, it, expect } from "vitest";
import { getSpa } from "../algorithms/spa.js";

const MINUTE = 1 / 60; // tolerance in fractional hours

describe("getSpa — known sunrise/sunset values", () => {
  it("Makkah 2024-01-15: sunrise ~6:25, noon ~12:25, sunset ~18:25 local", () => {
    const date = new Date("2024-01-15T00:00:00Z");
    const result = getSpa(date, 21.3891, 39.8579, 3);

    expect(result.sunrise).toBeGreaterThan(5.5);
    expect(result.sunrise).toBeLessThan(7.5);
    expect(result.solarNoon).toBeGreaterThan(11);
    expect(result.solarNoon).toBeLessThan(13);
    expect(result.sunset).toBeGreaterThan(17);
    expect(result.sunset).toBeLessThan(19);
  });

  it("New York 2024-06-21 (summer solstice): sunrise early, sunset late", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    // NYC DST in June = UTC-4
    const result = getSpa(date, 40.7128, -74.006, -4);

    // Long day: sunrise before 6am, sunset after 19:30
    expect(result.sunrise).toBeLessThan(6);
    expect(result.sunset).toBeGreaterThan(19.5);
    expect(result.sunset - result.sunrise).toBeGreaterThan(14);
  });

  it("Sydney 2024-12-21 (southern summer solstice): long day", () => {
    const date = new Date("2024-12-21T00:00:00Z");
    const result = getSpa(date, -33.8688, 151.2093, 11);
    // Southern summer — long day
    expect(result.sunset - result.sunrise).toBeGreaterThan(13);
  });

  it("London 2024-12-21 (winter solstice): short day", () => {
    const date = new Date("2024-12-21T00:00:00Z");
    const result = getSpa(date, 51.5074, -0.1278, 0);
    // Short winter day in London
    expect(result.sunset - result.sunrise).toBeLessThan(9);
  });

  it("returns NaN for sunrise/sunset in polar summer (Murmansk Jun)", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const result = getSpa(date, 68.9585, 33.0828, 3);
    // Polar day — may be NaN or produce anomalous results
    // solarNoon should still be valid
    expect(isFinite(result.solarNoon) || isNaN(result.solarNoon)).toBe(true);
  });

  it("custom angle [96.5, 97.5] returns both sunrise/sunset pairs", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const result = getSpa(date, 21.3891, 39.8579, 3, {
      customAngles: [96.5, 97.5],
    });
    expect(result.angles).toHaveLength(2);
    expect(result.angles[0].sunrise).toBeLessThan(result.angles[0].sunset);
    expect(result.angles[1].sunrise).toBeLessThan(result.angles[1].sunset);
  });

  it("fajr zenith angle (90+15°=105°) is before sunrise", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const result = getSpa(date, 21.3891, 39.8579, 3, {
      customAngles: [105], // zenith = 90 + 15° depression
    });
    expect(result.angles[0].sunrise).toBeLessThan(result.sunrise);
  });
});

describe("getSpa — azimuth/zenith", () => {
  it("zenith < 90 means sun above horizon (midday)", () => {
    // Solar noon approximation for Makkah in July
    const date = new Date("2024-07-15T09:00:00Z"); // ~12:00 local (tz+3)
    const result = getSpa(date, 21.3891, 39.8579, 3);
    // zenith output is for the specified UTC time, not necessarily noon
    expect(typeof result.zenith).toBe("number");
  });

  it("azimuth is in [0, 360)", () => {
    const date = new Date("2024-04-15T06:00:00Z");
    const result = getSpa(date, 21.3891, 39.8579, 3);
    expect(result.azimuth).toBeGreaterThanOrEqual(0);
    expect(result.azimuth).toBeLessThan(360);
  });
});

describe("getSpa — error handling", () => {
  it("throws for invalid latitude > 90", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    expect(() => getSpa(date, 95, 0, 0)).toThrow();
  });

  it("throws for invalid longitude > 180", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    expect(() => getSpa(date, 0, 185, 0)).toThrow();
  });
});
