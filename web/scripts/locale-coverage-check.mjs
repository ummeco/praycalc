#!/usr/bin/env node
/**
 * FILE:        praycalc/web/scripts/locale-coverage-check.mjs
 * PURPOSE:     Verify all required locale JSON files have 100% key coverage
 *              relative to the English baseline. Exits 0 on success, 1 on missing keys.
 *              Run: node scripts/locale-coverage-check.mjs
 * CONSTRAINTS:
 *   - Required locales: en, ar, ur, fa, id (100% gate — CI fails on any missing key)
 *   - Warn-only locales (tr, fr, ms, bn, etc.) are not checked here
 * REF:         P2-E6-W01-S01-T01 AC-01
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = join(__dirname, '../messages');
const REQUIRED_LOCALES = ['en', 'ar', 'ur', 'fa', 'id'];

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flattenKeys(v, key)
      : [key];
  });
}

function loadLocale(locale) {
  const file = join(MESSAGES_DIR, `${locale}.json`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

let allPassed = true;

const baseline = loadLocale('en');
const baselineKeys = new Set(flattenKeys(baseline));

for (const locale of REQUIRED_LOCALES) {
  try {
    const data = loadLocale(locale);
    const keys = new Set(flattenKeys(data));
    const missing = [...baselineKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !baselineKeys.has(k));

    if (missing.length > 0) {
      console.error(`[FAIL] ${locale}: missing ${missing.length} keys:`);
      missing.forEach((k) => console.error(`  - ${k}`));
      allPassed = false;
    } else {
      console.log(`[PASS] ${locale}: ${keys.size}/${baselineKeys.size} keys`);
    }
    if (extra.length > 0) {
      console.warn(`[WARN] ${locale}: ${extra.length} extra keys (not in en baseline):`);
      extra.forEach((k) => console.warn(`  + ${k}`));
    }
  } catch (err) {
    console.error(`[FAIL] ${locale}: could not load — ${err.message}`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nlocale-coverage-check FAILED — praycalc-web');
  process.exit(1);
}
console.log('\nlocale-coverage-check PASSED — praycalc-web (5 locales at 100%)');
process.exit(0);
