/**
 * Golden data generator script.
 *
 * Purpose: Pre-generate the parity-data.json fixture from the TypeScript implementation.
 *          Run this script once to produce golden output, then commit the JSON.
 *
 * Usage: npx tsx src/tests/golden/generate.ts > src/tests/golden/parity-data.json
 *
 * The parity test then verifies every entry matches the current implementation
 * within a 1-minute (1/60 hour) tolerance.
 */

import { getTimes } from "../../index.js";
import { AsrConvention, HighLatitudeRule } from "../../types/index.js";
import { CITIES } from "./cities.js";
import { METHODS } from "./methods.js";

const records: Record<string, number>[] = [];

for (const city of CITIES) {
  for (let month = 1; month <= 12; month++) {
    for (const method of METHODS) {
      const date = new Date(Date.UTC(2024, month - 1, 15, 0, 0, 0));

      const params = {
        date,
        lat: city.lat,
        lng: city.lng,
        tz: city.tz,
        ...method.params,
      };

      const times = getTimes(params);

      records.push({
        city: city.name as unknown as number,
        month,
        method: method.id as unknown as number,
        lat: city.lat,
        lng: city.lng,
        tz: city.tz,
        fajr: times.fajr,
        sunrise: times.sunrise,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
        fajrAngle: times.angles.fajrAngle,
        ishaAngle: times.angles.ishaAngle,
      });
    }
  }
}

process.stdout.write(JSON.stringify(records, null, 2));
