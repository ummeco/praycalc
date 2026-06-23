/**
 * Unit tests: get-times.ts (main prayer times computation)
 */

import { describe, it, expect } from "vitest";
import { getTimes, formatTime } from "../algorithms/get-times.js";
import { AsrConvention, HighLatitudeRule, ShafaqMode } from "../types/index.js";

const MINUTE = 1 / 60;

describe("getTimes — Makkah", () => {
  const base = {
    date: new Date("2024-04-15T00:00:00Z"),
    lat: 21.3891,
    lng: 39.8579,
    tz: 3,
  };

  it("returns all prayer times as finite numbers", () => {
    const times = getTimes(base);
    expect(isFinite(times.fajr)).toBe(true);
    expect(isFinite(times.sunrise)).toBe(true);
    expect(isFinite(times.dhuhr)).toBe(true);
    expect(isFinite(times.asr)).toBe(true);
    expect(isFinite(times.maghrib)).toBe(true);
    expect(isFinite(times.isha)).toBe(true);
  });

  it("prayer time ordering: fajr < sunrise < dhuhr < asr < maghrib < isha", () => {
    const t = getTimes(base);
    expect(t.fajr).toBeLessThan(t.sunrise);
    expect(t.sunrise).toBeLessThan(t.dhuhr);
    expect(t.dhuhr).toBeLessThan(t.asr);
    expect(t.asr).toBeLessThan(t.maghrib);
    expect(t.maghrib).toBeLessThan(t.isha);
  });

  it("dhuhr is 2.5 minutes after noon", () => {
    const t = getTimes(base);
    expect(t.dhuhr - t.noon).toBeCloseTo(2.5 / 60, 4);
  });

  it("angles are within [10, 22]", () => {
    const t = getTimes(base);
    expect(t.angles.fajrAngle).toBeGreaterThanOrEqual(10);
    expect(t.angles.fajrAngle).toBeLessThanOrEqual(22);
    expect(t.angles.ishaAngle).toBeGreaterThanOrEqual(10);
    expect(t.angles.ishaAngle).toBeLessThanOrEqual(22);
  });
});

describe("getTimes — Hanafi vs Shafi'i Asr", () => {
  const base = {
    date: new Date("2024-04-15T00:00:00Z"),
    lat: 40.7128,
    lng: -74.006,
    tz: -5,
  };

  it("Hanafi Asr is later than Shafi'i Asr", () => {
    const shafii = getTimes({ ...base, asrConvention: AsrConvention.shafii });
    const hanafi = getTimes({ ...base, asrConvention: AsrConvention.hanafi });
    expect(hanafi.asr).toBeGreaterThan(shafii.asr);
  });

  it("hanafiAngles=true uses fixed 18°/17° angles", () => {
    const times = getTimes({
      ...base,
      asrConvention: AsrConvention.hanafi,
      hanafiAngles: true,
    });
    expect(times.angles.fajrAngle).toBe(18);
    expect(times.angles.ishaAngle).toBe(17);
  });
});

describe("getTimes — high-latitude rules", () => {
  const highLat = {
    date: new Date("2024-06-21T00:00:00Z"),
    lat: 60.1699,
    lng: 24.9384,
    tz: 3,
  };

  it("middleOfNight rule produces finite times", () => {
    const times = getTimes({ ...highLat, highLatitudeRule: HighLatitudeRule.middleOfNight });
    expect(isFinite(times.fajr)).toBe(true);
    expect(isFinite(times.isha)).toBe(true);
  });

  it("oneSeventh rule produces finite times", () => {
    const times = getTimes({ ...highLat, highLatitudeRule: HighLatitudeRule.oneSeventh });
    expect(isFinite(times.fajr)).toBe(true);
    expect(isFinite(times.isha)).toBe(true);
  });

  it("angleBased rule produces finite times", () => {
    const times = getTimes({ ...highLat, highLatitudeRule: HighLatitudeRule.angleBased });
    expect(isFinite(times.fajr)).toBe(true);
    expect(isFinite(times.isha)).toBe(true);
  });
});

describe("getTimes — all 12 months don't throw", () => {
  for (let month = 0; month < 12; month++) {
    it(`month ${month + 1}`, () => {
      expect(() => getTimes({
        date: new Date(Date.UTC(2024, month, 15)),
        lat: 21.3891, lng: 39.8579, tz: 3,
      })).not.toThrow();
    });
  }
});

describe("getTimes — polar locations", () => {
  it("Murmansk June 21: does not throw (polar day conditions)", () => {
    expect(() => getTimes({
      date: new Date("2024-06-21T00:00:00Z"),
      lat: 68.9585,
      lng: 33.0828,
      tz: 3,
      highLatitudeRule: HighLatitudeRule.middleOfNight,
    })).not.toThrow();
  });

  it("Anchorage December 21: does not throw (very short day)", () => {
    expect(() => getTimes({
      date: new Date("2024-12-21T00:00:00Z"),
      lat: 61.2181,
      lng: -149.9003,
      tz: -9,
      highLatitudeRule: HighLatitudeRule.angleBased,
    })).not.toThrow();
  });
});

describe("formatTime", () => {
  it("formats 5.5 as 05:30:00", () => {
    expect(formatTime(5.5)).toBe("05:30:00");
  });

  it("formats 12.0 as 12:00:00", () => {
    expect(formatTime(12)).toBe("12:00:00");
  });

  it("formats 13.0417 (13h 2m 30s) correctly", () => {
    // 13 + 2.5/60 = 13.04166...
    expect(formatTime(13 + 2.5 / 60)).toBe("13:02:30");
  });

  it("returns N/A for NaN", () => {
    expect(formatTime(NaN)).toBe("N/A");
  });

  it("returns N/A for negative", () => {
    expect(formatTime(-1)).toBe("N/A");
  });

  it("returns N/A for Infinity", () => {
    expect(formatTime(Infinity)).toBe("N/A");
  });
});
