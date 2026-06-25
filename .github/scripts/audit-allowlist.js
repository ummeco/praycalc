#!/usr/bin/env node
/**
 * Purpose: Gate `pnpm audit --json` output against an allowlist of accepted CVEs.
 * Inputs:  argv[2] = path to pnpm audit JSON report (default: audit-report.json)
 *          argv[3] = path to allowlist JSON (default: .audit-allowlist.json)
 * Outputs: exit 0 when no un-allowlisted HIGH/CRITICAL advisories remain; exit 1 otherwise.
 *          Prints allowlisted + violating advisories to stdout/stderr.
 * Constraints: pnpm audit JSON shape varies by version — handle object- and array-shaped advisories.
 * SPORT: shared by ci.yml + ci-deps-audit.yml (DRY — single source of audit gating).
 */
'use strict';
const fs = require('fs');

const reportPath = process.argv[2] || 'audit-report.json';
const allowlistPath = process.argv[3] || '.audit-allowlist.json';

let report;
try {
  report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
} catch (e) {
  console.log('No audit report found or parse error:', e.message);
  process.exit(0);
}

let allowlist = {};
if (fs.existsSync(allowlistPath)) {
  try {
    allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8'));
    console.log('Loaded allowlist with', Object.keys(allowlist).length, 'entries');
  } catch (e) {
    console.warn('Failed to parse allowlist — ignoring:', e.message);
  }
}

const advisoriesRaw = report.advisories ?? {};
const advisories = Array.isArray(advisoriesRaw) ? advisoriesRaw : Object.values(advisoriesRaw);

const HIGH = new Set(['high', 'critical']);
const violations = [];
const allowed = [];

for (const adv of advisories) {
  if (!HIGH.has((adv.severity || '').toLowerCase())) continue;
  const id = String(adv.id ?? adv.ghsa_id ?? adv.cve ?? 'unknown');
  const entry = allowlist[id] ?? allowlist[adv.title] ?? null;
  if (entry) {
    const expiry = entry.expires ? new Date(entry.expires) : null;
    if (!expiry || expiry > new Date()) {
      allowed.push({ id, title: adv.title, severity: adv.severity, reason: entry.reason });
      continue;
    }
    console.warn(`Allowlist entry for ${id} expired on ${entry.expires}`);
  }
  violations.push({
    id,
    severity: adv.severity,
    title: adv.title ?? 'Unknown',
    module: adv.module_name ?? adv.name ?? 'unknown',
    recommendation: adv.recommendation ?? 'Update to patched version',
  });
}

if (allowed.length > 0) {
  console.log('\nAllowlisted (skipped):');
  for (const a of allowed) {
    console.log(`  [${(a.severity || '').toUpperCase()}] ${a.id} — ${a.title}`);
  }
}

if (violations.length === 0) {
  console.log('\nNo HIGH or CRITICAL vulnerabilities found (after allowlist filter).');
  process.exit(0);
}

console.error(`\n${violations.length} unpatched HIGH/CRITICAL vulnerability(s) found:\n`);
for (const v of violations) {
  console.error(`  [${(v.severity || '').toUpperCase()}] ${v.id} — ${v.title}`);
  console.error(`    Package: ${v.module}`);
  console.error(`    Fix:     ${v.recommendation}\n`);
}
console.error('To accept a known vulnerability, add it to web/.audit-allowlist.json.');
process.exit(1);
