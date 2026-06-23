/**
 * Unit tests: high-latitude.ts
 */

import { describe, it, expect } from "vitest";
import { applyHighLatitudeRule } from "../algorithms/high-latitude.js";
import { HighLatitudeRule } from "../types/index.js";

const mockAngles = { fajrAngle: 15, ishaAngle: 15 };

describe("applyHighLatitudeRule — none", () => {
  it("passes through valid times unchanged", () => {
    const result = applyHighLatitudeRule(
      HighLatitudeRule.none, 5.5, 22.0, 6.2, 19.5, 12.8, mockAngles,
    );
    expect(result.fajr).toBe(5.5);
    expect(result.isha).toBe(22.0);
  });
});

describe("applyHighLatitudeRule — oneSeventh", () => {
  it("replaces NaN fajr/isha with 1/7 offsets from midnight", () => {
    const result = applyHighLatitudeRule(
      HighLatitudeRule.oneSeventh, NaN, NaN, 6, 18, 12, mockAngles,
    );
    expect(isFinite(result.fajr)).toBe(true);
    expect(isFinite(result.isha)).toBe(true);
    // Night = 6+24-18 = 12h, offset = 12/7 ≈ 1.714h, midnight ≈ 24 → 0
    // fajr = midnight - offset, isha = midnight + offset
    expect(result.fajr).toBeCloseTo((0 - 12 / 7 + 24) % 24, 1);
    expect(result.isha).toBeCloseTo(12 / 7, 1);
  });

  it("keeps valid fajr when only isha is NaN", () => {
    const result = applyHighLatitudeRule(
      HighLatitudeRule.oneSeventh, 5.0, NaN, 6, 18, 12, mockAngles,
    );
    expect(result.fajr).toBe(5.0);
    expect(isFinite(result.isha)).toBe(true);
  });
});

describe("applyHighLatitudeRule — middleOfNight", () => {
  it("sets fajr/isha symmetrically around midnight", () => {
    const result = applyHighLatitudeRule(
      HighLatitudeRule.middleOfNight, NaN, NaN, 6, 18, 12, mockAngles,
    );
    // Night = 12h, offset = 6h, midnight = 18 + 6 = 24 → 0
    // fajr = 0 - 6 = -6 → 18, isha = 0 + 6 = 6
    expect(result.isha).toBeCloseTo(6, 1);
    expect(result.fajr).toBeCloseTo(18, 1);
  });
});

describe("applyHighLatitudeRule — angleBased", () => {
  it("produces valid finite times for NaN inputs", () => {
    const result = applyHighLatitudeRule(
      HighLatitudeRule.angleBased, NaN, NaN, 6, 18, 12, { fajrAngle: 18, ishaAngle: 18 },
    );
    expect(isFinite(result.fajr)).toBe(true);
    expect(isFinite(result.isha)).toBe(true);
  });
});
