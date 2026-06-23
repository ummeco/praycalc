/**
 * Unit tests: solar-ephemeris.ts
 * Tests NREL SPA reference data + atmospheric refraction.
 */

import { describe, it, expect } from "vitest";
import { toJulianDate, solarEphemeris, atmosphericRefraction, clamp, solarVerticalSpeed } from "../algorithms/solar-ephemeris.js";

describe("toJulianDate", () => {
  it("J2000.0 epoch: 2000-01-01 12:00:00 UTC → 2451545.0", () => {
    const date = new Date("2000-01-01T12:00:00Z");
    expect(toJulianDate(date)).toBeCloseTo(2451545.0, 4);
  });

  it("Unix epoch: 1970-01-01 00:00:00 UTC → 2440587.5", () => {
    const date = new Date(0);
    expect(toJulianDate(date)).toBeCloseTo(2440587.5, 4);
  });
});

describe("solarEphemeris", () => {
  it("J2000.0: declination near -23.07° (winter solstice proximity)", () => {
    const jd = toJulianDate(new Date("1999-12-22T12:00:00Z")); // near solstice
    const eph = solarEphemeris(jd);
    expect(eph.decl).toBeGreaterThan(-24);
    expect(eph.decl).toBeLessThan(-22);
  });

  it("J2000.0 at equinox: declination near 0°", () => {
    const jd = toJulianDate(new Date("2000-03-20T12:00:00Z")); // spring equinox
    const eph = solarEphemeris(jd);
    expect(Math.abs(eph.decl)).toBeLessThan(3);
  });

  it("Earth-Sun distance is near 1 AU", () => {
    const jd = toJulianDate(new Date("2024-04-01T12:00:00Z"));
    const eph = solarEphemeris(jd);
    expect(eph.r).toBeGreaterThan(0.98);
    expect(eph.r).toBeLessThan(1.02);
  });

  it("eclLon is in [0, 2π)", () => {
    const dates = [
      "2024-01-15", "2024-04-15", "2024-07-15", "2024-10-15",
    ];
    for (const d of dates) {
      const jd = toJulianDate(new Date(`${d}T12:00:00Z`));
      const eph = solarEphemeris(jd);
      expect(eph.eclLon).toBeGreaterThanOrEqual(0);
      expect(eph.eclLon).toBeLessThan(2 * Math.PI);
    }
  });

  it("summer solstice: declination near +23.4°", () => {
    const jd = toJulianDate(new Date("2024-06-21T12:00:00Z"));
    const eph = solarEphemeris(jd);
    expect(eph.decl).toBeGreaterThan(22);
    expect(eph.decl).toBeLessThan(25);
  });
});

describe("atmosphericRefraction", () => {
  it("returns 0 for altitude below -1°", () => {
    expect(atmosphericRefraction(-2)).toBe(0);
    expect(atmosphericRefraction(-10)).toBe(0);
  });

  it("returns positive correction for altitude 0°", () => {
    const r = atmosphericRefraction(0);
    expect(r).toBeGreaterThan(0);
    expect(r).toBeLessThan(1); // reasonable upper bound in degrees
  });

  it("correction decreases as altitude increases", () => {
    const r0 = atmosphericRefraction(0);
    const r10 = atmosphericRefraction(10);
    const r45 = atmosphericRefraction(45);
    expect(r0).toBeGreaterThan(r10);
    expect(r10).toBeGreaterThan(r45);
  });

  it("scales with pressure", () => {
    const low = atmosphericRefraction(5, 800);
    const high = atmosphericRefraction(5, 1100);
    expect(high).toBeGreaterThan(low);
  });

  it("scales inversely with temperature", () => {
    const cold = atmosphericRefraction(5, 1013.25, 0);
    const warm = atmosphericRefraction(5, 1013.25, 30);
    expect(cold).toBeGreaterThan(warm);
  });
});

describe("clamp", () => {
  it("clamps below min", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("clamps above max", () => expect(clamp(15, 0, 10)).toBe(10));
  it("passes through within range", () => expect(clamp(5, 0, 10)).toBe(5));
});

describe("solarVerticalSpeed", () => {
  it("returns positive value for non-zero components", () => {
    const speed = solarVerticalSpeed(0.7, 0.3, 0.5);
    expect(speed).toBeGreaterThan(0);
  });

  it("returns 0 when sin(hAngle)=0 (h=0)", () => {
    const speed = solarVerticalSpeed(0.7, 0.3, 0);
    expect(speed).toBe(0);
  });
});
