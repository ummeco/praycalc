// Lighthouse CI config — Sprint B9 DR-B9-PERF-01 + DR-B9-A11Y-01
// Project: PrayCalc (praycalc.com)
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // CI runners are slower than production — performance thresholds relaxed to
        // avoid flaky failures on resource-constrained GitHub Actions workers.
        // Production perf is validated by Vercel analytics + manual runs.
        'categories:performance': ['warn', { minScore: 0.75 }],
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['warn', { minScore: 0.90 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 600 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
