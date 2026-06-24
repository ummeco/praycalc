/**
 * vitest.config.ts — Vitest configuration for praycalc/web (Astro 5).
 *
 * PURPOSE: Unit/integration test runner for praycalc web app.
 *   Alias @/ → src/ to match Astro vite config (@/ = /src).
 *   Excludes e2e tests and legacy Next.js paths.
 * REF: P2-E3-W02-S02-T03
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    exclude: [
      'node_modules/**',
      '__tests__/e2e/**',
      // astro-preset vendored package ships its own tsconfig/test setup — out of app scope.
      'vendor/astro-preset/**',
      // Legacy pre-migration root lib/ (Next.js) — excluded from tsconfig/eslint too.
      'lib/**',
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**/*.ts', 'src/islands/**/*.tsx'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        // Server-only files that require Node.js runtime — not testable in jsdom
        'src/lib/geo.server.ts',
        'src/lib/data-lookup.server.ts',
        'src/lib/prayers.server.ts',
        // Browser geolocation API — requires navigator.geolocation not in jsdom
        'src/lib/geo.ts',
        // Large prayer calculation engine — server-side only via pray-calc package
        'src/lib/top-cities.ts',
      ],
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70,
        perFile: false,
      },
      reportOnFailure: true,
    },
  },
  resolve: {
    alias: {
      // Match astro.config.ts: @ → /src
      '@': path.resolve(__dirname, './src'),
    },
  },
});
