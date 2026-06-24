/**
 * FILE: packages/brand/vitest.config.ts
 * PURPOSE: Vitest config for @ummat/brand. Node environment, fast unit tests only.
 * REF: T-P7-C-S10-01
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['node_modules/**', 'dist/**', '**/*.test.ts', '**/__mocks__/**', '**/*.d.ts', 'src/index.ts'],
      // P7 Q-TEST T01 baseline thresholds (80/80/75/80, perFile: true).
      thresholds: { lines: 80, functions: 80, branches: 75, statements: 80, perFile: true },
      reportOnFailure: true,
    },
  },
})
