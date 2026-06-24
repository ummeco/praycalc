/**
 * FILE: packages/brand/scripts/build-press-kit-zip.ts
 * PURPOSE: Bundle the Ummat press kit into a dated ZIP for distribution.
 * INVARIANTS:
 *   - Output name: `ummat-press-kit-{YYYY-MM-DD}.zip`.
 *   - Includes: press-kit.md, logos (SVG + PNG), brand-guide.md, all per-app SVG masters.
 *   - Pure assembly: never modifies source assets.
 * REF: T-P7-C-S10-T11
 *
 * Runtime requirement: lazy-imports `archiver`. Install with:
 *   pnpm add -D archiver @types/archiver -F @ummat/brand
 */

import { createWriteStream, existsSync, mkdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(__dirname, '..')
const PROJECT_ROOT = resolve(ROOT, '..', '..')

const SVG_LOGOS = [
  'assets/ummat/logo.svg',
  'assets/praycalc/logo.svg',
  'assets/islamwiki/logo.svg',
  'assets/chatislam/logo.svg',
  'assets/flock/logo.svg',
  'assets/ummatApp/logo.svg',
  'assets/ummatPro/logo.svg',
  'assets/ummatChat/logo.svg',
]

const DOCS = [
  // Repo-rooted paths (relative to ummat/).
  '.github/docs/press/press-kit.md',
  '.github/docs/brand/brand-guide.md',
]

async function main(): Promise<void> {
  // archiver v8 uses class-based API — ZipArchive for ZIP format (no default factory).
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  let ZipArchiveCls: new (opts: object) => import('archiver').Archiver
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const archiverModule = require('archiver') as { ZipArchive: typeof ZipArchiveCls }
    ZipArchiveCls = archiverModule.ZipArchive
  } catch {
    console.error('[press:zip] archiver is required. Install: pnpm add -D archiver @types/archiver -F @ummat/brand')
    process.exit(2)
  }

  const today = new Date().toISOString().slice(0, 10)
  const outDir = join(ROOT, 'dist-press')
  mkdirSync(outDir, { recursive: true })
  const outPath = join(outDir, `ummat-press-kit-${today}.zip`)

  const output = createWriteStream(outPath)
  const archive = new ZipArchiveCls({ zlib: { level: 9 } })

  archive.on('error', (err) => {
    throw err
  })
  archive.pipe(output)

  let added = 0
  for (const rel of SVG_LOGOS) {
    const abs = join(ROOT, rel)
    if (existsSync(abs)) {
      archive.file(abs, { name: `logos/${rel.replace('assets/', '')}` })
      added++
    } else {
      console.warn(`[press:zip] missing: ${abs}`)
    }
  }
  for (const rel of DOCS) {
    const abs = join(PROJECT_ROOT, rel)
    if (existsSync(abs)) {
      archive.file(abs, { name: rel.split('/').pop()! })
      added++
    } else {
      console.warn(`[press:zip] missing doc: ${abs}`)
    }
  }

  await archive.finalize()
  await new Promise<void>((resolveFn, rejectFn) => {
    output.on('close', () => resolveFn())
    output.on('error', rejectFn)
  })

  const size = statSync(outPath).size
  console.log(`[press:zip] wrote ${outPath} (${added} files, ${size} bytes)`)
}

main().catch((err) => {
  console.error('[press:zip] failed:', err)
  process.exit(1)
})
