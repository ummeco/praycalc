// Lighthouse CI config — praycalc.org (marketing/docs site)
// Mirrors web/lighthouserc.cjs; see that file for the LHCI job wiring in
// _reusable-lighthouse.yml.
module.exports = {
  ci: {
    collect: {
      // Unlike web/ (output: 'server' + @astrojs/vercel, which has no `astro
      // preview`), org/ uses output: 'static' — the @astrojs/vercel adapter
      // only copies the static dist/ into .vercel/output/static and does not
      // block `astro preview`, which serves dist/ directly. No custom preview
      // server needed here.
      startServerCommand: 'node_modules/.bin/astro preview --port 3041',
      startServerReadyPattern: 'ready in',
      startServerReadyTimeout: 30000,
      url: [
        'http://localhost:3041/',
        'http://localhost:3041/hijri/',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Measured 2026-07-09 against a fresh production build (org/dist via
        // `astro preview`), 3 local runs per URL, default mobile emulation +
        // simulated throttling (npx lighthouse@11, matching LHCI defaults):
        // homepage performance 0.96-0.99 (median ~0.97), /hijri/ doc page
        // 0.99; accessibility/best-practices/seo 1.00 on both pages. Floor
        // set to 0.90 for performance (real headroom below the observed
        // 0.96-0.99 range for CI-machine variance, mirrors web/'s floor) and
        // 0.95 for a11y/best-practices/seo (mirrors web/'s convention).
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
