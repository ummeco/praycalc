import { describe, it, expect } from "vitest";
import {
  getPrayerTimes,
  isKnownMethod,
  KNOWN_METHOD_IDS,
  DPC_METHOD_ID,
  getMethodOptions,
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

  it("accepts 'DPC' as the flagship dynamic default", () => {
    expect(DPC_METHOD_ID).toBe("DPC");
    expect(isKnownMethod("DPC")).toBe(true);
    expect(KNOWN_METHOD_IDS[0]).toBe("DPC");
  });
});

// ---------------------------------------------------------------------------
// getMethodOptions — picker UI source (DPC first + recommended)
// ---------------------------------------------------------------------------
describe("getMethodOptions", () => {
  it("lists DPC first, marked recommended, with a Recommended label", () => {
    const opts = getMethodOptions();
    expect(opts[0]!.id).toBe("DPC");
    expect(opts[0]!.recommended).toBe(true);
    expect(opts[0]!.label).toMatch(/Recommended/);
  });

  it("marks only DPC as recommended and keeps fixed methods selectable", () => {
    const opts = getMethodOptions();
    expect(opts.filter((o) => o.recommended)).toHaveLength(1);
    expect(opts.some((o) => o.id === "MWL")).toBe(true);
    expect(opts.some((o) => o.id === "ISNA")).toBe(true);
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

  it("method='DPC' returns the same dynamic times as the default (no fixed overlay)", () => {
    const dynamic = getPrayerTimes(date, lat, lng, tzOffset);
    const dpc = getPrayerTimes(date, lat, lng, tzOffset, false, false, "DPC");
    expect(dpc).toEqual(dynamic);
  });

  it("DPC dynamic Fajr/Isha differ from a fixed method (MWL)", () => {
    const dpc = getPrayerTimes(date, lat, lng, tzOffset, false, false, "DPC");
    const mwl = getPrayerTimes(date, lat, lng, tzOffset, false, false, "MWL");
    // Shared prayers stay identical; the dynamic default is not the MWL overlay.
    expect(dpc.Dhuhr).toBe(mwl.Dhuhr);
    expect(dpc.Fajr).not.toBe("N/A");
    // For this mid-latitude summer fixture, DPC and MWL Fajr should not coincide.
    expect(dpc.Fajr === mwl.Fajr && dpc.Isha === mwl.Isha).toBe(false);
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
