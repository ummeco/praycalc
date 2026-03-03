/**
 * PC-3.7: Generate assets/data/cities.json from the praycalc/web geo.json source.
 *
 * Usage:
 *   node scripts/gen_city_db.mjs
 *
 * Input:  ../web/public/geo.json  (50K+ city records)
 * Output: assets/data/cities.json (trimmed, sorted by population)
 *
 * Output fields per record:
 *   name, country, state, lat, lng, timezone, population
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const geoPath = path.resolve(__dirname, '../../web/data/geo.json');
const outPath = path.resolve(__dirname, '../assets/data/cities.json');

if (!fs.existsSync(geoPath)) {
  console.error(`geo.json not found at: ${geoPath}`);
  console.error('Run this script from the praycalc/flutter directory.');
  process.exit(1);
}

console.log(`Reading ${geoPath}...`);
const raw = fs.readFileSync(geoPath, 'utf8');
const cities = JSON.parse(raw);
console.log(`Loaded ${cities.length} cities.`);

// geo.json compact format: { n: "Name, CC", y: lat, x: lng, t: timezone, p: population }
// n contains "City Name, COUNTRY_CODE" — split on last ", " to get name + country
const out = cities
  .filter(c => c.y != null && c.x != null && c.t)
  .map(c => {
    const n = String(c.n || '');
    const commaIdx = n.lastIndexOf(', ');
    const name    = commaIdx > 0 ? n.slice(0, commaIdx).trim() : n.trim();
    const country = commaIdx > 0 ? n.slice(commaIdx + 2).trim() : '';
    return {
      name,
      country,
      state:      null,
      lat:        Number(c.y),
      lng:        Number(c.x),
      timezone:   String(c.t),
      population: Number(c.p || 0),
    };
  })
  .filter(c => c.name.length > 0 && c.population >= 5000)
  .sort((a, b) => b.population - a.population);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(`Wrote ${out.length} cities → ${outPath}`);
console.log(`File size: ${(fs.statSync(outPath).size / 1024).toFixed(0)} KB`);
