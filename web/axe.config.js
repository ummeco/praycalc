// axe-core accessibility config — Sprint B9 DR-B9-A11Y-01
// Ticket TB9-08 | Project: praycalc/web (praycalc.com)
// Used by jest-axe and @axe-core/playwright in unit and integration tests.
// See also: TB9-09 (Pa11y nightly cross-domain smoke test — separate config).

/** @type {import('@axe-core/playwright').AxeOptions} */
module.exports = {
  // Enforce WCAG 2.1 AA and all lower levels
  runOnly: {
    type: 'tag',
    values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
  },

  rules: {
    // color-contrast is enabled; all interactive elements must meet 4.5:1 ratio
    'color-contrast': { enabled: true },
  },

  // Narrow exclusions — document every entry
  exclude: [
    // No Stripe Elements on this project; no iframe exclusions needed
  ],
};
