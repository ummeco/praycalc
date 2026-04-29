// axe-core accessibility config — Sprint B2 (B2-01 + WCAG 2.2 AA)
// Updated: 2026-04-27 — added WCAG 2.2 tags per D-P3-11
// Used by @axe-core/playwright in E2E tests.
// CI gate: CRITICAL + SERIOUS violations fail the build.

/** @type {import('@axe-core/playwright').AxeOptions} */
module.exports = {
  // D-P3-11: WCAG 2.2 AA — includes 2.4.11, 2.5.7, 2.5.8 new criteria
  runOnly: {
    type: 'tag',
    values: [
      'wcag2a', 'wcag2aa',
      'wcag21a', 'wcag21aa',
      'wcag22aa',   // WCAG 2.2 AA (axe-core 4.9+)
      'best-practice',
    ],
  },

  rules: {
    // B2-05: All text on light bg must meet 4.5:1 contrast (uses green-600 per D-P3-15)
    'color-contrast': { enabled: true },
    // B2-07: Focus visible ring must never be hidden
    'focus-trap': { enabled: true },
    // 2.4.11 Focus Not Obscured — axe-core experimental rule
    'scrollable-region-focusable': { enabled: true },
    // 2.5.8 Target Size — minimum 24×24 CSS px
    'target-size': { enabled: true },
  },

  // Narrow exclusions — document every entry
  exclude: [
    // No third-party iframes on praycalc (Turnstile is checked separately)
  ],
};
