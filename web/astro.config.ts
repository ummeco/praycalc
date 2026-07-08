// FILE: astro.config.ts
// PURPOSE: Astro 5 configuration for praycalc.com — prayer time calculator.
//   SSR via @astrojs/vercel adapter for dynamic prayer time generation.
//   React 19 islands for interactive calculator, location picker, timetable.
//   @ummat/astro-preset for brand tokens + RTL direction injection.
// CONSTRAINTS:
//   - Target stack: Astro 5 + TS + Tailwind (D-P2-STACK-CANON)
//   - No Next.js imports — fully migrated from Next.js 16
//   - Sentry DSN from SENTRY_DSN_PRAYCALC env var (vault)
//   - D-P3-21: Umami for analytics (not Vercel Analytics)
// REF: T-03 (P2-E3-W02-S02) · D-P2-STACK-CANON · D-P2-REACT19

import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { astroUmmat } from '@ummat/astro-preset';

// nrel-spa (via pray-calc) loads ../lib/spa.js through a _load() indirection that
// Vercel's file tracing cannot follow, so the file is missing at Lambda runtime
// (FUNCTION_INVOCATION_FAILED on every /api/prayers call). Resolve the installed
// entry and include lib/spa.js explicitly; resolving at config time keeps the
// path correct across nrel-spa versions and pnpm layouts.
// nrel-spa is a transitive dep of pray-calc — under pnpm's strict layout it is
// only resolvable from pray-calc's own context, so chain createRequire through it.
const configRequire = createRequire(import.meta.url);
const prayCalcRequire = createRequire(configRequire.resolve('pray-calc'));
const nrelSpaLib = path.relative(
  process.cwd(),
  path.join(path.dirname(prayCalcRequire.resolve('nrel-spa')), '../lib/spa.js'),
);

export default defineConfig({
  site: 'https://praycalc.com',
  // SSR required: prayer times are computed server-side per request (lat/lng → times)
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false }, // Umami handles analytics (D-P3-21)
    // data-lookup.server.ts reads path.join(process.cwd(), 'data', ...) at Lambda runtime.
    // includeFiles ensures geo.json + auto.json are bundled at the function root.
    includeFiles: ['./data/geo.json', './data/auto.json', nrelSpaLib],
  }),
  integrations: [
    astroUmmat({
      injectBrandTokens: false, // Brand tokens defined in src/styles/global.css @theme block
      setRtlDirection: true,    // RTL for Arabic/Urdu/Farsi and other RTL locales
      urqlSsr: false,           // praycalc uses REST endpoints, not urql GraphQL client
    }),
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/api/') &&
        !page.includes('/404') &&
        !page.includes('/500'),
    }),
    // Sentry: server init from sentry.server.config.ts (auto-injected into every
    // SSR response as usual). Client init is intentionally NOT auto-injected —
    // `enabled.client: false` stops @sentry/astro's injectScript("page", ...) hook,
    // which otherwise glues the full browser SDK (core + browserTracing + Replay,
    // ~75 KiB brotli) into every page's eager entry bundle and was the single
    // largest contributor to homepage FCP/LCP. src/lib/sentry-client-init.ts holds
    // the equivalent Sentry.init() call; RootLayout.astro dynamically imports it on
    // requestIdleCallback/load so monitoring still initializes, just off the
    // critical rendering path. See src/lib/sentry-client-init.ts for the full why.
    sentry({
      enabled: { client: false, server: true },
      sourceMapsUploadOptions: {
        project: 'praycalc-web',
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ar', 'ur', 'fa', 'id', 'tr', 'ms', 'bn', 'fr', 'es', 'de', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    // Cast: vite@8 resolves under two @types/node peers in the workspace, so
    // tailwindcss()'s Plugin type is nominally distinct from astro's expected
    // PluginOption (structurally identical; builds succeed). Localized cast
    // avoids a broader @types/node dedupe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss()] as any,
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    // Allow reading geo data files from parent workspace
    server: {
      fs: {
        allow: ['..'],
      },
    },
    // Externalize CJS-only packages from the SSR bundle to avoid Rolldown CJS wrapper issues.
    // pray-calc ships CJS only (no ESM); Rolldown's __commonJSMin helper is not available
    // in the page-generation phase when these get inlined into the server chunk.
    ssr: {
      external: ['pray-calc'],
    },
  },
});
