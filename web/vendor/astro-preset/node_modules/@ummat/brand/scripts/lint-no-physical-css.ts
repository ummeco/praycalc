#!/usr/bin/env tsx
/**
 * @ummat/brand — no-physical-css linter (T-P7-Q-RTL-08)
 *
 * Detects physical (LTR-hardcoded) CSS directional properties in TypeScript,
 * TSX, and CSS source files. RTL layout requires logical properties so that
 * LTR ↔ RTL switching works automatically via `dir` attribute or `[dir="rtl"]`.
 *
 * Physical → logical replacement table:
 *   ml-*          → ms-*  (margin-inline-start)
 *   mr-*          → me-*  (margin-inline-end)
 *   pl-*          → ps-*  (padding-inline-start)
 *   pr-*          → pe-*  (padding-inline-end)
 *   text-left     → text-start
 *   text-right    → text-end
 *   left-*        → start-*   (position)
 *   right-*       → end-*     (position)
 *   border-l*     → border-s* (border-inline-start)
 *   border-r*     → border-e* (border-inline-end)
 *   rounded-l-*   → rounded-s-*
 *   rounded-r-*   → rounded-e-*
 *   inset-l-*     → inset-s-*   (CSS logical inset)
 *   inset-r-*     → inset-e-*
 *
 * Intentional exceptions (not RTL-flipped by design):
 *   - margin-left/right on flex items that are intentionally directional in layout
 *   - border-l/r used as decorative accents that don't flip (declare with allowlist comment)
 *
 * Usage:
 *   pnpm brand:lint-rtl                   # scan all web app src/, warn mode
 *   pnpm brand:lint-rtl --error           # exit 1 on violation (CI gate)
 *   pnpm brand:lint-rtl --dir <path>      # scan specific directory
 *   pnpm brand:lint-rtl --ext tsx,ts,css  # limit to extensions
 *
 * Allowlist inline comment:
 *   Add `// rtl:ignore` on the same line to suppress a specific violation:
 *   <div className="ml-4"> // rtl:ignore — intentional for icon-only layout
 *
 * Exit codes:
 *   0 — clean (or warn mode)
 *   1 — violations in error mode
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, extname, relative } from 'node:path'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

/** Source directories to scan (relative to monorepo root). */
const SCAN_DIRS: string[] = [
  'pro/web/src',
  'app/web/src',
  'chat/web/src',
  'dev/web/src',
  'dev/base/src',
]

/** File extensions to check. */
const SCAN_EXTENSIONS: ReadonlySet<string> = new Set(['.tsx', '.ts', '.css'])

/**
 * Physical CSS patterns with replacement suggestions.
 * Patterns are matched as whole class tokens or CSS property names.
 */
interface PhysicalPattern {
  name: string
  /** Regex that fires on the line. Group 1 = the matched class/property. */
  pattern: RegExp
  suggestion: string
}

const PHYSICAL_PATTERNS: PhysicalPattern[] = [
  // Tailwind margin
  { name: 'margin-left (ml-)',      pattern: /\bml-(\w+)/,         suggestion: 'ms-$1 (margin-inline-start)' },
  { name: 'margin-right (mr-)',     pattern: /\bmr-(\w+)/,         suggestion: 'me-$1 (margin-inline-end)' },
  // Tailwind padding
  { name: 'padding-left (pl-)',     pattern: /\bpl-(\w+)/,         suggestion: 'ps-$1 (padding-inline-start)' },
  { name: 'padding-right (pr-)',    pattern: /\bpr-(\w+)/,         suggestion: 'pe-$1 (padding-inline-end)' },
  // Tailwind text alignment
  { name: 'text-left',             pattern: /\btext-left\b/,       suggestion: 'text-start' },
  { name: 'text-right',            pattern: /\btext-right\b/,      suggestion: 'text-end' },
  // Tailwind positioning
  { name: 'left- (position)',      pattern: /\bleft-(\w+)/,        suggestion: 'start-$1 (inset-inline-start)' },
  { name: 'right- (position)',     pattern: /\bright-(\w+)/,       suggestion: 'end-$1 (inset-inline-end)' },
  // Tailwind border
  { name: 'border-l (border-s)',   pattern: /\bborder-l(-\w+)?/,  suggestion: 'border-s$1 (border-inline-start)' },
  { name: 'border-r (border-e)',   pattern: /\bborder-r(-\w+)?/,  suggestion: 'border-e$1 (border-inline-end)' },
  // Tailwind rounded
  { name: 'rounded-l (rounded-s)', pattern: /\brounded-l(-\w+)?/, suggestion: 'rounded-s$1 (logical)' },
  { name: 'rounded-r (rounded-e)', pattern: /\brounded-r(-\w+)?/, suggestion: 'rounded-e$1 (logical)' },
  // CSS properties in .css files
  { name: 'CSS margin-left',       pattern: /\bmargin-left\s*:/,   suggestion: 'margin-inline-start:' },
  { name: 'CSS margin-right',      pattern: /\bmargin-right\s*:/,  suggestion: 'margin-inline-end:' },
  { name: 'CSS padding-left',      pattern: /\bpadding-left\s*:/,  suggestion: 'padding-inline-start:' },
  { name: 'CSS padding-right',     pattern: /\bpadding-right\s*:/, suggestion: 'padding-inline-end:' },
  { name: 'CSS text-align: left',  pattern: /text-align\s*:\s*left/, suggestion: 'text-align: start' },
  { name: 'CSS text-align: right', pattern: /text-align\s*:\s*right/, suggestion: 'text-align: end' },
]

const IGNORE_COMMENT = /\/\/\s*rtl:ignore|\/\*\s*rtl:ignore\s*\*\//

interface Violation {
  file: string
  line: number
  lineText: string
  pattern: string
  suggestion: string
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

function lintFile(filePath: string): Violation[] {
  let content: string
  try {
    content = readFileSync(filePath, 'utf-8')
  } catch {
    return []
  }

  const violations: Violation[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (IGNORE_COMMENT.test(line)) continue

    for (const { name, pattern, suggestion } of PHYSICAL_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: filePath,
          line: i + 1,
          lineText: line.trim().slice(0, 120),
          pattern: name,
          suggestion,
        })
        break // one violation per line — avoid duplicate reporting
      }
    }
  }

  return violations
}

function walkDir(dir: string, extensions: ReadonlySet<string>): string[] {
  const results: string[] = []
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return results
  }
  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue
    const full = join(dir, entry)
    let stat
    try {
      stat = statSync(full)
    } catch {
      continue
    }
    if (stat.isDirectory()) {
      results.push(...walkDir(full, extensions))
    } else if (extensions.has(extname(entry))) {
      results.push(full)
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2)
  const errorMode = args.includes('--error')
  const dirIdx = args.indexOf('--dir')
  const customDir = dirIdx !== -1 ? args[dirIdx + 1] : null
  const extIdx = args.indexOf('--ext')
  const extArg = extIdx !== -1 ? args[extIdx + 1] : null

  const extensions: ReadonlySet<string> = extArg
    ? new Set(extArg.split(',').map((e) => (e.startsWith('.') ? e : `.${e}`)))
    : SCAN_EXTENSIONS

  const monorepoRoot = resolve(import.meta.dirname ?? __dirname, '../../..')

  let files: string[]
  if (customDir) {
    files = walkDir(resolve(customDir), extensions)
  } else {
    files = SCAN_DIRS.flatMap((d) => walkDir(join(monorepoRoot, d), extensions))
  }

  if (files.length === 0) {
    console.warn('[brand:lint-rtl] No source files found — check SCAN_DIRS.')
    process.exit(0)
  }

  const allViolations: Violation[] = []
  for (const f of files) {
    allViolations.push(...lintFile(f))
  }

  if (allViolations.length === 0) {
    console.log(
      `[brand:lint-rtl] ✓ ${files.length} file(s) scanned — no physical CSS directional properties found.`,
    )
    process.exit(0)
  }

  const label = errorMode ? 'ERROR' : 'WARN'
  console.error(
    `[brand:lint-rtl] ${label}: ${allViolations.length} physical CSS violation(s) in ${files.length} file(s):\n`,
  )
  for (const { file, line, lineText, pattern, suggestion } of allViolations) {
    const relPath = relative(monorepoRoot, file)
    console.error(`  ${relPath}:${line}`)
    console.error(`    pattern:  ${pattern}`)
    console.error(`    fix:      replace with ${suggestion}`)
    console.error(`    source:   ${lineText}`)
    console.error(`    suppress: add // rtl:ignore on this line if intentional`)
    console.error()
  }

  if (errorMode) {
    console.error(
      `[brand:lint-rtl] Replace physical CSS with logical equivalents. See docs/standards/rtl-logical-css.md`,
    )
    process.exit(1)
  } else {
    console.warn(
      `[brand:lint-rtl] Running in warn mode — pass --error to make CI fail on violations.`,
    )
    process.exit(0)
  }
}

main()
