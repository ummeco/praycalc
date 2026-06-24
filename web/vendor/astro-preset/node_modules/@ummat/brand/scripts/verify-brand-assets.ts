/**
 * FILE: packages/brand/scripts/verify-brand-assets.ts
 * PURPOSE: Verify every required brand asset exists per app. CI gate for the brand pipeline.
 * INVARIANTS:
 *   - Required per app: logo.svg + all icon sizes (16..1024) + apple-touch + maskable + favicon.ico.
 *   - Exit non-zero with a clear missing-asset report when any asset is absent or zero-byte.
 *   - Idempotent and pure: no writes.
 * REF: T-P7-C-S10-T12
 */

import { existsSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(__dirname, '..')
const APPS = [
  'ummat',
  'praycalc',
  'islamwiki',
  'chatislam',
  'flock',
  'ummatApp',
  'ummatPro',
  'ummatChat',
] as const

const ICON_SIZES = [16, 32, 64, 128, 192, 256, 512, 1024] as const
const REQUIRED_EXTRAS = [
  'apple-touch-icon.png',
  'maskable-icon.png',
  'favicon.ico',
] as const

interface AssetCheck {
  path: string
  required: true
}

function buildChecklist(): Map<string, AssetCheck[]> {
  const out = new Map<string, AssetCheck[]>()
  for (const app of APPS) {
    const checks: AssetCheck[] = [
      { path: join(ROOT, 'assets', app, 'logo.svg'), required: true },
      ...ICON_SIZES.map((s) => ({
        path: join(ROOT, 'assets', app, 'icons', `icon-${s}.png`),
        required: true as const,
      })),
      ...REQUIRED_EXTRAS.map((name) => ({
        path: join(ROOT, 'assets', app, 'icons', name),
        required: true as const,
      })),
    ]
    out.set(app, checks)
  }
  return out
}

function main(): void {
  const list = buildChecklist()
  const missing: Array<{ app: string; path: string; reason: string }> = []

  for (const [app, checks] of list) {
    for (const c of checks) {
      if (!existsSync(c.path)) {
        missing.push({ app, path: c.path, reason: 'missing' })
        continue
      }
      try {
        const s = statSync(c.path)
        if (s.size === 0) missing.push({ app, path: c.path, reason: 'zero-byte' })
      } catch {
        missing.push({ app, path: c.path, reason: 'stat-failed' })
      }
    }
  }

  if (missing.length > 0) {
    console.error(`[brand:verify] FAIL — ${missing.length} asset(s) missing or invalid:`)
    for (const m of missing) {
      console.error(`  [${m.app}] ${m.reason}: ${m.path}`)
    }
    process.exit(1)
  }
  console.log(`[brand:verify] OK — verified ${APPS.length} apps, all assets present.`)
}

main()
