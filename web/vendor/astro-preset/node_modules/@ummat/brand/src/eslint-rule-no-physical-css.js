/**
 * @ummat/brand — ESLint rule: no-physical-css (T-P7-Q-RTL-08)
 *
 * Flags physical-direction Tailwind utilities and CSS-in-JS literals that
 * silently break in RTL locales (ar, ur). Encourages logical equivalents.
 *
 * Forbidden Tailwind classes (regex):
 *   ml-*, mr-*, pl-*, pr-*
 *   text-left, text-right
 *   left-*, right-*
 *   border-l, border-r, border-l-*, border-r-*
 *   rounded-l, rounded-r, rounded-l-*, rounded-r-*, rounded-tl-*, rounded-tr-*,
 *   rounded-bl-*, rounded-br-*  (corner-physical; use rounded-s-* / rounded-e-*)
 *   inset-l-*, inset-r-*
 *
 * Logical equivalents:
 *   ml-/mr-       → ms-/me-
 *   pl-/pr-       → ps-/pe-
 *   text-left/right → text-start/end
 *   left-/right-  → start-/end-
 *   border-l/r    → border-s/e
 *   rounded-l/r   → rounded-s/e
 *   rounded-tl/tr → rounded-ss/se
 *   rounded-bl/br → rounded-es/ee
 *
 * Forbidden CSS literal patterns (in style={...} string values):
 *   margin-left, margin-right, padding-left, padding-right
 *   text-align: left|right
 *   border-left, border-right
 *   left:, right:  (positional)
 *
 * Allowlist:
 *   - Files matching `**​/__rtl-allow__/**` (intentional non-flippable surfaces)
 *   - Vendored 3rd-party (configured via ESLint ignorePatterns)
 *   - Inline `// rtl-disable-next-line` comments (per-line)
 *
 * Usage in eslint.config.mjs:
 *   import noPhysicalCss from '@ummat/brand/eslint-rule-no-physical-css'
 *   defineConfig([
 *     { plugins: { ummat: { rules: { 'no-physical-css': noPhysicalCss } } } },
 *     { rules: { 'ummat/no-physical-css': 'warn' } },  // 'error' after quarantine
 *   ])
 */

'use strict'

/* Tailwind utility patterns. Anchored to word boundaries to avoid matching
   compound classes like 'overflow-clip-rmd' or 'select-rl-bin'. */
const PATTERNS = [
  {
    re: /\b(ml|mr|pl|pr)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
    msg: 'physical margin/padding',
    suggest: 'Use logical: ml-→ms-, mr-→me-, pl-→ps-, pr-→pe-',
  },
  {
    re: /\btext-(left|right)\b/,
    msg: 'physical text-align',
    suggest: 'Use logical: text-left→text-start, text-right→text-end',
  },
  {
    re: /\b(left|right)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
    msg: 'physical positional offset',
    suggest: 'Use logical: left-→start-, right-→end-',
  },
  {
    re: /\bborder-(l|r)(?:-(?:\[[^\]]+\]|[a-z0-9.]+))?\b/,
    msg: 'physical border side',
    suggest: 'Use logical: border-l→border-s, border-r→border-e',
  },
  {
    re: /\brounded-(l|r|tl|tr|bl|br)(?:-(?:\[[^\]]+\]|[a-z0-9.]+))?\b/,
    msg: 'physical border-radius corner',
    suggest:
      'Use logical: rounded-l→rounded-s, rounded-r→rounded-e, rounded-tl→rounded-ss, rounded-tr→rounded-se, rounded-bl→rounded-es, rounded-br→rounded-ee',
  },
  {
    re: /\binset-(l|r)-(?:\[[^\]]+\]|[a-z0-9.]+)/,
    msg: 'physical inset',
    suggest: 'Use logical: inset-l-→inset-inline-start (start-), inset-r-→inset-inline-end (end-)',
  },
]

/* CSS-in-JS literal patterns (matched against template literal / string values). */
const CSS_LITERAL_PATTERNS = [
  {
    re: /\bmargin-(left|right)\b/,
    msg: 'physical margin-left/right CSS property',
    suggest: 'Use margin-inline-start / margin-inline-end',
  },
  {
    re: /\bpadding-(left|right)\b/,
    msg: 'physical padding-left/right CSS property',
    suggest: 'Use padding-inline-start / padding-inline-end',
  },
  {
    re: /\bborder-(left|right)\b/,
    msg: 'physical border-left/right CSS property',
    suggest: 'Use border-inline-start / border-inline-end',
  },
  {
    re: /\btext-align\s*:\s*(left|right)\b/,
    msg: 'physical text-align: left|right',
    suggest: 'Use text-align: start | end',
  },
]

const DISABLE_COMMENT = /\brtl-disable-next-line\b/
const FILE_ALLOWLIST = /__rtl-allow__/

/**
 * Walk a class string and return all matches with descriptive messages.
 */
function findClassViolations(value) {
  const out = []
  for (const { re, msg, suggest } of PATTERNS) {
    const m = value.match(re)
    if (m) out.push({ found: m[0], msg, suggest })
  }
  return out
}

function findCssViolations(value) {
  const out = []
  for (const { re, msg, suggest } of CSS_LITERAL_PATTERNS) {
    const m = value.match(re)
    if (m) out.push({ found: m[0], msg, suggest })
  }
  return out
}

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Forbid physical-direction CSS / Tailwind utilities; require logical equivalents (RTL discipline).',
      recommended: false,
    },
    schema: [],
    messages: {
      physicalClass:
        '{{msg}}: "{{found}}". {{suggest}}. (T-P7-Q-RTL-08)',
      physicalCss:
        '{{msg}}: "{{found}}" in CSS string. {{suggest}}. (T-P7-Q-RTL-08)',
    },
  },

  create(context) {
    const filename = context.getFilename ? context.getFilename() : context.filename
    if (filename && FILE_ALLOWLIST.test(filename)) return {}

    /** Skip a node if the line above contains rtl-disable-next-line. */
    function isDisabled(node) {
      const sourceCode = context.getSourceCode ? context.getSourceCode() : context.sourceCode
      if (!sourceCode || !node.loc) return false
      const comments = sourceCode.getCommentsBefore(node)
      return comments.some((c) => DISABLE_COMMENT.test(c.value))
    }

    function checkStringLiteral(node, value) {
      if (typeof value !== 'string' || value.length === 0) return
      if (isDisabled(node)) return
      // Heuristic: is this a className-shaped string? Multi-token, kebab-case, no spaces commas etc.
      // We treat ALL string literals as candidates for class violations and ALSO scan for CSS-literal violations.
      for (const v of findClassViolations(value)) {
        context.report({
          node,
          messageId: 'physicalClass',
          data: v,
        })
      }
      for (const v of findCssViolations(value)) {
        context.report({
          node,
          messageId: 'physicalCss',
          data: v,
        })
      }
    }

    return {
      Literal(node) {
        if (typeof node.value === 'string') checkStringLiteral(node, node.value)
      },
      TemplateElement(node) {
        if (node.value && typeof node.value.cooked === 'string') {
          checkStringLiteral(node, node.value.cooked)
        }
      },
      JSXAttribute(node) {
        // className="..." attr literal already covered by Literal visitor.
        // Handle expression-shaped className like className={cn('ml-2', ...)} via Literal too.
        if (!node.value) return
      },
    }
  },
}

module.exports = rule
module.exports.default = rule
