#!/usr/bin/env node
/**
 * rampart-nightly-aggregate.js — Aggregate nightly scan results
 *
 * PURPOSE: Glob all *-report.json files in the current directory, parse
 *   severity counts using the same logic as rampart-gate.js, and emit
 *   GitHub Actions step outputs for use by the issue-filing step.
 *
 * OUTPUTS (GITHUB_OUTPUT):
 *   crit_count=<n>
 *   high_count=<n>
 *   blocking=<true|false>
 *
 * CONSTRAINTS: Node 22, zero npm deps, always exits 0.
 *
 * Spec: .claude/docs/p2-rampart-ci-implementation-spec.md §3.4
 * Ticket: P2-E1-W01-S01-T02
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const GITHUB_OUTPUT = process.env.GITHUB_OUTPUT || '';

let critCount = 0;
let highCount = 0;

// Glob all *-report.json in cwd
const reportFiles = fs.readdirSync('.').filter(f => f.endsWith('-report.json'));

for (const file of reportFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8').trim();
    if (!content) continue;
    const data = JSON.parse(content);
    // rampart-gate.js emits { tool, critical, high, medium, low, baselined }
    if (typeof data.critical === 'number') {
      critCount += data.critical;
      highCount += data.high || 0;
    }
  } catch (_) {
    // Tolerate non-gate JSON files
  }
}

const blocking = critCount > 0 || highCount > 0;

console.log(`[rampart-aggregate] crit=${critCount} high=${highCount} blocking=${blocking}`);

if (GITHUB_OUTPUT) {
  fs.appendFileSync(GITHUB_OUTPUT, `crit_count=${critCount}\n`);
  fs.appendFileSync(GITHUB_OUTPUT, `high_count=${highCount}\n`);
  fs.appendFileSync(GITHUB_OUTPUT, `blocking=${blocking}\n`);
} else {
  // Local run fallback
  console.log(`crit_count=${critCount}`);
  console.log(`high_count=${highCount}`);
  console.log(`blocking=${blocking}`);
}

process.exit(0);
