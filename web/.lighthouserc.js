module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/new-york'],
      numberOfRuns: 3,
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
      settings: {
        preset: 'desktop',
        // Also run mobile audits for responsive pages
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 812,
          deviceScaleFactor: 3,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Core Web Vitals - strict thresholds
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],

        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],

        // Resource budgets
        'resource-summary:script:size': ['warn', { maxNumericValue: 300000 }],
        'resource-summary:stylesheet:size': ['warn', { maxNumericValue: 100000 }],
        'resource-summary:image:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 1500000 }],

        // Accessibility
        'color-contrast': 'error',
        'image-alt': 'error',
        'label': 'error',
        'meta-viewport': 'error',

        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'warn',
        'is-crawlable': 'error',

        // Best practices
        'uses-https': 'off', // localhost in CI
        'errors-in-console': 'warn',
        'deprecations': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
