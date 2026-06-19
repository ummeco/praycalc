#!/usr/bin/env node
/**
 * rampart-gate.js — Rampart CI Gate Script
 *
 * PURPOSE: Parse a scanner's JSON report, map findings to severities per §3.2,
 *   exit 1 on CRITICAL (always) or HIGH (when RAMPART_ENFORCE=error). Fail-closed:
 *   missing or unparseable report → exit 1 regardless of enforcement mode.
 *
 * INPUTS:
 *   argv[0]: report JSON file path
 *   --tool <osv|pnpm|semgrep|trivy|govulncheck|hasura>
 *   --baseline <path>  optional baseline JSON file (format §11)
 *
 * OUTPUTS:
 *   stdout: JSON with severity counts { critical, high, medium, low, baselined }
 *   exit 0 / exit 1 per §3.2 action table
 *
 * CONSTRAINTS: Node 22, zero npm deps, ≤300 lines, fail-closed semantics.
 *
 * SPORT: .opencode/phases/sport/F-MASTER.md §Rampart
 * Spec: .claude/docs/p2-rampart-ci-implementation-spec.md §3.2, §5, §11
 * ADR: ADR-008 (Rampart CI)
 * Ticket: P2-E1-W01-S01-T02
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

// ── CLI args ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const reportPath = args[0];
const toolIdx = args.indexOf('--tool');
const tool = toolIdx !== -1 ? args[toolIdx + 1] : null;
const baselineIdx = args.indexOf('--baseline');
const baselinePath = baselineIdx !== -1 ? args[baselineIdx + 1] : null;

const ENFORCE = process.env.RAMPART_ENFORCE || 'warn';
const VALID_TOOLS = ['osv', 'pnpm', 'semgrep', 'trivy', 'govulncheck', 'hasura'];

// ── Validation ────────────────────────────────────────────────────────────────
function failClosed(reason) {
  console.error(`[rampart-gate] FAIL-CLOSED: ${reason}`);
  process.exit(1);
}

if (!reportPath) failClosed('No report path provided');
if (!tool || !VALID_TOOLS.includes(tool)) {
  failClosed(`--tool must be one of: ${VALID_TOOLS.join(', ')}`);
}
if (!fs.existsSync(reportPath)) failClosed(`Report not found: ${reportPath}`);

// ── Load baseline ─────────────────────────────────────────────────────────────
let baseline = { version: 1, accepted: {} };
if (baselinePath) {
  if (!fs.existsSync(baselinePath)) failClosed(`Baseline not found: ${baselinePath}`);
  try {
    baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  } catch (e) {
    failClosed(`Baseline unparseable: ${e.message}`);
  }
  if (baseline.version !== 1) failClosed(`Unknown baseline version: ${baseline.version}`);
  // Validate no CRITICAL entries (CRITICAL can never be baselined)
  for (const [key, entry] of Object.entries(baseline.accepted || {})) {
    if (entry.severity === 'CRITICAL') {
      failClosed(`Baseline entry ${key} has severity CRITICAL — CRITICAL findings cannot be baselined (§11)`);
    }
  }
}

// ── Parse report ──────────────────────────────────────────────────────────────
let report;
try {
  const content = fs.readFileSync(reportPath, 'utf8').trim();
  if (!content) failClosed('Report file is empty');
  report = JSON.parse(content);
} catch (e) {
  failClosed(`Report unparseable: ${e.message}`);
}

// ── Severity extraction per tool ──────────────────────────────────────────────
// Ports the severity logic from ummat/scripts/rampart.sh lines 145-358.

const counts = { critical: 0, high: 0, medium: 0, low: 0, baselined: 0 };
const findings = [];

function cvssScore(severity) {
  if (!Array.isArray(severity)) return 0;
  const cvss = severity.find(s => s.type === 'CVSS_V3');
  return cvss ? parseFloat(cvss.score || 0) : 0;
}

function cvssToSeverity(score) {
  if (score >= 9) return 'CRITICAL';
  if (score >= 7) return 'HIGH';
  if (score >= 4) return 'MEDIUM';
  return 'LOW';
}

function isExpired(entry) {
  if (!entry.expires) return false;
  return new Date(entry.expires) < new Date();
}

function checkBaseline(key, liveSeverity) {
  const entry = (baseline.accepted || {})[key];
  if (!entry) return false;
  if (isExpired(entry)) return false;
  // Severity escalation guard: entry only matches if live severity <= recorded
  const sevOrder = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const entryIdx = sevOrder.indexOf(entry.severity);
  const liveIdx = sevOrder.indexOf(liveSeverity);
  return liveIdx <= entryIdx;
}

function addFinding(severity, key) {
  if (checkBaseline(key, severity)) {
    counts.baselined++;
    return;
  }
  findings.push({ severity, key });
  const s = severity.toUpperCase();
  if (s === 'CRITICAL') counts.critical++;
  else if (s === 'HIGH') counts.high++;
  else if (s === 'MEDIUM') counts.medium++;
  else counts.low++;
}

if (tool === 'osv') {
  // osv-scanner JSON: { results: [{ packages: [{ package: { name }, vulnerabilities: [{ id, severity:[{type,score}] }] }] }] }
  const results = report.results || [];
  for (const result of results) {
    for (const pkg of result.packages || []) {
      const pkgName = pkg.package?.name || 'unknown';
      for (const vuln of pkg.vulnerabilities || []) {
        const score = cvssScore(vuln.severity || []);
        const sev = cvssToSeverity(score);
        const key = `osv:${vuln.id}:${pkgName}`;
        addFinding(sev, key);
      }
    }
  }
}

if (tool === 'pnpm') {
  // pnpm audit --json: { vulnerabilities: { <name>: { severity, ghAdvisoryId, cves } } }
  const vulns = report.vulnerabilities || {};
  for (const [name, v] of Object.entries(vulns)) {
    const rawSev = (v.severity || 'low').toUpperCase();
    const sev = rawSev === 'CRITICAL' ? 'CRITICAL'
      : rawSev === 'HIGH' ? 'HIGH'
      : rawSev === 'MODERATE' ? 'MEDIUM'
      : 'LOW';
    const advisoryId = v.github_advisory_id || (v.cves || [])[0] || name;
    const key = `pnpm:${advisoryId}:${name}`;
    addFinding(sev, key);
  }
}

if (tool === 'semgrep') {
  // semgrep JSON: { results: [{ check_id, path, extra: { severity, metadata: { rampart } } }] }
  const results = report.results || [];
  for (const r of results) {
    const rawSev = r.extra?.severity || r.severity || 'WARNING';
    const rampartMeta = r.extra?.metadata?.rampart || '';
    let sev;
    if (rampartMeta === 'CRITICAL' || rawSev === 'ERROR') sev = 'CRITICAL';
    else if (rampartMeta === 'HIGH' || rawSev === 'WARNING') sev = 'HIGH';
    else if (rawSev === 'INFO') sev = 'LOW';
    else sev = 'MEDIUM';
    const filePath = r.path || 'unknown';
    const key = `semgrep:${r.check_id}:${filePath}`;
    addFinding(sev, key);
  }
}

if (tool === 'trivy') {
  // trivy JSON: { Results: [{ Target, Vulnerabilities: [{ VulnerabilityID, PkgName, Severity }], Misconfigurations: [...] }] }
  const results = report.Results || [];
  for (const result of results) {
    for (const vuln of result.Vulnerabilities || []) {
      const sev = (vuln.Severity || 'LOW').toUpperCase();
      const key = `trivy:${vuln.VulnerabilityID}:${vuln.PkgName}`;
      addFinding(sev, key);
    }
    for (const mis of result.Misconfigurations || []) {
      const sev = (mis.Severity || 'LOW').toUpperCase();
      const key = `trivy:${mis.ID}:${result.Target}`;
      addFinding(sev, key);
    }
    for (const sec of result.Secrets || []) {
      const key = `trivy:${sec.RuleID}:${result.Target}`;
      addFinding('CRITICAL', key);
    }
  }
}

if (tool === 'govulncheck') {
  // govulncheck JSON: { findings: [{ osv, trace: [{ function }], ... }] }
  // Any finding = CRITICAL (confirmed exploitable call paths per §3.2)
  const govFindings = report.findings || [];
  for (const f of govFindings) {
    const id = f.osv || f.id || 'unknown';
    const key = `govulncheck:${id}:unknown`;
    addFinding('CRITICAL', key);
  }
}

if (tool === 'hasura') {
  // hasura-audit.js output: { findings: [{ table, severity, check, detail }] }
  const haFindings = report.findings || [];
  for (const f of haFindings) {
    const sev = (f.severity || 'MEDIUM').toUpperCase();
    const key = `hasura:${f.check}:${f.table}`;
    addFinding(sev, key);
  }
}

// ── Output + exit ─────────────────────────────────────────────────────────────
const output = {
  tool,
  enforce: ENFORCE,
  critical: counts.critical,
  high: counts.high,
  medium: counts.medium,
  low: counts.low,
  baselined: counts.baselined,
};

console.log(JSON.stringify(output, null, 2));

// Secrets tool: always blocking regardless of ENFORCE
if (tool === 'semgrep' || tool === 'govulncheck') {
  if (counts.critical > 0) process.exit(1);
}

// §3.2 action table:
//   CRITICAL → always exit 1 (both warn + error mode)
//   HIGH     → exit 1 only in error mode
if (counts.critical > 0) process.exit(1);
if (counts.high > 0 && ENFORCE === 'error') process.exit(1);

process.exit(0);
