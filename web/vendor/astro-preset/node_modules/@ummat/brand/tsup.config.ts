/**
 * FILE: packages/brand/tsup.config.ts
 * PURPOSE: Dual-build (ESM + CJS) entry config for @ummat/brand.
 * INVARIANTS:
 *   - Both ESM (.mjs) and CJS (.cjs) outputs required for monorepo consumers.
 *   - dts generation must produce ./dist/index.d.ts plus per-entry .d.ts files.
 *   - No external bundling of tailwindcss (it is a peer dep).
 * DO NOT: bundle tailwindcss; ship sourcemaps in production releases.
 * REF: T-P7-C-S10-01 (sprint-C-S10-brand-aso.md) · T-BUILD-04 (sprint-Q-BUILD.md)
 */
import { defineConfig } from 'tsup'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'tokens/index': 'src/tokens/index.ts',
    'tailwind-preset': 'src/tailwind-preset.ts',
    'themes/index': 'src/themes/index.ts',
    seasonal: 'src/seasonal.ts',
    'apps/praycalc': 'src/apps/praycalc.ts',
    'apps/islamwiki': 'src/apps/islamwiki.ts',
    'apps/chatislam': 'src/apps/chatislam.ts',
    'apps/flock': 'src/apps/flock.ts',
    'apps/ummatApp': 'src/apps/ummatApp.ts',
    'apps/ummatPro': 'src/apps/ummatPro.ts',
    'apps/ummatChat': 'src/apps/ummatChat.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: isDev ? 'inline' : false,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ['tailwindcss'],
  outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.cjs' }),
})
