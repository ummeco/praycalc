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
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// ─── Inlined RTL direction + docs enhancements (mirrors @ummat/astro-preset) ──────────────────
// Brand design tokens live in src/styles/global.css (@theme / :root) — NOT injected here.
// injectScript() injects JavaScript, not HTML, so a `<style>` string would throw at runtime.

function astroUmmatInline(): AstroIntegration {
  return {
    name: 'astro-ummat-inline',
    hooks: {
      'astro:config:setup'({ injectScript }) {
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

        // Copy-to-clipboard + heading anchor links (idempotent, no framework deps)
        injectScript(
          'page',
          `(function(){
  function initEnhancements(){
    var main = document.getElementById('main-content');
    if(!main) return;

    /* ── Code copy buttons ─────────────────────────────────────────────── */
    var blocks = main.querySelectorAll('pre.astro-code');
    blocks.forEach(function(pre){
      if(pre.dataset.copyInit) return;
      pre.dataset.copyInit = '1';
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.setAttribute('aria-label','Copy code');
      btn.textContent = 'Copy';
      btn.addEventListener('click', function(){
        var text = pre.innerText || pre.textContent || '';
        navigator.clipboard.writeText(text).then(function(){
          btn.textContent = 'Copied!';
          btn.classList.add('code-copy-btn--copied');
          setTimeout(function(){
            btn.textContent = 'Copy';
            btn.classList.remove('code-copy-btn--copied');
          }, 1500);
        }).catch(function(){
          btn.textContent = 'Error';
          setTimeout(function(){ btn.textContent = 'Copy'; }, 1500);
        });
      });
      pre.appendChild(btn);
    });

    /* ── Heading anchor links (prose content only — not page-level h2s) ──── */
    var headings = main.querySelectorAll('.prose h2[id], .prose h3[id]');
    headings.forEach(function(h){
      if(h.querySelector('.heading-anchor')) return;
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.className = 'heading-anchor';
      a.setAttribute('aria-hidden', 'true');
      a.setAttribute('tabindex', '-1');
      a.textContent = '#';
      h.appendChild(a);
    });
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initEnhancements);
  } else {
    initEnhancements();
  }
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
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      wrap: true,
    },
    rehypePlugins: [
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            ariaHidden: 'true',
            tabIndex: -1,
            class: 'heading-anchor',
          },
          content: {
            type: 'text',
            value: '#',
          },
        },
      ],
    ],
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
