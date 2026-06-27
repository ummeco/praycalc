/**
 * eslint.config.mjs — ESLint flat config for praycalc/org (Astro 5).
 *
 * PURPOSE: Lint Astro, TSX, TS files. Uses eslint-plugin-astro for .astro support,
 *   jsx-a11y for accessibility, @typescript-eslint for TS strictness.
 *   Replaced eslint-config-next (Next.js eliminated per D-P2-STACK-CANON).
 */

import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Astro files
  ...astro.configs.recommended,

  // TypeScript/TSX files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  // Global ignores
  {
    ignores: [
      'public/**',
      'coverage/**',
      '.astro/**',
      '.next/**',
      'dist/**',
      'node_modules/**',
      // Legacy Next.js source — removed in the retire-Next epic
      'src/app/**',
      'src/mdx/**',
      'typography.ts',
      'tailwind.config.ts',
    ],
  },
];
