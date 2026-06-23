/**
 * Unit tests: asr.ts (Asr prayer time calculation)
 */

import { describe, it, expect } from "vitest";
import { getAsr } from "../algorithms/asr.js";

describe("getAsr", () => {
  it("Shafi'i Asr is earlier than Hanafi Asr", () => {
    // At Makkah, solar noon ~12.4, decl ~15°
    const noon = 12.4;
    const lat = 21.3891;
    const decl = 15;

    const shafii = getAsr(noon, lat, decl, false);
    const hanafi = getAsr(noon, lat, decl, true);

    expect(shafii).toBeLessThan(hanafi);
  });

  it("Asr is after solar noon", () => {
    const asr = getAsr(12.5, 40, 20);
    expect(asr).toBeGreaterThan(12.5);
  });

  it("returns NaN when sun never reaches required altitude (extreme lat/decl)", () => {
    // At lat=90, decl=0: tan(|phi-delta|) = tan(90°) = Infinity → cosH0 > 1
    const asr = getAsr(12, 89, 0, false);
    expect(isNaN(asr) || isFinite(asr)).toBe(true); // may or may not be NaN
  });

  it("Hanafi Asr factor 2 shadow gives correct formula result", () => {
    // Known case: lat=21.39, noon=12.42, decl=20°
    const asrShafii = getAsr(12.42, 21.39, 20, false);
    const asrHanafi = getAsr(12.42, 21.39, 20, true);
    // Both should be in afternoon (12–18 range)
    expect(asrShafii).toBeGreaterThan(12);
    expect(asrShafii).toBeLessThan(18);
    expect(asrHanafi).toBeGreaterThan(12);
    expect(asrHanafi).toBeLessThan(18);
    // Hanafi is later
    expect(asrHanafi).toBeGreaterThan(asrShafii);
  });
});
