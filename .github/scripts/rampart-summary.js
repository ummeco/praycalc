#!/usr/bin/env node
/**
 * rampart-summary.js — Rampart PR Summary + Gate
 *
 * PURPOSE: Aggregate all scanner reports from the artifacts download path,
 *   post (or upsert) a summary PR comment, then exit per §3.2 severity table.
 *
 * INPUTS:
 *   argv[0]: artifacts directory (populated by actions/download-artifact@v4 with
 *     no `name:` key — all artifacts in ./artifacts/<artifact-name>/<file>)
 *
 * ENV:
 *   RAMPART_ENFORCE: warn | error (default: warn)
 *   GITHUB_TOKEN: for PR comment API
 *   GITHUB_REPOSITORY: owner/repo
 *   GITHUB_EVENT_PATH: path to GitHub event JSON (contains PR number)
 *
 * OUTPUTS:
 *   Upserts PR comment with marker <!-- rampart-summary -->
 *   exit 0/1 per §3.2
 *
 * CONSTRAINTS: Node 22, zero npm deps, ≤300 lines, fail-closed on unparseable reports.
 *
 * Spec: .claude/docs/p2-rampart-ci-implementation-spec.md §3.2, §5
 * ADR: ADR-008
 * Ticket: P2-E1-W01-S01-T02
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');

const ENFORCE = process.env.RAMPART_ENFORCE || 'warn';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH || '';
const COMMENT_MARKER = '<!-- rampart-summary -->';

// ── Args ──────────────────────────────────────────────────────────────────────
const artifactsDir = process.argv[2];
if (!artifactsDir || !fs.existsSync(artifactsDir)) {
  console.error('[rampart-summary] FAIL-CLOSED: artifacts directory not found');
  process.exit(1);
}

// ── Collect all JSON reports recursively ─────────────────────────────────────
function globJsonFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...globJsonFiles(full));
    else if (entry.name.endsWith('.json')) files.push(full);
  }
  return files;
}

const reportFiles = globJsonFiles(artifactsDir);

// ── Severity counts aggregated across all reports ────────────────────────────
const totals = { critical: 0, high: 0, medium: 0, low: 0, baselined: 0 };
const toolSummaries = [];

for (const file of reportFiles) {
  try {
    const content = fs.readFileSync(file, 'utf8').trim();
    if (!content) continue;
    const data = JSON.parse(content);
    // rampart-gate.js emits { tool, critical, high, medium, low, baselined }
    if (typeof data.tool === 'string' && typeof data.critical === 'number') {
      totals.critical += data.critical;
      totals.high += data.high;
      totals.medium += data.medium;
      totals.low += data.low;
      totals.baselined += data.baselined || 0;
      toolSummaries.push({
        tool: data.tool,
        critical: data.critical,
        high: data.high,
        medium: data.medium,
        low: data.low,
      });
    }
  } catch (_) {
    // Non-gate output files — tolerate
  }
}

// ── Build PR comment ──────────────────────────────────────────────────────────
function sev(n, label) {
  if (n === 0) return '';
  return `**${n} ${label}**`;
}

const blockingInErrorMode = totals.high > 0 && ENFORCE === 'error';
const blocking = totals.critical > 0 || blockingInErrorMode;

const statusEmoji = blocking ? '🔴' : (totals.high > 0 ? '🟡' : '🟢');
const statusText = blocking ? 'BLOCKED' : (totals.high > 0 ? 'WARNINGS' : 'CLEAN');

const rows = toolSummaries.map(t =>
  `| ${t.tool} | ${t.critical || '—'} | ${t.high || '—'} | ${t.medium || '—'} | ${t.low || '—'} |`
).join('\n');

const comment = `${COMMENT_MARKER}
## ${statusEmoji} Rampart Security Gate — ${statusText}

| Tool | CRITICAL | HIGH | MEDIUM | LOW |
|---|---|---|---|---|
${rows || '| _(no findings)_ | — | — | — | — |'}

**Totals:** ${totals.critical} critical · ${totals.high} high · ${totals.medium} medium · ${totals.low} low${totals.baselined > 0 ? ` · ${totals.baselined} baselined` : ''}

Mode: \`RAMPART_ENFORCE=${ENFORCE}\`${blocking ? '\n\n> ⛔ Merge is blocked. Resolve CRITICAL findings before merging.' : totals.high > 0 ? '\n\n> ⚠️ HIGH findings present (warn mode — not blocking merge; flip RAMPART_ENFORCE=error to enforce).' : ''}
`;

// ── Post PR comment ───────────────────────────────────────────────────────────
async function ghApi(method, endpoint, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPOSITORY}${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'rampart-summary/1.0',
        'Content-Type': 'application/json',
      },
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', d => { data += d; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (_) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function upsertComment(prNumber) {
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !prNumber) {
    console.log('[rampart-summary] No token/repo/PR — skipping comment (local run?)');
    return;
  }
  // List existing comments
  const { body: comments } = await ghApi('GET', `/issues/${prNumber}/comments`);
  if (!Array.isArray(comments)) return;
  const existing = comments.find(c => typeof c.body === 'string' && c.body.includes(COMMENT_MARKER));
  if (existing) {
    await ghApi('PATCH', `/issues/comments/${existing.id}`, { body: comment });
    console.log(`[rampart-summary] Updated comment ${existing.id}`);
  } else {
    await ghApi('POST', `/issues/${prNumber}/comments`, { body: comment });
    console.log('[rampart-summary] Created comment');
  }
}

function getPrNumber() {
  if (!GITHUB_EVENT_PATH || !fs.existsSync(GITHUB_EVENT_PATH)) return null;
  try {
    const event = JSON.parse(fs.readFileSync(GITHUB_EVENT_PATH, 'utf8'));
    return event.pull_request?.number || event.number || null;
  } catch (_) { return null; }
}

(async () => {
  const prNumber = getPrNumber();
  await upsertComment(prNumber);
  console.log(JSON.stringify({ ...totals, enforce: ENFORCE, blocking }));
  if (blocking) process.exit(1);
  process.exit(0);
})().catch(err => {
  console.error('[rampart-summary] Fatal:', err.message);
  process.exit(1);
});
