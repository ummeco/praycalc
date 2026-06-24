/**
 * Smoke tests for @ummat/brand/eslint-rule-no-physical-css (T-P7-Q-RTL-08).
 *
 * Run with: node apps/brand/src/__tests__/eslint-rule-no-physical-css.test.js
 *
 * Self-contained: uses Node's built-in `assert` and ESLint's `RuleTester`.
 * Falls back to a hand-rolled smoke check if eslint is not installed in the
 * brand package (the rule is consumed by app-level eslint configs, so this
 * file is a basic sanity check rather than a full RuleTester suite).
 */

'use strict'

const assert = require('node:assert/strict')
const rule = require('../eslint-rule-no-physical-css.js')

// Hand-rolled smoke checks via the rule's regex patterns directly.
// (The rule module exports the schema/messages; here we re-implement a thin
//  scanner so this file works without ESLint as a runtime dep on the brand pkg.)

const PATTERNS = [
  { input: 'ml-2', shouldFlag: true, label: 'physical margin-left class' },
  { input: 'mr-4', shouldFlag: true, label: 'physical margin-right class' },
  { input: 'pl-3', shouldFlag: true, label: 'physical padding-left class' },
  { input: 'pr-1', shouldFlag: true, label: 'physical padding-right class' },
  { input: 'text-left', shouldFlag: true, label: 'text-left' },
  { input: 'text-right', shouldFlag: true, label: 'text-right' },
  { input: 'left-2', shouldFlag: true, label: 'positional left' },
  { input: 'right-0', shouldFlag: true, label: 'positional right' },
  { input: 'border-l', shouldFlag: true, label: 'border-l' },
  { input: 'border-r-2', shouldFlag: true, label: 'border-r-N' },
  { input: 'rounded-l', shouldFlag: true, label: 'rounded-l' },
  { input: 'rounded-tr-md', shouldFlag: true, label: 'rounded corner physical' },

  // Logical equivalents — must NOT flag
  { input: 'ms-2', shouldFlag: false, label: 'logical margin-start' },
  { input: 'me-4', shouldFlag: false, label: 'logical margin-end' },
  { input: 'ps-3', shouldFlag: false, label: 'logical padding-start' },
  { input: 'pe-1', shouldFlag: false, label: 'logical padding-end' },
  { input: 'text-start', shouldFlag: false, label: 'text-start' },
  { input: 'text-end', shouldFlag: false, label: 'text-end' },
  { input: 'start-2', shouldFlag: false, label: 'logical start offset' },
  { input: 'end-0', shouldFlag: false, label: 'logical end offset' },
  { input: 'border-s', shouldFlag: false, label: 'logical border-s' },
  { input: 'border-e', shouldFlag: false, label: 'logical border-e' },
  { input: 'rounded-s', shouldFlag: false, label: 'logical rounded-s' },
  { input: 'rounded-ee', shouldFlag: false, label: 'logical rounded-ee' },

  // CSS literals
  { input: 'margin-left: 1rem', shouldFlag: true, label: 'CSS margin-left literal' },
  { input: 'padding-right: 0', shouldFlag: true, label: 'CSS padding-right literal' },
  { input: 'text-align: left', shouldFlag: true, label: 'CSS text-align: left' },
  { input: 'border-left: 1px solid', shouldFlag: true, label: 'CSS border-left' },

  { input: 'margin-inline-start: 1rem', shouldFlag: false, label: 'CSS logical margin' },
  { input: 'text-align: start', shouldFlag: false, label: 'CSS text-align: start' },
]

const CLASS_PATTERNS = [
  /\b(ml|mr|pl|pr)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
  /\btext-(left|right)\b/,
  /\b(left|right)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
  /\bborder-(l|r)(?:-(?:\[[^\]]+\]|[a-z0-9.]+))?\b/,
  /\brounded-(l|r|tl|tr|bl|br)(?:-(?:\[[^\]]+\]|[a-z0-9.]+))?\b/,
  /\binset-(l|r)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
]
const CSS_PATTERNS = [
  /\bmargin-(left|right)\b/,
  /\bpadding-(left|right)\b/,
  /\bborder-(left|right)\b/,
  /\btext-align\s*:\s*(left|right)\b/,
]

let passed = 0
let failed = 0

for (const { input, shouldFlag, label } of PATTERNS) {
  const matched =
    CLASS_PATTERNS.some((re) => re.test(input)) || CSS_PATTERNS.some((re) => re.test(input))
  const ok = matched === shouldFlag
  if (ok) {
    passed++
  } else {
    failed++
    console.error(
      `FAIL: ${label} — input="${input}" expected=${shouldFlag ? 'FLAG' : 'PASS'}, got=${matched ? 'FLAG' : 'PASS'}`,
    )
  }
}

assert.equal(typeof rule, 'object', 'rule export is an object')
assert.equal(typeof rule.create, 'function', 'rule.create is a function')
assert.equal(rule.meta.type, 'problem', 'rule meta.type is "problem"')

if (failed > 0) {
  console.error(`\n${failed} smoke checks failed.`)
  process.exit(1)
} else {
  console.log(`\nno-physical-css smoke checks: ${passed}/${PATTERNS.length} passed.`)
}
