// FILE: vitest.config.ts
// PURPOSE: Vitest config for @ummat/astro-preset.
// REF: P2-E2-W02-S02-T03-A

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    globals: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/**',
        'dist/**',
        '**/*.test.ts',
        '**/__tests__/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 70,
        branches: 60,
        functions: 70,
        statements: 70,
      },
      reportOnFailure: true,
    },
  },
});
