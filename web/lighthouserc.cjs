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
        // Measured against the production build (see collect comment above), 6
        // local runs (3x `/`, 3x a city page, mobile, simulated throttling):
        // performance 0.91-0.96 (median 0.96), accessibility/best-practices/seo
        // 1.00 on every run. Prior pass landed at 0.75/0.76 — the two levers that
        // closed most of the gap were (1) the preview server wasn't compressing
        // responses at all (gzip/brotli now added — see lhci-preview-server.mjs —
        // real Vercel always compresses, so the old numbers were measuring a
        // payload praycalc.com never actually serves) and (2) @sentry/astro was
        // gluing the full browser SDK + session Replay (~75 KiB brotli) into every
        // page's eager entry script; it's now lazy-loaded on idle (see
        // src/lib/sentry-client-init.ts). Floors below give CI-machine variance
        // headroom without being a no-op.
        // RESIDUAL: LCP still lands ~2.5-3.1s under simulated mobile throttling —
        // the React renderer chunk (~50 KiB brotli, required for the
        // LocationSearch/CityClient islands) is the remaining structural cost;
        // there's no further reduction available without dropping an interactive
        // feature. Homepage CLS is 0.069 (real, from the sunrise-logo entrance
        // animation moving after first paint) — under the 0.1 gate but not zero;
        // see the comment on `.logo-sunrise img` in src/styles/global.css for why
        // shortening it was tried and reverted (fixed CLS, broke Speed Index).
        'categories:performance': ['error', { minScore: 0.85 }],
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
