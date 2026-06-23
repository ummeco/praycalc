// FILE: astro.config.ts
// PURPOSE: Astro 5 configuration for praycalc.org — marketing/docs site.
//   Inlines brand token injection and RTL direction logic (previously @ummat/astro-preset)
//   to keep the praycalc workspace self-contained without cross-workspace file: references.
//   Static output via @astrojs/vercel adapter with full sitemap generation.
//   MDX for docs pages, React 19 islands for interactive widgets.
// CONSTRAINTS:
//   - Target stack: Astro 5 + TS + Tailwind (D-P2-STACK-CANON)
//   - No Next.js imports — fully migrated
//   - Sentry DSN sourced from SENTRY_DSN_PRAYCALC env var (vault)
//   - Brand tokens + RTL from inlined astroUmmatInline integration (mirrors @ummat/astro-preset logic)
// REF: T-01 (P2-E3-W01-S01) · D-P2-STACK-CANON · D-P2-REACT19

import { defineConfig } from 'astro/config';
import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import sentry from '@sentry/astro';
import tailwindcss from '@tailwindcss/vite';

// ─── Inlined brand tokens + RTL (mirrors @ummat/astro-preset — no cross-workspace dep) ────────
const BRAND_TOKENS_CSS = `
/* @ummat/brand design tokens — injected by astroUmmatInline */
:root {
  /* --- Green scale --- */
  --brand-green-light: #C9F27A;
  --brand-green-mid:   #79C24C;
  --brand-green-dark:  #1E5E2F;
  --brand-green-deep:  #0D2F17;

  /* --- Semantic aliases --- */
  --brand-primary:        var(--brand-green-mid);
  --brand-primary-hover:  var(--brand-green-dark);
  --brand-accent:         var(--brand-green-light);
  --brand-background:     #FFFFFF;
  --brand-surface:        #F9FAFB;
  --brand-text-primary:   #111827;
  --brand-text-secondary: #6B7280;
  --brand-border:         #E5E7EB;

  /* --- Focus ring --- */
  --brand-focus-ring: 0 0 0 3px rgba(121, 194, 76, 0.45);
}
`;

const RTL_LOCALES = new Set(['ar', 'ur', 'fa', 'he', 'ckb']);

function astroUmmatInline(): AstroIntegration {
  return {
    name: 'astro-ummat-inline',
    hooks: {
      'astro:config:setup'({ injectScript }) {
        // Inject brand CSS tokens into every page head
        injectScript('head-inline', `<style>${BRAND_TOKENS_CSS}</style>`);

        // Per-page RTL direction script — sets dir="rtl" for Arabic/RTL locales
        injectScript(
          'page',
          `(function(){
  var lang = document.documentElement.lang || '';
  var primary = lang.split('-')[0].toLowerCase();
  var rtl = ['ar','ur','fa','he','ckb'];
  document.documentElement.setAttribute('dir', rtl.indexOf(primary) !== -1 ? 'rtl' : 'ltr');
})();`,
        );
      },
    },
  };
}
// ────────────────────────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  site: 'https://praycalc.org',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: false }, // Umami handles analytics (D-P3-21)
  }),
  integrations: [
    astroUmmatInline(),
    react(),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
    sentry({
      dsn: import.meta.env.SENTRY_DSN_PRAYCALC,
      sourceMapsUploadOptions: {
        project: 'praycalc-org',
        authToken: import.meta.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  i18n: {
    // P2-E6-W01-S01-T01: expanded to 5 required locales (AC-01)
    defaultLocale: 'en',
    locales: ['en', 'ar', 'ur', 'fa', 'id'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
