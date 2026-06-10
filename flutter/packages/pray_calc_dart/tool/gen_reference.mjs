/**
 * Generates reference prayer time values from the pray-calc Node.js library.
 *
 * Usage:  node tool/gen_reference.mjs > tool/reference.json
 *
 * Each test case: { id, city, date, lat, lng, tz, hanafi, expected }
 * expected fields: qiyam, fajr, sunrise, noon, dhuhr, asr, maghrib, isha (all fractional hours)
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prayCalcPath = path.resolve(
  __dirname,
  '../../../../web/node_modules/.pnpm/pray-calc@2.0.0/node_modules/pray-calc/dist/index.mjs'
);
const { getTimes } = await import(prayCalcPath);

// 50 representative cities: [city, lat, lng, utcOffset]
// Offsets are standard (non-DST) except where noted with a comment.
const cities = [
  // Equatorial / tropics
  ['Mecca, SA',        21.3891,   39.8579,   3.0],
  ['Medina, SA',       24.4686,   39.6142,   3.0],
  ['Nairobi, KE',      -1.2921,   36.8219,   3.0],
  ['Singapore, SG',     1.3521,  103.8198,   8.0],
  ['Kuala Lumpur, MY',  3.1390,  101.6869,   8.0],
  ['Lagos, NG',         6.4550,    3.3841,   1.0],
  ['Jakarta, ID',      -6.2146,  106.8451,   7.0],
  ['Bangkok, TH',      13.7563,  100.5018,   7.0],
  ['Dhaka, BD',        23.8103,   90.4125,   6.0],
  ['Mumbai, IN',       19.0760,   72.8777,   5.5],
  // Middle East / Central Asia
  ['Karachi, PK',      24.8607,   67.0011,   5.0],
  ['Lahore, PK',       31.5497,   74.3436,   5.0],
  ['Islamabad, PK',    33.7294,   73.0931,   5.0],
  ['Kabul, AF',        34.5289,   69.1723,   4.5],
  ['Tehran, IR',       35.6892,   51.3890,   3.5],
  ['Riyadh, SA',       24.7136,   46.6753,   3.0],
  ['Dubai, AE',        25.2048,   55.2708,   4.0],
  ['Istanbul, TR',     41.0082,   28.9784,   3.0],
  ['Beirut, LB',       33.8938,   35.5018,   2.0],
  ['Cairo, EG',        30.0444,   31.2357,   2.0],
  // Africa
  ['Algiers, DZ',      36.7372,    3.0865,   1.0],
  ['Casablanca, MA',   33.5731,   -7.5898,   0.0],
  ['Johannesburg, ZA', -26.2041,  28.0473,   2.0],
  ['Cape Town, ZA',    -33.9249,  18.4241,   2.0],
  // Europe
  ['London, GB',       51.5074,   -0.1278,   0.0],
  ['Paris, FR',        48.8566,    2.3522,   1.0],
  ['Madrid, ES',       40.4168,   -3.7038,   1.0],
  ['Rome, IT',         41.9028,   12.4964,   1.0],
  ['Berlin, DE',       52.5200,   13.4050,   1.0],
  ['Moscow, RU',       55.7558,   37.6173,   3.0],
  ['Oslo, NO',         59.9139,   10.7522,   1.0],
  ['Helsinki, FI',     60.1699,   24.9384,   2.0],
  ['Reykjavik, IS',    64.1355,  -21.8954,   0.0],
  // North America
  ['New York, US',     40.7128,  -74.0060,  -5.0],
  ['Chicago, US',      41.8781,  -87.6298,  -6.0],
  ['Los Angeles, US',  34.0522, -118.2437,  -8.0],
  ['Denver, US',       39.7392, -104.9903,  -7.0],
  ['Miami, US',        25.7617,  -80.1918,  -5.0],
  ['Anchorage, US',    61.2181, -149.9003,  -9.0],
  // South America
  ['São Paulo, BR',   -23.5505,  -46.6333,  -3.0],
  ['Buenos Aires, AR',-34.6037,  -58.3816,  -3.0],
  ['Quito, EC',        -0.1807,  -78.4678,  -5.0],
  // Asia
  ['Tokyo, JP',        35.6762,  139.6503,   9.0],
  ['Seoul, KR',        37.5665,  126.9780,   9.0],
  ['Beijing, CN',      39.9042,  116.4074,   8.0],
  ['Almaty, KZ',       43.2220,   76.8512,   6.0],
  ['Tashkent, UZ',     41.2995,   69.2401,   5.0],
  // Australia / Pacific
  ['Sydney, AU',      -33.8688,  151.2093,  10.0],
  ['Auckland, NZ',    -36.8485,  174.7633,  12.0],
  ['Honolulu, US',     21.3069, -157.8583, -10.0],
];

// Two dates: vernal equinox + winter solstice
const dates = [
  new Date('2024-03-21T12:00:00Z'),
  new Date('2024-12-21T12:00:00Z'),
];

const FIELDS = ['qiyam', 'fajr', 'sunrise', 'noon', 'dhuhr', 'asr', 'maghrib', 'isha'];

const cases = [];
let id = 1;

for (const [city, lat, lng, tz] of cities) {
  for (const date of dates) {
  for (const hanafi of [false, true]) {
      const t = getTimes(date, lat, lng, tz, 0, undefined, undefined, hanafi);
      cases.push({
        id: id++,
        city,
        date: date.toISOString().slice(0, 10),
        lat,
        lng,
        tz,
        hanafi,
        expected: {
          qiyam:   t.Qiyam,
          fajr:    t.Fajr,
          sunrise: t.Sunrise,
          noon:    t.Noon,
          dhuhr:   t.Dhuhr,
          asr:     t.Asr,
          maghrib: t.Maghrib,
          isha:    t.Isha,
        },
        fajrAngle: t.angles.fajrAngle,
        ishaAngle: t.angles.ishaAngle,
      });
    }
  }
}

console.log(JSON.stringify(cases, null, 2));
process.stderr.write(`Generated ${cases.length} test cases\n`);
