/**
 * Purpose: Verify clamp/clampRotateMinutes/clampMinutes1to60 range, rounding,
 *   and NaN-fallback behavior.
 * SPORT: praycalc packages/ui-utils clamp tests
 */

import { describe, it, expect } from "vitest";
import { clamp, clampRotateMinutes, clampMinutes1to60 } from "../clamp.js";

describe("clamp", () => {
  it("passes through values already in range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("clamps below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("clamps above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("does not round non-integer values", () => {
    expect(clamp(5.5, 0, 10)).toBe(5.5);
  });
});

describe("clampRotateMinutes", () => {
  it("clamps into 1..30 and rounds", () => {
    expect(clampRotateMinutes(0)).toBe(1);
    expect(clampRotateMinutes(50)).toBe(30);
    expect(clampRotateMinutes(10.4)).toBe(10);
    expect(clampRotateMinutes(NaN)).toBe(10);
  });
});

describe("clampMinutes1to60", () => {
  it("clamps into 1..60, rounds, falls back on NaN", () => {
    expect(clampMinutes1to60(0, 5)).toBe(1);
    expect(clampMinutes1to60(90, 5)).toBe(60);
    expect(clampMinutes1to60(9.6, 5)).toBe(10);
    expect(clampMinutes1to60(NaN, 5)).toBe(5);
  });
});
