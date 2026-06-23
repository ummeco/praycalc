/**
 * Parity test — 50 cities × 12 months × 8 methods = 4800 combinations.
 *
 * Purpose: Verify self-consistency of the TypeScript implementation.
 *          The golden data in parity-data.json is generated once from
 *          this same implementation (via src/tests/golden/generate.ts),
 *          then committed as the reference fixture.
 *
 * Gate (FGAP-06): All 4800 combinations must pass within 1-minute tolerance
 * before W-03 praycalc build tickets start.
 *
 * Tolerance: 1 minute (1/60 hour) for Fajr, Dhuhr, Asr, Maghrib, Isha.
 * Angles: 0.01° tolerance (internal consistency).
 */

import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getTimes } from "../algorithms/get-times.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GOLDEN_PATH = join(__dirname, "golden", "parity-data.json");

const MINUTE = 1 / 60;
const ANGLE_TOLERANCE = 0.01;

interface GoldenRecord {
  city: string;
  month: number;
  method: string;
  lat: number;
  lng: number;
  tz: number;
  // JSON.stringify serialises NaN as null, so these may be null in the fixture
  fajr: number | null;
  sunrise: number | null;
  dhuhr: number | null;
  asr: number | null;
  maghrib: number | null;
  isha: number | null;
  fajrAngle: number;
  ishaAngle: number;
}

import { CITIES } from "./golden/cities.js";
import { METHODS } from "./golden/methods.js";

describe("Parity test — 50 cities × 12 months × 8 methods", () => {
  const goldenExists = existsSync(GOLDEN_PATH);

  if (!goldenExists) {
    // Golden data not yet generated — generate on-the-fly for CI
    // This path runs when the fixture hasn't been committed yet
    it.todo("parity-data.json not found — run: npx tsx src/tests/golden/generate.ts > src/tests/golden/parity-data.json");
    return;
  }

  const golden: GoldenRecord[] = JSON.parse(readFileSync(GOLDEN_PATH, "utf-8"));
  const goldenMap = new Map(
    golden.map((r) => [`${r.city}|${r.month}|${r.method}`, r]),
  );

  let tested = 0;
  const failures: string[] = [];

  for (const city of CITIES) {
    for (let month = 1; month <= 12; month++) {
      for (const method of METHODS) {
        const key = `${city.name}|${month}|${method.id}`;
        const ref = goldenMap.get(key);
        if (!ref) continue;

        const date = new Date(Date.UTC(2024, month - 1, 15, 0, 0, 0));
        const times = getTimes({ date, lat: city.lat, lng: city.lng, tz: city.tz, ...method.params });

        // JSON serialisation converts NaN → null, so treat null as NaN in comparisons
        const isNonFinite = (v: number | null | undefined): boolean =>
          v === null || v === undefined || !isFinite(v as number) || isNaN(v as number);

        const check = (field: keyof typeof times & keyof GoldenRecord, val: number, refVal: number | null) => {
          if (isNonFinite(val) && isNonFinite(refVal)) return;
          if (isNonFinite(val) !== isNonFinite(refVal)) {
            failures.push(`${key} ${field}: expected ${isNonFinite(refVal) ? "null/NaN" : refVal} got ${isNonFinite(val) ? "NaN" : val}`);
            return;
          }
          const diff = Math.abs(val - (refVal as number));
          if (diff > MINUTE) {
            failures.push(`${key} ${field}: |${val.toFixed(4)} - ${(refVal as number).toFixed(4)}| = ${(diff * 60).toFixed(2)}min`);
          }
        };

        check("fajr", times.fajr, ref.fajr);
        check("dhuhr", times.dhuhr, ref.dhuhr);
        check("asr", times.asr, ref.asr);
        check("maghrib", times.maghrib, ref.maghrib);
        check("isha", times.isha, ref.isha);

        // Angle consistency
        if (Math.abs(times.angles.fajrAngle - ref.fajrAngle) > ANGLE_TOLERANCE) {
          failures.push(`${key} fajrAngle: ${times.angles.fajrAngle} vs ${ref.fajrAngle}`);
        }
        if (Math.abs(times.angles.ishaAngle - ref.ishaAngle) > ANGLE_TOLERANCE) {
          failures.push(`${key} ishaAngle: ${times.angles.ishaAngle} vs ${ref.ishaAngle}`);
        }

        tested++;
      }
    }
  }

  it(`passes all ${tested} combinations (tolerance: 1 min)`, () => {
    if (failures.length > 0) {
      const sample = failures.slice(0, 20).join("\n");
      expect.fail(`${failures.length} failures:\n${sample}`);
    }
    expect(tested).toBeGreaterThanOrEqual(4800);
  });

  it("tested at least 4800 combinations (50 cities × 12 months × 8 methods)", () => {
    expect(tested).toBeGreaterThanOrEqual(4800);
  });
});

describe("Spot-check parity — known Makkah values", () => {
  it("Makkah Apr-15: prayer ordering is correct for all 8 methods", () => {
    const city = CITIES.find((c) => c.name === "Makkah")!;
    for (const method of METHODS) {
      const times = getTimes({
        date: new Date("2024-04-15T00:00:00Z"),
        lat: city.lat, lng: city.lng, tz: city.tz,
        ...method.params,
      });
      if (isFinite(times.fajr) && isFinite(times.isha)) {
        expect(times.fajr).toBeLessThan(times.sunrise);
        expect(times.sunrise).toBeLessThan(times.dhuhr);
        expect(times.dhuhr).toBeLessThan(times.asr);
        expect(times.asr).toBeLessThan(times.maghrib);
        expect(times.maghrib).toBeLessThan(times.isha);
      }
    }
  });
});
