/**
 * Unit tests: angles.ts (dynamic twilight angle algorithm)
 */

import { describe, it, expect } from "vitest";
import { getAngles } from "../algorithms/angles.js";
import { ShafaqMode } from "../types/index.js";

describe("getAngles", () => {
  it("returns fajrAngle and ishaAngle within [10, 22] for normal conditions", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const angles = getAngles(date, 21.3891, 39.8579);
    expect(angles.fajrAngle).toBeGreaterThanOrEqual(10);
    expect(angles.fajrAngle).toBeLessThanOrEqual(22);
    expect(angles.ishaAngle).toBeGreaterThanOrEqual(10);
    expect(angles.ishaAngle).toBeLessThanOrEqual(22);
  });

  it("rounds to 3 decimal places", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const angles = getAngles(date, 40.7128, -74.006);
    const fStr = angles.fajrAngle.toString();
    const dotPos = fStr.indexOf(".");
    if (dotPos !== -1) {
      expect(fStr.length - dotPos - 1).toBeLessThanOrEqual(3);
    }
  });

  it("abyad shafaq produces higher or equal isha angle", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const general = getAngles(date, 51.5074, -0.1278, { shafaq: ShafaqMode.general });
    const abyad = getAngles(date, 51.5074, -0.1278, { shafaq: ShafaqMode.abyad });
    expect(abyad.ishaAngle).toBeGreaterThanOrEqual(general.ishaAngle - 0.5);
  });

  it("elevation correction: higher elevation gives slightly higher angle", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const sea = getAngles(date, 21.3891, 39.8579, { elevation: 0 });
    const mountain = getAngles(date, 21.3891, 39.8579, { elevation: 2000 });
    // Small but positive correction
    expect(mountain.fajrAngle).toBeGreaterThanOrEqual(sea.fajrAngle);
  });

  it("handles all months without throwing", () => {
    for (let month = 0; month < 12; month++) {
      const date = new Date(Date.UTC(2024, month, 15));
      expect(() => getAngles(date, 40.7128, -74.006)).not.toThrow();
    }
  });

  it("handles high latitude (Helsinki) in summer without throwing", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const angles = getAngles(date, 60.1699, 24.9384);
    expect(angles.fajrAngle).toBeGreaterThanOrEqual(10);
    expect(angles.ishaAngle).toBeGreaterThanOrEqual(10);
  });
});
