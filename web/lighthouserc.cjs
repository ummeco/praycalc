// Lighthouse CI config — Sprint B9 DR-B9-PERF-01 + DR-B9-A11Y-01
// Project: PrayCalc (praycalc.com)
module.exports = {
  ci: {
    collect: {
      // SSR app uses the @astrojs/vercel adapter, which has no `astro preview`
      // server ("does not support the preview command") and `vercel dev` re-runs
      // the framework dev command rather than serving the prebuilt bundle. Run
      // against the actual production build instead: `pnpm build` (already a prior
      // CI step — see _reusable-lighthouse.yml) emits `.vercel/output/`, and
      // scripts/lhci-preview-server.mjs serves that build output directly (static
      // assets from `.vercel/output/static/`, everything else through the real
      // compiled serverless handler) — same minified bundles, same asset hashes,
      // same caching headers as what ships to praycalc.com.
      startServerCommand: 'node scripts/lhci-preview-server.mjs',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:4321/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Re-measured 2026-07-08 (JS-diet crunch pass) against a fresh production
        // build, 6 local homepage runs (mobile, simulated throttling, npx
        // lighthouse@11): performance 0.98-0.99 (median 0.99 before this pass,
        // 0.98 after — noise, not a regression), accessibility/best-practices/seo
        // 1.00. Confirmed via the built HTML + component-url attributes that the
        // homepage ships only LocationSearch (client:load, required — see
        // src/islands/LocationSearch.tsx header) and ConsentGate (client:idle,
        // already deferred); CityClient is NOT in the homepage bundle. No further
        // safe JS trim was available without touching those two directives.
        // Floor raised from 0.85 -> 0.90: real headroom below the observed
        // 0.98-0.99 range for CI-machine variance, without being a no-op gate.
        // RESIDUAL (both pre-existing, already explored, not touched this pass):
        // (1) LCP (~1.9s, score 0.98) — the LCP element on a fresh load is
        // ConsentGate's cookie-banner paragraph (`.consent-gate` text), not the
        // logo; its ~440ms render delay is the idle-loaded island hydrating.
        // Making the banner SSR-visible would need non-JS-gated consent markup —
        // out of scope for a JS-diet pass, flagged for its own ticket. (2) CLS
        // 0.069 (score 0.96) from the sunrise-logo entrance animation — see the
        // comment on `.logo-sunrise img` in src/styles/global.css for why
        // shortening it was tried and reverted (fixed CLS, broke Speed Index).
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
