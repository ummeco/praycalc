/**
 * eslint.config.mjs — ESLint flat config for praycalc/desktop (Tauri 2 + Vite + React 19).
 *
 * PURPOSE: Lint TS/TSX source under src/. Mirrors praycalc/web's flat-config
 *   structure (@typescript-eslint + jsx-a11y) with the Vite/React-specific
 *   additions the official `create-vite --template react-ts` config ships
 *   (react-hooks rules-of-hooks, react-refresh's fast-refresh-safety check) —
 *   web is Astro-only so it has no need for those two.
 * REF: desktop crunch — "Add a real linter" ticket (D-P2-STACK-CANON Vite lane).
 */
import js from '@eslint/js';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Relax to match tsconfig's own strictness knobs rather than double-enforcing.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'src-tauri/**', // Rust — linted by `cargo check`, not ESLint
      'public/**',
    ],
  },
];
