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

import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';
import { astroUmmat } from '@ummat/astro-preset';

export default defineConfig({
  site: 'https://praycalc.com',
  // SSR required: prayer times are computed server-side per request (lat/lng → times)
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: false }, // Umami handles analytics (D-P3-21)
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
    // Sentry: DSN is configured in sentry.client.config.ts / sentry.server.config.ts
    sentry({
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
    plugins: [tailwindcss()],
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
