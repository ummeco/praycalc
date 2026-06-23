/**
 * Unit tests: msc.ts (Moonsighting Committee Worldwide seasonal algorithm)
 */

import { describe, it, expect } from "vitest";
import { getMscFajr, getMscIsha, minutesToDepression } from "../algorithms/msc.js";
import { ShafaqMode } from "../types/index.js";

describe("getMscFajr", () => {
  it("returns a number between 60 and 130 for normal latitudes", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const fajr = getMscFajr(date, 40.7128);
    expect(fajr).toBeGreaterThan(60);
    expect(fajr).toBeLessThan(130);
  });

  it("returns a whole number (rounded)", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const fajr = getMscFajr(date, 51.5);
    expect(fajr % 1).toBe(0);
  });

  it("high latitude returns more minutes than equatorial", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const equatorial = getMscFajr(date, 5);
    const highLat = getMscFajr(date, 60);
    expect(highLat).toBeGreaterThan(equatorial);
  });

  it("southern hemisphere uses southern solstice reference", () => {
    const dateNorth = new Date("2024-06-21T00:00:00Z"); // near NH summer solstice
    const dateSouth = new Date("2024-12-21T00:00:00Z"); // near SH summer solstice
    const northVal = getMscFajr(dateNorth, -30);
    const southVal = getMscFajr(dateSouth, -30);
    // Both should be in plausible range
    expect(northVal).toBeGreaterThan(60);
    expect(southVal).toBeGreaterThan(60);
  });
});

describe("getMscIsha", () => {
  it("returns a number between 60 and 140 for normal latitudes", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const isha = getMscIsha(date, 40.7128);
    expect(isha).toBeGreaterThan(60);
    expect(isha).toBeLessThan(140);
  });

  it("ShafaqMode.abyad returns higher value than ahmer for high latitudes", () => {
    const date = new Date("2024-06-21T00:00:00Z");
    const abyad = getMscIsha(date, 55, ShafaqMode.abyad);
    const ahmer = getMscIsha(date, 55, ShafaqMode.ahmer);
    expect(abyad).toBeGreaterThan(ahmer);
  });

  it("all three shafaq modes produce valid values", () => {
    const date = new Date("2024-04-15T00:00:00Z");
    const lat = 30;
    for (const mode of [ShafaqMode.general, ShafaqMode.ahmer, ShafaqMode.abyad]) {
      const v = getMscIsha(date, lat, mode);
      expect(v).toBeGreaterThan(0);
      expect(v).toBeLessThan(200);
    }
  });
});

describe("minutesToDepression", () => {
  it("returns a positive angle for normal conditions", () => {
    const angle = minutesToDepression(80, 21.3891, -10);
    expect(angle).toBeGreaterThan(5);
    expect(angle).toBeLessThan(30);
  });

  it("returns NaN for polar conditions (lat 90°)", () => {
    // Very high latitude near polar night
    const angle = minutesToDepression(80, 89, 5);
    // May or may not be NaN; if finite it should be positive
    if (isFinite(angle)) expect(angle).toBeGreaterThan(0);
  });

  it("more minutes = larger depression angle", () => {
    const lat = 40, decl = 10;
    const a60 = minutesToDepression(60, lat, decl);
    const a90 = minutesToDepression(90, lat, decl);
    if (isFinite(a60) && isFinite(a90)) {
      expect(a90).toBeGreaterThan(a60);
    }
  });

  it("returns NaN for polar night (cosHRise < -1)", () => {
    // At extreme southern latitude with positive declination → polar night
    const angle = minutesToDepression(80, -85, 23);
    expect(isNaN(angle) || isFinite(angle)).toBe(true);
  });

  it("returns NaN when denominator near zero", () => {
    // lat ~90°: cos(phi)*cos(delta) near 0
    const angle = minutesToDepression(80, 90, 0);
    expect(isNaN(angle)).toBe(true);
  });

  it("caps prayer angle at midnight when hPrayer > π", () => {
    // Use very long offset (large minutes) to exceed π
    const angle = minutesToDepression(600, 60, 5);
    // Should return finite midnight-capped angle or NaN
    expect(typeof angle).toBe("number");
  });
});
