/**
 * Unit tests: qiyam.ts (Qiyam al-Layl time calculation)
 */

import { describe, it, expect } from "vitest";
import { getQiyam } from "../algorithms/qiyam.js";

describe("getQiyam", () => {
  it("basic case: Isha=21.5, Fajr=5.5 → start of last third", () => {
    // Night: 21.5 to (5.5+24)=29.5 → length = 8h
    // 2/3 of 8 = 5.33h → start of last third = 21.5 + 5.33 ≈ 26.83 → 26.83-24=2.83
    const q = getQiyam(5.5, 21.5);
    expect(q).toBeCloseTo(2.833, 2);
  });

  it("returns value in [0, 24)", () => {
    for (const [fajr, isha] of [[5.5, 21.5], [4, 20.5], [6, 22]]) {
      const q = getQiyam(fajr, isha);
      expect(q).toBeGreaterThanOrEqual(0);
      expect(q).toBeLessThan(24);
    }
  });

  it("qiyam is before fajr (last third starts before dawn)", () => {
    const q = getQiyam(5.0, 21.0);
    // Qiyam should be between isha and fajr in the night
    // 5.0 (next day) so it should be e.g. 2.x
    expect(q).toBeLessThan(5.0);
  });

  it("adjusts correctly when fajr < isha (crosses midnight)", () => {
    // Fajr at 4.0, Isha at 22.0 — crosses midnight
    const q = getQiyam(4.0, 22.0);
    // Night = (4+24) - 22 = 6h; last third starts at 22 + 2/3*6 = 22+4=26 → 2.0
    expect(q).toBeCloseTo(2.0, 1);
  });
});
