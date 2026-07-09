import { describe, it, expect, vi, beforeEach } from "vitest";
import { geoRecordToResult, geocodeSlugParts } from "@/lib/geo.server";

// ---------------------------------------------------------------------------
// geo.server.ts — was untested. geoRecordToResult is pure (no fs); the
// data-lookup layer backing geocodeSlugParts is mocked so this stays a fast
// unit test independent of the real 20MB+ data/geo.json fixture.
// ---------------------------------------------------------------------------
vi.mock("@/lib/data-lookup.server", () => ({
  lookupGeoBySlug: vi.fn(),
  lookupGeoByIata: vi.fn(),
  lookupGeoByName: vi.fn(),
  lookupGeoByZip: vi.fn(),
}));

import {
  lookupGeoBySlug,
  lookupGeoByIata,
  lookupGeoByName,
  lookupGeoByZip,
} from "@/lib/data-lookup.server";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("geoRecordToResult", () => {
  it("formats an IATA airport record (3-letter code)", () => {
    const result = geoRecordToResult({
      n: "London, GB", y: 51.5072, x: -0.1276, t: "Europe/London", i: "lhr",
    });
    expect(result.slug).toBe("LHR");
    expect(result.city).toBe("London");
    expect(result.country).toBe("gb");
  });

  it("formats a US zip record (5-digit code)", () => {
    const result = geoRecordToResult({
      n: "Chicago, IL", y: 41.8781, x: -87.6298, t: "America/Chicago", i: "60601",
    });
    expect(result.slug).toBe("us/60601");
    expect(result.country).toBe("us");
    expect(result.displayName).toBe("Chicago, IL (60601)");
  });

  it("formats a 3-part US city/state record", () => {
    const result = geoRecordToResult({
      n: "New York, NY, US", y: 40.7128, x: -74.006, t: "America/New_York",
    });
    expect(result.slug).toBe("us/ny/new-york");
    expect(result.state).toBe("ny");
    expect(result.country).toBe("us");
  });

  it("formats a 2-part city/country record", () => {
    const result = geoRecordToResult({
      n: "Mecca, SA", y: 21.3891, x: 39.8579, t: "Asia/Riyadh",
    });
    expect(result.slug).toBe("sa/mecca");
    expect(result.country).toBe("sa");
  });

  it("slugifies punctuation and multi-word city names", () => {
    const result = geoRecordToResult({
      n: "St. Louis, MO, US", y: 38.627, x: -90.1994, t: "America/Chicago",
    });
    expect(result.slug).toBe("us/mo/st-louis");
  });
});

describe("geocodeSlugParts", () => {
  it("returns null for an empty parts array", () => {
    expect(geocodeSlugParts([])).toBeNull();
  });

  it("resolves a single-segment IATA code", () => {
    (lookupGeoByIata as ReturnType<typeof vi.fn>).mockReturnValue({
      n: "London, GB", y: 51.5, x: -0.12, t: "Europe/London", i: "LHR",
    });
    const result = geocodeSlugParts(["LHR"]);
    expect(result?.city).toBe("London");
    expect(lookupGeoByIata).toHaveBeenCalledWith("LHR");
  });

  it("de-hyphenates a bare city slug and looks it up by name", () => {
    (lookupGeoByIata as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue({
      n: "New York, NY, US", y: 40.71, x: -74.0, t: "America/New_York",
    });
    const result = geocodeSlugParts(["new-york"]);
    expect(lookupGeoByName).toHaveBeenCalledWith("new york");
    expect(result?.city).toBe("New York");
  });

  it("returns null for a single unresolved slug", () => {
    (lookupGeoByIata as ReturnType<typeof vi.fn>).mockReturnValue(null);
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue(null);
    expect(geocodeSlugParts(["nowhere"])).toBeNull();
  });

  it("resolves a two-segment us/{zip} slug via lookupGeoByZip", () => {
    (lookupGeoByZip as ReturnType<typeof vi.fn>).mockReturnValue({
      n: "Chicago, IL", y: 41.87, x: -87.62, t: "America/Chicago", i: "60601",
    });
    const result = geocodeSlugParts(["us", "60601"]);
    expect(lookupGeoByZip).toHaveBeenCalledWith("60601");
    expect(result?.slug).toBe("us/60601");
  });

  it("resolves a two-segment country/city slug via lookupGeoBySlug", () => {
    (lookupGeoBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
      n: "Mecca, SA", y: 21.38, x: 39.85, t: "Asia/Riyadh",
    });
    const result = geocodeSlugParts(["sa", "mecca"]);
    expect(lookupGeoBySlug).toHaveBeenCalledWith("sa", "sa", "mecca");
    expect(result?.city).toBe("Mecca");
  });

  it("resolves a three-segment country/state/city slug", () => {
    (lookupGeoBySlug as ReturnType<typeof vi.fn>).mockReturnValue({
      n: "New York, NY, US", y: 40.71, x: -74.0, t: "America/New_York",
    });
    const result = geocodeSlugParts(["us", "ny", "new-york"]);
    expect(lookupGeoBySlug).toHaveBeenCalledWith("us", "ny", "new-york");
    expect(result?.slug).toBe("us/ny/new-york");
  });

  it("returns null for more than 3 parts", () => {
    expect(geocodeSlugParts(["a", "b", "c", "d"])).toBeNull();
  });
});
