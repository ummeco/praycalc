/**
 * @ummat/brand — ESLint rule: no-mid-green-text
 *
 * T06 (p9-sprint-I18N-RTL-WAVE0-SETUP): Demotes #79C24C from text usage.
 *
 * WCAG contrast ratio of #79C24C on white (#FFFFFF) = 2.93:1 — FAILS AA (4.5:1 required
 * for normal text, 3:1 for large text ≥18pt or 14pt bold).
 *
 * This rule:
 *   - ERRORs on `color: '#79C24C'` or `color="#79C24C"` (text colour usage)
 *   - WARNs on `backgroundColor: '#79C24C'` (background usage — allowed but flag for review)
 *   - ERRORs on Tailwind classes `text-brand-mid`, `text-ummat-mid` applied as text colour
 *
 * Correct replacements for TEXT on white/light backgrounds:
 *   - `color: '#1E5E2F'`           (semantic.textOnWhite, WCAG 7.53:1 AAA)
 *   - `color: '#5A9438'`           (semantic.brandOnLight, WCAG 4.50:1 AA)
 *   - `green.textOnWhite`          from @ummat/brand/tokens
 *   - Tailwind: `text-brand-dark`, `text-ummat-dark`, `text-brand-600`, `text-ummat-600`
 *
 * Background usage of #79C24C is fine (warn only — decorative surfaces are acceptable):
 *   - `backgroundColor: '#79C24C'` (ensure sufficient contrast on overlaid text)
 *   - Tailwind: `bg-brand-mid`, `bg-ummat-mid`
 *
 * REF: T06, p9-sprint-I18N-RTL-WAVE0-SETUP, ADR brand-contrast
 */

'use strict'

const MID_GREEN = '#79C24C'
const MID_GREEN_LOWER = '#79c24c'

const TEXT_TAILWIND_CLASSES = ['text-brand-mid', 'text-ummat-mid']

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow #79C24C as a text colour on white/light backgrounds (WCAG AA failure). ' +
        'Use #1E5E2F (textOnWhite, 7.53:1 AAA) or #5A9438 (brandOnLight, 4.50:1 AA) instead.',
      category: 'Best Practices',
      recommended: true,
      url: 'https://github.com/ummeco/ummat/blob/main/packages/brand/src/eslint-rule-no-mid-green-text.js',
    },
    schema: [],
    messages: {
      textColorError:
        '#79C24C fails WCAG AA as text on white (2.93:1 < 4.5:1 required). ' +
        'Use semantic.textOnWhite (#1E5E2F, 7.53:1) or semantic.brandOnLight (#5A9438, 4.50:1). ' +
        'For decorative/accent use, this color is allowed via green.accent.',
      backgroundColorWarn:
        '#79C24C as background is allowed (decorative) but ensure overlaid text has ≥4.5:1 contrast. ' +
        'Prefer semantic.accent from @ummat/brand/tokens for named usage.',
      tailwindTextClassError:
        'Tailwind class "{{cls}}" applies #79C24C as text on white (WCAG AA fail). ' +
        'Use text-brand-dark, text-ummat-dark, text-brand-600, or text-ummat-600 instead.',
    },
  },

  create(context) {
    function isMidGreen(str) {
      if (typeof str !== 'string') return false
      const norm = str.trim().toLowerCase()
      return norm === MID_GREEN_LOWER || norm === MID_GREEN
    }

    function checkStringForTailwindTextClasses(node, str) {
      if (typeof str !== 'string') return
      for (const cls of TEXT_TAILWIND_CLASSES) {
        if (str.split(/\s+/).includes(cls)) {
          context.report({
            node,
            messageId: 'tailwindTextClassError',
            data: { cls },
          })
        }
      }
    }

    return {
      // Handle JSX style={{ color: '#79C24C' }} and style={{ backgroundColor: '#79C24C' }}
      Property(node) {
        if (node.key && node.key.name === 'color') {
          if (
            node.value &&
            node.value.type === 'Literal' &&
            isMidGreen(node.value.value)
          ) {
            context.report({ node, messageId: 'textColorError' })
          }
        }
        if (node.key && node.key.name === 'backgroundColor') {
          if (
            node.value &&
            node.value.type === 'Literal' &&
            isMidGreen(node.value.value)
          ) {
            context.report({ node, messageId: 'backgroundColorWarn', severity: 1 })
          }
        }
      },

      // Handle JSX className="..." and className={`...`}
      JSXAttribute(node) {
        if (
          node.name &&
          (node.name.name === 'className' || node.name.name === 'style')
        ) {
          if (node.value && node.value.type === 'Literal') {
            checkStringForTailwindTextClasses(node, node.value.value)
          }
          if (
            node.value &&
            node.value.type === 'JSXExpressionContainer' &&
            node.value.expression.type === 'TemplateLiteral'
          ) {
            for (const quasi of node.value.expression.quasis) {
              checkStringForTailwindTextClasses(node, quasi.value.raw)
            }
          }
        }
      },
    }
  },
}
