# @ummat/brand

**Single source of truth for Ummat ecosystem brand assets.** This is the ONLY `@ummat/brand` package in the workspace — the legacy `apps/brand` was consolidated here by P8 sprint STACK-BRAND-DEDUP (2026-05-16). Future workspace collisions are blocked by `scripts/check-workspace-collisions.mjs` and the `workspace-collision-check.yml` CI gate.

Design tokens, logos, Tailwind preset, seasonal themes, ESLint rules, per-app brand config, and the press-kit pipeline all live here. Ported and expanded from Phase 6 Sprint 10 work as `T-P7-C-S10-01`.

## Export surface (selected)

- `@ummat/brand` — tokens, themes, seasonal, apps, tailwind preset (programmatic)
- `@ummat/brand/css` — raw CSS bundle (use in `globals.css` via `@import`)
- `@ummat/brand/tailwind-preset` — Tailwind v3 preset
- `@ummat/brand/tokens/<app>` — per-app CSS theme files (praycalc, islamwiki, chatislam, ummat-app, ummat-pro, ummat-dev, ummat-chat, flock)
- `@ummat/brand/themes/dark-mode` — dark-mode CSS
- `@ummat/brand/eslint-rule-no-brand-light-on-light` — ESLint plugin rule
- `@ummat/brand/eslint-rule-no-physical-css` — ESLint plugin rule

See `package.json` `exports` for the full subpath list.

## Install (workspace)

```bash
pnpm add @ummat/brand -F <your-app>
```

The package is `private: true`. It is consumed only inside this monorepo.

## Usage

### Tokens

```ts
import { tokens, green, semantic } from '@ummat/brand'

tokens.colors.green[400]     // #79C24C
green[500]                    // #5A9438 (AA-contrast on light bg)
semantic.brand                // #79C24C
```

### Per-app brand config

```ts
import { praycalc } from '@ummat/brand/apps/praycalc'
import { brands } from '@ummat/brand'

praycalc.appName            // 'PrayCalc'
praycalc.primaryColor       // '#79C24C'
brands.flock.dbPrefix       // 'fl_'   (D-P3-19 canonical)
```

### Tailwind preset (v3.3+)

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'
import { ummatBrandPreset } from '@ummat/brand/tailwind-preset'

export default {
  presets: [ummatBrandPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config
```

Tailwind v4 consumers (currently `pro/web`, `app/web`) configure via `@theme` in `globals.css`. See `packages/shared/tailwind/preset.ts` for the v4 path.

### Seasonal themes

```ts
import { getActiveTheme, getTheme } from '@ummat/brand'

const themeName = getActiveTheme({ year: 1447, month: 9, day: 15 })  // 'ramadan'
const theme = getTheme(themeName)
// apply theme.cssVars to :root
```

Activation windows (Hijri):
- Muharram 1-10 → `muharram`
- Ramadan 1-29 → `ramadan`
- Shawwal 1-3 → `eid`
- Dhul Hijjah 1-13 → `dhul-hijjah`
- otherwise → `default`

### Logos

Master SVGs live at `assets/{appKey}/logo.svg`. Rendered PNG sizes are generated:

```bash
pnpm --filter @ummat/brand icons:generate
```

This requires `sharp` (peer install): `pnpm add -D sharp -F @ummat/brand`.

### Press kit

```bash
pnpm --filter @ummat/brand press:zip
```

Requires `archiver`: `pnpm add -D archiver @types/archiver -F @ummat/brand`. Output goes to `dist-press/ummat-press-kit-YYYY-MM-DD.zip`.

## CI verification

`brand:verify` script enforces that every required asset exists. Wired in `.github/workflows/brand-verify.yml`. Failure produces a per-app diff of missing assets.

```bash
pnpm --filter @ummat/brand brand:verify
```

## Build

```bash
pnpm --filter @ummat/brand build
```

Emits dual ESM + CJS bundles plus `.d.ts` per entry point under `dist/`.

## Adding a new app

1. Add `src/apps/<key>.ts` matching `BrandConfig`.
2. Re-export from `src/apps/index.ts`.
3. Add to `tsup.config.ts` `entry` map.
4. Add to `package.json` `exports`.
5. Drop a master `assets/<key>/logo.svg`.
6. Add the key to `scripts/generate-icons.ts` and `scripts/verify-brand-assets.ts` `APPS` arrays.
7. Run `pnpm --filter @ummat/brand icons:generate && pnpm --filter @ummat/brand brand:verify`.

## Color palette (LOCKED)

| Token | Hex | Use |
| --- | --- | --- |
| `green[50]` | `#F4FBE8` | Wash / hover |
| `green[100]` | `#C9F27A` | Light accent |
| `green[400]` | `#79C24C` | Primary brand |
| `green[500]` | `#5A9438` | Primary on light bg (AA) |
| `green[700]` | `#1E5E2F` | Dark / body text |
| `green[900]` | `#0D2F17` | Deep / dark backgrounds |

Changes to these values require a STORM-approved brand decision. Do not edit.
