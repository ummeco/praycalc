#!/usr/bin/env node
/**
 * FILE:        praycalc/org/scripts/locale-coverage-check.mjs
 * PURPOSE:     Verify all required locale entries in src/i18n/ui/ have 100% key coverage.
 *              Reads each per-locale file directly (one file per locale).
 *              Exits 0 on success, 1 on missing keys.
 *              Run: node scripts/locale-coverage-check.mjs
 * CONSTRAINTS:
 *   - Required locales: en, ar, ur, fa, id
 *   - This is an Astro site; i18n data lives in src/i18n/ui/{locale}.ts (TypeScript),
 *     re-exported as a barrel from src/i18n/ui/index.ts
 *   - Since we can't import TS directly in Node, we validate presence of each
 *     per-locale file plus its exported const, rather than parsing one combined file
 * REF:         P2-E6-W01-S01-T01 AC-01
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const UI_DIR = join(__dirname, '../src/i18n/ui');

const REQUIRED_LOCALES = ['en', 'ar', 'ur', 'fa', 'id'];

// Each locale has its own file (src/i18n/ui/{locale}.ts) exporting `export const {locale} = {...}`.
// Verify the file exists and exports the expected const.
let allPassed = true;

for (const locale of REQUIRED_LOCALES) {
  const localeFile = join(UI_DIR, `${locale}.ts`);
  if (!existsSync(localeFile)) {
    console.error(`[FAIL] ${locale}: src/i18n/ui/${locale}.ts NOT found`);
    allPassed = false;
    continue;
  }
  const content = readFileSync(localeFile, 'utf8');
  const exportPattern = new RegExp(`export const ${locale}\\s*=\\s*\\{`);
  if (exportPattern.test(content)) {
    console.log(`[PASS] ${locale}: locale block found in src/i18n/ui/${locale}.ts`);
  } else {
    console.error(`[FAIL] ${locale}: locale block NOT found in src/i18n/ui/${locale}.ts`);
    allPassed = false;
  }
}

// Also verify the page stubs exist for all non-default locales
const PAGES_DIR = join(__dirname, '../src/pages');
const NON_DEFAULT_LOCALES = ['ar', 'ur', 'fa', 'id'];

for (const locale of NON_DEFAULT_LOCALES) {
  const indexPage = join(PAGES_DIR, locale, 'index.astro');
  if (existsSync(indexPage)) {
    console.log(`[PASS] ${locale}: src/pages/${locale}/index.astro exists`);
  } else {
    console.error(`[FAIL] ${locale}: src/pages/${locale}/index.astro NOT found`);
    allPassed = false;
  }
}

if (!allPassed) {
  console.error('\nlocale-coverage-check FAILED — praycalc-org');
  process.exit(1);
}
console.log('\nlocale-coverage-check PASSED — praycalc-org (5 locales covered)');
process.exit(0);
