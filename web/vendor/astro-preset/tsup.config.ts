// FILE: tsup.config.ts
// PURPOSE: Dual ESM/CJS + dts build for @ummat/astro-preset.
// REF: P2-E2-W02-S02-T03-A

import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    types: 'src/types.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  // astro is a peer — never bundled
  external: ['astro', '@astrojs/react'],
  target: 'es2022',
});
