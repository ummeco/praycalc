#!/usr/bin/env node
/**
 * rampart-issue.js — Rampart Nightly Issue Filing
 *
 * PURPOSE: Create or append to a GitHub issue titled "Rampart nightly: <date>"
 *   labeled rampart-crit / rampart-high. Deduplicates by title.
 *   Fires when blocking == 'true' from the aggregate step.
 *
 * ENV:
 *   GITHUB_TOKEN: required
 *   GITHUB_REPOSITORY: owner/repo
 *   RAMPART_CRIT_COUNT: number from aggregate step output
 *   RAMPART_HIGH_COUNT: number from aggregate step output
 *
 * CONSTRAINTS: Node 22, zero npm deps, ≤300 lines.
 *
 * Spec: .claude/docs/p2-rampart-ci-implementation-spec.md §3.4
 * ADR: ADR-008
 * Ticket: P2-E1-W01-S01-T02
 */

'use strict';

const https = require('node:https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const critCount = parseInt(process.env.RAMPART_CRIT_COUNT || '0', 10);
const highCount = parseInt(process.env.RAMPART_HIGH_COUNT || '0', 10);

if (!GITHUB_TOKEN || !GITHUB_REPOSITORY) {
  console.error('[rampart-issue] GITHUB_TOKEN and GITHUB_REPOSITORY are required');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const issueTitle = `Rampart nightly: ${today}`;

const labels = [];
if (critCount > 0) labels.push('rampart-crit');
if (highCount > 0) labels.push('rampart-high');

const body = `## Rampart Nightly Scan — ${today}

| Severity | Count |
|---|---|
| CRITICAL | ${critCount} |
| HIGH | ${highCount} |

**Action required:**
- CRITICAL findings block PRs immediately — resolve before next push.
- HIGH findings block PRs in \`error\` mode. Triage and baseline or fix within 1 sprint.

See workflow run artifacts for full reports.
Spec: ADR-008 · \`.claude/docs/p2-rampart-ci-implementation-spec.md\`
`;

async function ghApi(method, endpoint, payload) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPOSITORY}${endpoint}`,
      method,
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'rampart-issue/1.0',
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
      let buf = '';
      res.on('data', c => { buf += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(buf) }); }
        catch (_) { resolve({ status: res.statusCode, body: buf }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function ensureLabels() {
  for (const label of labels) {
    const { status } = await ghApi('GET', `/labels/${encodeURIComponent(label)}`);
    if (status === 404) {
      const color = label === 'rampart-crit' ? 'd93f0b' : 'e4e669';
      await ghApi('POST', '/labels', { name: label, color, description: `Rampart security finding: ${label}` });
      console.log(`[rampart-issue] Created label: ${label}`);
    }
  }
}

async function findExistingIssue() {
  const { body } = await ghApi('GET', `/issues?state=open&labels=${labels.join(',')}&per_page=50`);
  if (!Array.isArray(body)) return null;
  return body.find(i => i.title === issueTitle) || null;
}

(async () => {
  await ensureLabels();
  const existing = await findExistingIssue();

  if (existing) {
    // Append a comment to the existing issue
    const appendBody = `### Update ${new Date().toISOString()}\n\n${critCount} CRITICAL · ${highCount} HIGH found in nightly scan.`;
    await ghApi('POST', `/issues/${existing.number}/comments`, { body: appendBody });
    console.log(`[rampart-issue] Appended to existing issue #${existing.number}`);
  } else {
    const { status, body: issue } = await ghApi('POST', '/issues', {
      title: issueTitle,
      body,
      labels,
    });
    if (status === 201) {
      console.log(`[rampart-issue] Created issue #${issue.number}: ${issue.html_url}`);
    } else {
      console.error(`[rampart-issue] Failed to create issue: ${status}`, issue);
      process.exit(1);
    }
  }
  process.exit(0);
})().catch(err => {
  console.error('[rampart-issue] Fatal:', err.message);
  process.exit(1);
});
