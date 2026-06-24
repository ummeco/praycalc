/**
 * @ummat/brand — ESLint rule: no-brand-light-on-light
 *
 * Flags usage of `text-brand-light`, `text-brand-mid`, `text-ummat-light`, `text-ummat-mid`
 * Tailwind utility classes in JSX/TSX. These colors fail WCAG 2.2 AA on white/light surfaces:
 *   - #C9F27A (brand-light) on white = 1.28:1 (minimum required: 4.5:1)
 *   - #79C24C (brand-mid)   on white = 2.18:1 (minimum required: 4.5:1)
 *
 * Correct replacements:
 *   - text-brand-on-light / text-ummat-on-light  → #0D2F17 (7.38:1 on white) ✓
 *   - text-brand-600      / text-ummat-600       → #5A9438 (4.50:1 on white) ✓ D-P3-15
 *   - text-brand-on-dark  / text-ummat-on-dark   → #C9F27A ONLY on #1E5E2F/#0D2F17 dark bg ✓
 *
 * Safe background classes (not flagged):
 *   bg-brand-light, bg-brand-mid, bg-ummat-light, bg-ummat-mid (backgrounds are fine)
 *
 * Ref: C-09a-FIX-01 · design-system.md · .github/docs/brand/contrast-guide.md
 *
 * Usage in eslint.config.mjs:
 *   import noBrandLightOnLight from '@ummat/brand/eslint-rule-no-brand-light-on-light'
 *   // or
 *   import noBrandLightOnLight from '../../apps/brand/src/eslint-rule-no-brand-light-on-light.js'
 *
 *   defineConfig([
 *     { plugins: { ummat: { rules: { 'no-brand-light-on-light': noBrandLightOnLight } } } },
 *     { rules: { 'ummat/no-brand-light-on-light': 'error' } },
 *   ])
 */

'use strict'

/** Regex: matches text-brand-light, text-brand-mid, text-ummat-light, text-ummat-mid,
 *  AND literal hex arbitrary values text-[#79C24C] / text-[#C9F27A] — A11Y-T01.
 *  NOT matched: bg-brand-light, bg-brand-mid, border-brand-light (backgrounds/borders are safe).
 */
const FORBIDDEN_PATTERN =
  /\btext-(brand|ummat)-(light|mid)\b|text-\[#(79C24C|C9F27A)\]/i

const SUGGESTIONS = {
  'text-brand-light':  'text-brand-on-dark (on dark bg) or text-brand-on-light / text-brand-600 (on light bg)',
  'text-brand-mid':    'text-brand-on-light (7.38:1) or text-brand-600 (4.5:1, D-P3-15)',
  'text-ummat-light':  'text-ummat-on-dark (on dark bg) or text-ummat-on-light / text-ummat-600 (on light bg)',
  'text-ummat-mid':    'text-ummat-on-light (7.38:1) or text-ummat-600 (4.5:1, D-P3-15)',
  'text-[#79C24C]':    'text-[#5A9438] (4.5:1 on white, WCAG AA) — A11Y-T01',
  'text-[#C9F27A]':    'text-[#5A9438] (on light bg) or keep on dark bg (#07180d+)',
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow text-brand-light and text-brand-mid Tailwind classes — they fail WCAG 2.2 AA on white/light backgrounds. Use semantic on-dark/on-light tokens instead.',
      url: 'https://github.com/ummeco/ummat/blob/main/.github/docs/brand/contrast-guide.md',
    },
    schema: [],
    messages: {
      forbidden:
        "'{{cls}}' fails WCAG 2.2 AA contrast on white/light backgrounds " +
        '({{ratio}}:1, minimum 4.5:1). ' +
        'Use {{suggestion}} instead. ' +
        'See .github/docs/brand/contrast-guide.md',
    },
  },

  create(context) {
    /** Extract all string literals from a JSX attribute value node */
    function checkStringForViolations(node, str) {
      let match
      // Token-based: text-brand-light / text-brand-mid / text-ummat-light / text-ummat-mid
      const reToken = /\b(text-(brand|ummat)-(light|mid))\b/g
      while ((match = reToken.exec(str)) !== null) {
        const cls = match[1]
        const ratio = cls.includes('light') ? '1.28' : '2.18'
        context.report({
          node,
          messageId: 'forbidden',
          data: {
            cls,
            ratio,
            suggestion: SUGGESTIONS[cls] ?? 'text-brand-on-light or text-brand-600',
          },
        })
      }
      // Literal hex arbitrary values: text-[#79C24C] / text-[#C9F27A] — A11Y-T01
      const reHex = /(text-\[#(79C24C|C9F27A)\])/gi
      while ((match = reHex.exec(str)) !== null) {
        const cls = match[1]
        const hex = match[2].toUpperCase()
        const ratio = hex === 'C9F27A' ? '1.28' : '2.9'
        context.report({
          node,
          messageId: 'forbidden',
          data: {
            cls,
            ratio,
            suggestion: SUGGESTIONS[`text-[#${hex}]`] ?? 'text-[#5A9438] (A11Y-T01)',
          },
        })
      }
    }

    return {
      // className="text-brand-light ..."
      JSXAttribute(node) {
        if (
          node.name.type !== 'JSXIdentifier' ||
          (node.name.name !== 'className' && node.name.name !== 'class')
        ) {
          return
        }
        if (!node.value) return

        if (node.value.type === 'Literal' && typeof node.value.value === 'string') {
          checkStringForViolations(node.value, node.value.value)
        } else if (
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'Literal' &&
          typeof node.value.expression.value === 'string'
        ) {
          checkStringForViolations(node.value.expression, node.value.expression.value)
        }
      },

      // cn('text-brand-light', ...) — catches clsx/cn/cva call patterns
      CallExpression(node) {
        const callee = node.callee
        // Match: cn(), clsx(), cva(), twMerge(), classNames()
        const isClassHelper =
          (callee.type === 'Identifier' &&
            /^(cn|clsx|cva|twMerge|classNames|classnames)$/.test(callee.name)) ||
          (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'cn')

        if (!isClassHelper) return

        for (const arg of node.arguments) {
          if (arg.type === 'Literal' && typeof arg.value === 'string') {
            checkStringForViolations(arg, arg.value)
          }
        }
      },

      // Template literals: `text-brand-light ${...}`
      TemplateLiteral(node) {
        for (const quasi of node.quasis) {
          if (FORBIDDEN_PATTERN.test(quasi.value.raw)) {
            checkStringForViolations(quasi, quasi.value.raw)
          }
        }
      },
    }
  },
}

module.exports = rule
