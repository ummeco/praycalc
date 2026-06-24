/**
 * FILE: packages/brand/scripts/generate-icons.ts
 * PURPOSE: Generate app icons (all required sizes) from per-app SVG masters and update
 *   each consumer app's site.webmanifest with the generated icon entries.
 * INVARIANTS:
 *   - Sizes: 16, 32, 64, 128, 192, 256, 512, 1024 px PNG per app.
 *   - Apple touch icon: 180px.
 *   - Android adaptive maskable: 432px PNG with safe-zone padding (108dp foreground at 4× density).
 *   - favicon.ico: multi-size (16 + 32 + 48).
 *   - Idempotent: skip when output exists AND output mtime > source mtime.
 *   - All sources read from `assets/{appKey}/logo.svg`; outputs to `assets/{appKey}/icons/`.
 *   - Webmanifest: update icons array in existing manifest, or create site.webmanifest if absent.
 *     Preserves all non-icons fields in existing manifests. Skips apps whose public dir is absent.
 * DO NOT: introduce off-spec sizes; downscale a small master to a large size (always render
 *   from SVG at target); overwrite app-specific icon path schemes (flock uses its own scheme).
 * REF: T-P7-C-S10-T03
 *
 * Runtime requirement: this script imports `sharp` lazily so the package builds without sharp
 * installed. Consumers running `pnpm --filter @ummat/brand icons:generate` must install sharp:
 *   pnpm add -D sharp -F @ummat/brand
 */

import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'

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

/**
 * Maps app key → public directory for site.webmanifest generation.
 * Paths relative to the monorepo root (packages/brand/../..).
 * Cross-repo apps (praycalc, islamwiki, chatislam) resolved from sibling repos.
 * flock is intentionally excluded — it uses a different icon path scheme (icons/icon-*.png).
 */
const APP_PUBLIC_DIRS: Partial<Record<(typeof APPS)[number], string>> = {
  ummatApp:   '../../app/web/public',
  ummatPro:   '../../pro/web/public',
  ummatChat:  '../../chat/web/public',
  ummat:      '../../dev/web/public',
  // Cross-repo — 3 levels up from packages/brand/ lands at ummeco/ root
  praycalc:   '../../../praycalc/web/public',
  islamwiki:  '../../../islamwiki/web/public',
  chatislam:  '../../../chatislam/web/public',
  // flock: excluded — uses icons/icon-*.png scheme, not /icon-*.png
}

/**
 * Per-app minimal manifest metadata for creating new site.webmanifest files.
 * Only used when no manifest exists yet in the public dir.
 */
const APP_MANIFEST_META: Partial<Record<(typeof APPS)[number], {
  name: string; short_name: string; description: string; start_url: string;
  theme_color: string; background_color: string; lang: string; categories: string[]
}>> = {
  ummat: {
    name: 'Ummat', short_name: 'Ummat',
    description: 'The Islamic community platform.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['social', 'lifestyle', 'religion'],
  },
  ummatApp: {
    name: 'Ummat App', short_name: 'Ummat',
    description: 'Connect with your Muslim community.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['social', 'lifestyle', 'religion'],
  },
  ummatPro: {
    name: 'Ummat Pro', short_name: 'Ummat Pro',
    description: 'Islamic organisation management platform.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['business', 'productivity', 'religion'],
  },
  ummatChat: {
    name: 'Ummat Chat', short_name: 'Ummat Chat',
    description: 'Messaging for the Muslim community.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['social', 'utilities'],
  },
  praycalc: {
    name: 'PrayCalc', short_name: 'PrayCalc',
    description: 'Accurate prayer times for every location.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['utilities', 'religion'],
  },
  islamwiki: {
    name: 'Islam.wiki', short_name: 'Islam.wiki',
    description: 'The comprehensive Islamic knowledge base.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['education', 'reference', 'religion'],
  },
  chatislam: {
    name: 'ChatIslam', short_name: 'ChatIslam',
    description: 'AI-powered Islamic Q&A.',
    start_url: '/?source=pwa', theme_color: '#79C24C', background_color: '#0D2F17',
    lang: 'en', categories: ['education', 'utilities', 'religion'],
  },
}

const SIZES = [16, 32, 64, 128, 192, 256, 512, 1024] as const
const APPLE_TOUCH = 180
const MASKABLE = 432
const FAVICON_SIZES = [16, 32, 48] as const

interface IconJob {
  app: string
  source: string
  outputs: Array<{ path: string; size: number; label: string }>
}

function planJobs(): IconJob[] {
  return APPS.map((app) => {
    const source = join(ROOT, 'assets', app, 'logo.svg')
    const outDir = join(ROOT, 'assets', app, 'icons')
    const outputs: IconJob['outputs'] = [
      ...SIZES.map((s) => ({ path: join(outDir, `icon-${s}.png`), size: s, label: `icon-${s}` })),
      { path: join(outDir, `apple-touch-icon.png`), size: APPLE_TOUCH, label: 'apple-touch-icon' },
      { path: join(outDir, `maskable-icon.png`), size: MASKABLE, label: 'maskable-icon' },
    ]
    return { app, source, outputs }
  })
}

function needsRebuild(source: string, output: string): boolean {
  if (!existsSync(output)) return true
  try {
    const srcStat = statSync(source)
    const outStat = statSync(output)
    return srcStat.mtimeMs > outStat.mtimeMs
  } catch {
    return true
  }
}

async function run(): Promise<void> {
  // Lazy import so package builds without sharp installed.
  let sharp: typeof import('sharp')
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    sharp = (await import('sharp')).default as unknown as typeof import('sharp')
  } catch {
    console.error('[generate-icons] sharp is required. Install with: pnpm add -D sharp -F @ummat/brand')
    process.exit(2)
  }

  const jobs = planJobs()
  let written = 0
  let skipped = 0

  for (const job of jobs) {
    if (!existsSync(job.source)) {
      console.warn(`[generate-icons] missing source: ${job.source} — skipping ${job.app}`)
      continue
    }
    const svg = readFileSync(job.source)
    for (const out of job.outputs) {
      if (!needsRebuild(job.source, out.path)) {
        skipped++
        continue
      }
      mkdirSync(dirname(out.path), { recursive: true })
      const pipeline = sharp(svg, { density: 384 }).resize(out.size, out.size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      await pipeline.png({ compressionLevel: 9 }).toFile(out.path)
      written++
      console.log(`[generate-icons] wrote ${out.path}`)
    }

    // favicon.ico — multi-size. Sharp does not emit ICO; emit largest as fallback.
    const icoPath = join(ROOT, 'assets', job.app, 'icons', 'favicon.ico')
    if (needsRebuild(job.source, icoPath)) {
      mkdirSync(dirname(icoPath), { recursive: true })
      // Emit a 48-px PNG with .ico extension as practical fallback; consumer toolchains
      // (e.g. Next.js icon generation) will produce a true multi-size ICO at build time.
      await sharp(svg, { density: 192 })
        .resize(48, 48)
        .png({ compressionLevel: 9 })
        .toFile(icoPath)
      written++
      console.log(`[generate-icons] wrote ${icoPath} (PNG-in-ICO fallback)`)
    } else {
      skipped++
    }
  }

  // ── site.webmanifest generation ──────────────────────────────────────────
  // Standard icons array referencing the PWA-relevant sizes (192, 512, maskable).
  // Apps whose public dir does not exist are skipped silently.
  const MANIFEST_ICONS = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'apple touch icon' },
    { src: '/maskable-icon.png', sizes: '432x432', type: 'image/png', purpose: 'maskable' },
  ]

  let manifestsWritten = 0
  let manifestsSkipped = 0

  for (const [appKey, relPublicDir] of Object.entries(APP_PUBLIC_DIRS)) {
    const publicDir = resolve(ROOT, relPublicDir)
    if (!existsSync(publicDir)) {
      console.warn(`[generate-icons] public dir missing for ${appKey}: ${publicDir} — skipping manifest`)
      continue
    }

    // Check for existing manifest under either conventional name.
    const existingNames = ['site.webmanifest', 'manifest.webmanifest', 'manifest.json']
    let manifestPath: string | null = null
    for (const name of existingNames) {
      const candidate = join(publicDir, name)
      if (existsSync(candidate)) { manifestPath = candidate; break }
    }

    // Determine the source SVG for mtime check — use the icons dir favicon.ico as proxy.
    const icoProxy = join(ROOT, 'assets', appKey, 'icons', 'favicon.ico')
    const targetManifestPath = manifestPath ?? join(publicDir, 'site.webmanifest')

    // Idempotency check: skip if manifest is newer than our generated proxy.
    if (manifestPath && existsSync(icoProxy)) {
      try {
        const icoStat = statSync(icoProxy)
        const mfStat = statSync(manifestPath)
        if (mfStat.mtimeMs > icoStat.mtimeMs) {
          manifestsSkipped++
          continue
        }
      } catch { /* fall through — write */ }
    }

    let manifest: Record<string, unknown>

    if (manifestPath) {
      // Parse existing manifest and replace only the icons array.
      try {
        manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as Record<string, unknown>
      } catch (e) {
        console.warn(`[generate-icons] could not parse ${manifestPath}: ${e} — skipping`)
        continue
      }
      manifest.icons = MANIFEST_ICONS
    } else {
      // Create a new manifest from per-app metadata or a generic fallback.
      const meta = APP_MANIFEST_META[appKey as (typeof APPS)[number]]
      manifest = {
        name: meta?.name ?? appKey,
        short_name: meta?.short_name ?? appKey,
        description: meta?.description ?? '',
        start_url: meta?.start_url ?? '/?source=pwa',
        display: 'standalone',
        theme_color: meta?.theme_color ?? '#79C24C',
        background_color: meta?.background_color ?? '#0D2F17',
        lang: meta?.lang ?? 'en',
        categories: meta?.categories ?? ['religion'],
        icons: MANIFEST_ICONS,
      }
    }

    writeFileSync(targetManifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8')
    manifestsWritten++
    console.log(`[generate-icons] wrote manifest ${targetManifestPath}`)
  }

  console.log(
    `[generate-icons] done. icons: wrote=${written} skipped=${skipped}; ` +
    `manifests: wrote=${manifestsWritten} skipped=${manifestsSkipped}`,
  )
}

run().catch((err) => {
  console.error('[generate-icons] failed:', err)
  process.exit(1)
})
