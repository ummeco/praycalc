// FILE: src/brand-tokens.ts
// PURPOSE: Inline CSS string containing the core @ummat/brand design token
//   CSS custom properties. Embedded here so astroUmmat() can inject them
//   into Astro <head> without requiring a separate CSS file import.
//
// CONSTRAINTS:
//   - Values MUST match packages/brand/src/tokens.css (source of truth).
//   - Do NOT add tokens here that are not in @ummat/brand/css — drift is a bug.
//   - Update this file whenever brand/src/tokens.css changes.
// REF: P2-E2-W02-S02-T03-A · PPI brand section (#C9F27A/#79C24C/#1E5E2F/#0D2F17)

/**
 * Core @ummat/brand CSS custom-property declaration block.
 *
 * Injected into Astro document <head> as an inline <style> so pages can
 * reference --brand-* variables without a separate link/import.
 */
export const BRAND_TOKENS_CSS = `
/* @ummat/brand design tokens — injected by @ummat/astro-preset */
:root {
  /* --- Green scale --- */
  --brand-green-light: #C9F27A;
  --brand-green-mid:   #79C24C;
  --brand-green-dark:  #1E5E2F;
  --brand-green-deep:  #0D2F17;

  /* --- Semantic aliases --- */
  --brand-primary:        var(--brand-green-mid);
  --brand-primary-hover:  var(--brand-green-dark);
  --brand-accent:         var(--brand-green-light);
  --brand-background:     #FFFFFF;
  --brand-surface:        #F9FAFB;
  --brand-text-primary:   #111827;
  --brand-text-secondary: #6B7280;
  --brand-border:         #E5E7EB;

  /* --- Focus ring --- */
  --brand-focus-ring: 0 0 0 3px rgba(121, 194, 76, 0.45);
}
`;
