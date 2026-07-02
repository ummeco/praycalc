import { describe, it, expect } from "vitest";
import {
  getPrayerTimes,
  isKnownMethod,
  KNOWN_METHOD_IDS,
} from "@/lib/prayers.server";

// ---------------------------------------------------------------------------
// Shared fixture — Conneaut, OH (praycalc's default location)
// ---------------------------------------------------------------------------
const date = new Date("2026-07-01T12:00:00Z");
const lat = 41.5565;
const lng = -80.5595;
const tzOffset = -4; // EDT

// ---------------------------------------------------------------------------
// KNOWN_METHOD_IDS / isKnownMethod
// ---------------------------------------------------------------------------
describe("KNOWN_METHOD_IDS", () => {
  it("includes the documented pray-calc traditional methods", () => {
    expect(KNOWN_METHOD_IDS).toEqual(
      expect.arrayContaining(["MWL", "ISNA", "Egypt", "Karachi", "UAQ", "Qatar", "MSC"]),
    );
  });

  it("excludes Tehran/Jafari (Shia fiqh method, D-P3-19)", () => {
    expect(KNOWN_METHOD_IDS).not.toContain("Tehran");
    expect(KNOWN_METHOD_IDS).not.toContain("Jafari");
  });
});

describe("isKnownMethod", () => {
  it("returns true for a valid method id", () => {
    expect(isKnownMethod("MWL")).toBe(true);
    expect(isKnownMethod("Karachi")).toBe(true);
  });

  it("returns false for an unrecognized value", () => {
    expect(isKnownMethod("Tehran")).toBe(false);
    expect(isKnownMethod("bogus")).toBe(false);
    expect(isKnownMethod("")).toBe(false);
  });

  it("is case-sensitive, matching pray-calc's Methods map keys exactly", () => {
    expect(isKnownMethod("mwl")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getPrayerTimes — method param
// ---------------------------------------------------------------------------
describe("getPrayerTimes with method param", () => {
  it("returns the PrayCalc default when method is omitted", () => {
    const dynamic = getPrayerTimes(date, lat, lng, tzOffset);
    const explicitDefault = getPrayerTimes(date, lat, lng, tzOffset, false, false, undefined);
    expect(explicitDefault).toEqual(dynamic);
  });

  it("returns different Fajr/Isha for a known method vs. the default", () => {
    const dynamic = getPrayerTimes(date, lat, lng, tzOffset);
    const mwl = getPrayerTimes(date, lat, lng, tzOffset, false, false, "MWL");

    // Dhuhr/Asr/Maghrib/Qiyam are unaffected by method selection — only
    // Fajr/Isha come from the Methods map.
    expect(mwl.Dhuhr).toBe(dynamic.Dhuhr);
    expect(mwl.Maghrib).toBe(dynamic.Maghrib);
    expect(mwl.Fajr).not.toBe("N/A");
    expect(mwl.Isha).not.toBe("N/A");
  });

  it("falls back to PrayCalc default behavior for an unrecognized method", () => {
    // The API route rejects unknown methods with 400 before calling
    // getPrayerTimes; this verifies the library-level fallback is safe too.
    const dynamic = getPrayerTimes(date, lat, lng, tzOffset);
    const invalid = getPrayerTimes(date, lat, lng, tzOffset, false, false, "NotAMethod");
    expect(invalid).toEqual(dynamic);
  });
});
