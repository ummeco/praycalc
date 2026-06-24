/**
 * FILE: packages/brand/src/tokens/colors.ts
 * PURPOSE: Canonical brand color palette for the Ummat ecosystem. Single source of truth.
 * INVARIANTS:
 *   - The four canonical hex values are LOCKED per PPI brand section:
 *       #C9F27A (light)  #79C24C (mid)  #1E5E2F (dark)  #0D2F17 (deep)
 *   - The light-bg AA-contrast variant #5A9438 is added per Wave 4 finding (T-P7-C-S10-01).
 *   - All ecosystem apps share this palette. Per-app overrides live in src/apps/*.ts.
 * DO NOT: change canonical hex values without a STORM-approved brand decision; add palette
 *   colors outside the green family without ADR; rename the `green` scale.
 * REF: T-P7-C-S10-01, T-P7-C-S10-T14 (color sweep), brand-guide.md
 */
/** Canonical Ummat green scale. Numeric stops follow Tailwind convention. */
declare const green: {
    /** Lightest tint — large surfaces, hover wash on dark green. */
    readonly 50: "#F4FBE8";
    /** Brand "light" — highlights, accents, light-mode backgrounds (canonical). */
    readonly 100: "#C9F27A";
    /** Brand "mid" — primary brand color: buttons, icons, CTAs on dark bg (canonical). */
    readonly 400: "#79C24C";
    /** Light-bg AA-contrast variant — use as primary on light bg where #79C24C fails contrast (Wave 4). */
    readonly 500: "#5A9438";
    /** Brand "dark" — dark mode primary, body text on light bg (canonical). */
    readonly 700: "#1E5E2F";
    /** Brand "deep" — dark mode backgrounds, deep contrast (canonical). */
    readonly 900: "#0D2F17";
};
type GreenScale = typeof green;
type GreenStop = keyof GreenScale;
/**
 * Semantic color aliases. Use these in component code in preference to raw scale stops.
 * Surface and content tokens map intent → palette stops, allowing themes to remap without
 * editing components.
 *
 * WCAG contrast ratios on white (#FFFFFF):
 *   green[400] (#79C24C) = 2.93:1  → FAIL AA (do not use as text colour on white/light bg)
 *   green[500] (#5A9438) = 4.50:1  → PASS AA (minimum for normal text)
 *   green[700] (#1E5E2F) = 7.53:1  → PASS AAA
 *   green[900] (#0D2F17) = 14.2:1  → PASS AAA
 *
 * T06 (p9-sprint-I18N-RTL-WAVE0-SETUP): green.accent introduced to make the semantic
 * role of #79C24C explicit (decorative / CTA on dark bg only, NOT text on white).
 * green.textOnWhite is the mandatory foreground for body text on white/light surfaces.
 */
declare const semantic: {
    readonly brand: "#79C24C";
    readonly brandOnLight: "#5A9438";
    readonly brandDark: "#1E5E2F";
    readonly brandDeep: "#0D2F17";
    readonly brandLight: "#C9F27A";
    readonly brandWash: "#F4FBE8";
    /** Primary text on light background. */
    readonly textOnLight: "#0D2F17";
    /** Primary text on dark background. */
    readonly textOnDark: "#F4FBE8";
    /**
     * Accent colour — decorative elements, icons, CTAs on dark green backgrounds.
     * WCAG 2.93:1 on white → NOT safe as text colour on white or light surfaces.
     * This is the canonical alias for #79C24C (#79C24C → green[400]).
     * Use green.textOnWhite for body text on white/light backgrounds.
     */
    readonly accent: "#79C24C";
    /**
     * Mandatory text colour on white or light (#F4FBE8) backgrounds.
     * WCAG 7.53:1 on white = AAA. Use this wherever #79C24C was previously
     * used as a text colour. Canonical alias for #1E5E2F (green[700]).
     *
     * T06: demotes #79C24C from text use; introduces this named token.
     */
    readonly textOnWhite: "#1E5E2F";
    /**
     * Text colour on deep green (#0D2F17) backgrounds.
     * WCAG: #C9F27A on #0D2F17 = 8.7:1 (AAA). Canonical alias for green[100].
     */
    readonly textOnDark2: "#C9F27A";
};
type SemanticColors = typeof semantic;
/**
 * Canonical palette object. Consumers import this for tokens.colors.
 */
declare const colors: {
    readonly green: {
        /** Lightest tint — large surfaces, hover wash on dark green. */
        readonly 50: "#F4FBE8";
        /** Brand "light" — highlights, accents, light-mode backgrounds (canonical). */
        readonly 100: "#C9F27A";
        /** Brand "mid" — primary brand color: buttons, icons, CTAs on dark bg (canonical). */
        readonly 400: "#79C24C";
        /** Light-bg AA-contrast variant — use as primary on light bg where #79C24C fails contrast (Wave 4). */
        readonly 500: "#5A9438";
        /** Brand "dark" — dark mode primary, body text on light bg (canonical). */
        readonly 700: "#1E5E2F";
        /** Brand "deep" — dark mode backgrounds, deep contrast (canonical). */
        readonly 900: "#0D2F17";
    };
    readonly semantic: {
        readonly brand: "#79C24C";
        readonly brandOnLight: "#5A9438";
        readonly brandDark: "#1E5E2F";
        readonly brandDeep: "#0D2F17";
        readonly brandLight: "#C9F27A";
        readonly brandWash: "#F4FBE8";
        /** Primary text on light background. */
        readonly textOnLight: "#0D2F17";
        /** Primary text on dark background. */
        readonly textOnDark: "#F4FBE8";
        /**
         * Accent colour — decorative elements, icons, CTAs on dark green backgrounds.
         * WCAG 2.93:1 on white → NOT safe as text colour on white or light surfaces.
         * This is the canonical alias for #79C24C (#79C24C → green[400]).
         * Use green.textOnWhite for body text on white/light backgrounds.
         */
        readonly accent: "#79C24C";
        /**
         * Mandatory text colour on white or light (#F4FBE8) backgrounds.
         * WCAG 7.53:1 on white = AAA. Use this wherever #79C24C was previously
         * used as a text colour. Canonical alias for #1E5E2F (green[700]).
         *
         * T06: demotes #79C24C from text use; introduces this named token.
         */
        readonly textOnWhite: "#1E5E2F";
        /**
         * Text colour on deep green (#0D2F17) backgrounds.
         * WCAG: #C9F27A on #0D2F17 = 8.7:1 (AAA). Canonical alias for green[100].
         */
        readonly textOnDark2: "#C9F27A";
    };
};
type Colors = typeof colors;

/**
 * FILE: packages/brand/src/tokens/typography.ts
 * PURPOSE: Typography tokens for Ummat ecosystem. References fonts loaded via @ummat/shared/fonts.
 * INVARIANTS:
 *   - Arabic script (Quran, Hadith, du'a, UI in AR/UR/FA/PS) uses Amiri or Noto Naskh Arabic.
 *   - Quranic verses use Amiri; UI Arabic uses Noto Naskh Arabic.
 *   - Latin script uses Geist (headings + body) with Inter fallback.
 *   - Font-family arrays MUST include CSS var first (set by @ummat/shared/fonts via Next.js).
 * DO NOT: hardcode raw "Amiri" strings in components — use the family tokens here; mix Arabic
 *   text with Latin font-family (RTL boundary required).
 * REF: T-P7-C-S10-01, brand-guide.md, packages/shared/tailwind/preset.ts
 */
declare const fontFamilies: {
    /** Latin headings + body. Loaded via @ummat/shared/fonts. */
    readonly sans: readonly ["var(--font-latin)", "Geist", "Inter", "system-ui", "sans-serif"];
    /** Monospace for code/numbers. */
    readonly mono: readonly ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"];
    /** Arabic UI text (menus, labels, UI in AR/UR/FA/PS). */
    readonly arabic: readonly ["var(--font-arabic)", "\"Noto Naskh Arabic\"", "serif"];
    /** Quranic verses, Hadith, classical Arabic content. */
    readonly quran: readonly ["var(--font-quran)", "Amiri", "\"Noto Naskh Arabic\"", "serif"];
};
type FontFamilies = typeof fontFamilies;
declare const fontWeights: {
    readonly regular: 400;
    readonly medium: 500;
    readonly semibold: 600;
    readonly bold: 700;
    readonly extrabold: 800;
};
type FontWeights = typeof fontWeights;
declare const fontSizes: {
    readonly xs: "0.75rem";
    readonly sm: "0.875rem";
    readonly base: "1rem";
    readonly lg: "1.125rem";
    readonly xl: "1.25rem";
    readonly '2xl': "1.5rem";
    readonly '3xl': "1.875rem";
    readonly '4xl': "2.25rem";
    readonly '5xl': "3rem";
    readonly '6xl': "3.75rem";
};
type FontSizes = typeof fontSizes;
declare const lineHeights: {
    readonly tight: 1.15;
    readonly snug: 1.3;
    readonly normal: 1.5;
    readonly relaxed: 1.65;
    readonly loose: 1.85;
};
type LineHeights = typeof lineHeights;
declare const typography: {
    readonly fontFamilies: {
        /** Latin headings + body. Loaded via @ummat/shared/fonts. */
        readonly sans: readonly ["var(--font-latin)", "Geist", "Inter", "system-ui", "sans-serif"];
        /** Monospace for code/numbers. */
        readonly mono: readonly ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"];
        /** Arabic UI text (menus, labels, UI in AR/UR/FA/PS). */
        readonly arabic: readonly ["var(--font-arabic)", "\"Noto Naskh Arabic\"", "serif"];
        /** Quranic verses, Hadith, classical Arabic content. */
        readonly quran: readonly ["var(--font-quran)", "Amiri", "\"Noto Naskh Arabic\"", "serif"];
    };
    readonly fontWeights: {
        readonly regular: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
        readonly extrabold: 800;
    };
    readonly fontSizes: {
        readonly xs: "0.75rem";
        readonly sm: "0.875rem";
        readonly base: "1rem";
        readonly lg: "1.125rem";
        readonly xl: "1.25rem";
        readonly '2xl': "1.5rem";
        readonly '3xl': "1.875rem";
        readonly '4xl': "2.25rem";
        readonly '5xl': "3rem";
        readonly '6xl': "3.75rem";
    };
    readonly lineHeights: {
        readonly tight: 1.15;
        readonly snug: 1.3;
        readonly normal: 1.5;
        readonly relaxed: 1.65;
        readonly loose: 1.85;
    };
};
type Typography = typeof typography;

/**
 * FILE: packages/brand/src/tokens/spacing.ts
 * PURPOSE: Spacing, border radius, and shadow tokens for the Ummat ecosystem.
 * INVARIANTS:
 *   - Spacing follows a 4-px base grid (Tailwind-compatible).
 *   - Border radius uses semantic names (sm/md/lg/full) rather than raw px.
 *   - Shadows use brand-green tints, not neutral grays, for cohesion.
 * DO NOT: introduce off-grid spacing values without ADR.
 * REF: T-P7-C-S10-01, brand-guide.md
 */
declare const spacing: {
    readonly 0: "0px";
    readonly 1: "0.25rem";
    readonly 2: "0.5rem";
    readonly 3: "0.75rem";
    readonly 4: "1rem";
    readonly 5: "1.25rem";
    readonly 6: "1.5rem";
    readonly 8: "2rem";
    readonly 10: "2.5rem";
    readonly 12: "3rem";
    readonly 16: "4rem";
    readonly 20: "5rem";
    readonly 24: "6rem";
    readonly 32: "8rem";
};
type Spacing = typeof spacing;
declare const borderRadius: {
    readonly none: "0px";
    readonly sm: "0.25rem";
    readonly md: "0.5rem";
    readonly lg: "0.75rem";
    readonly xl: "1rem";
    readonly '2xl': "1.5rem";
    readonly full: "9999px";
};
type BorderRadius = typeof borderRadius;
/**
 * Shadow tokens tinted with brand green for ecosystem cohesion (RGBA of #0D2F17).
 */
declare const shadows: {
    readonly sm: "0 1px 2px 0 rgba(13, 47, 23, 0.06)";
    readonly md: "0 4px 6px -1px rgba(13, 47, 23, 0.10), 0 2px 4px -2px rgba(13, 47, 23, 0.06)";
    readonly lg: "0 10px 15px -3px rgba(13, 47, 23, 0.12), 0 4px 6px -4px rgba(13, 47, 23, 0.08)";
    readonly xl: "0 20px 25px -5px rgba(13, 47, 23, 0.15), 0 8px 10px -6px rgba(13, 47, 23, 0.10)";
};
type Shadows = typeof shadows;

/**
 * FILE: packages/brand/src/tokens/index.ts
 * PURPOSE: Aggregated token export for @ummat/brand consumers.
 * INVARIANTS:
 *   - All token categories (colors, typography, spacing, borderRadius, shadows) must be
 *     re-exported under both their named exports and the `tokens` aggregate object.
 *   - The aggregate object shape is stable; consumers depend on `tokens.colors.green[400]`,
 *     `tokens.typography.fontFamilies.arabic`, etc.
 * DO NOT: rename top-level keys without a major version bump.
 * REF: T-P7-C-S10-01
 */

/**
 * Aggregated tokens object. Shape is stable across minor versions.
 */
declare const tokens: {
    readonly colors: {
        readonly green: {
            readonly 50: "#F4FBE8";
            readonly 100: "#C9F27A";
            readonly 400: "#79C24C";
            readonly 500: "#5A9438";
            readonly 700: "#1E5E2F";
            readonly 900: "#0D2F17";
        };
        readonly semantic: {
            readonly brand: "#79C24C";
            readonly brandOnLight: "#5A9438";
            readonly brandDark: "#1E5E2F";
            readonly brandDeep: "#0D2F17";
            readonly brandLight: "#C9F27A";
            readonly brandWash: "#F4FBE8";
            readonly textOnLight: "#0D2F17";
            readonly textOnDark: "#F4FBE8";
            readonly accent: "#79C24C";
            readonly textOnWhite: "#1E5E2F";
            readonly textOnDark2: "#C9F27A";
        };
    };
    readonly typography: {
        readonly fontFamilies: {
            readonly sans: readonly ["var(--font-latin)", "Geist", "Inter", "system-ui", "sans-serif"];
            readonly mono: readonly ["var(--font-mono)", "Geist Mono", "ui-monospace", "monospace"];
            readonly arabic: readonly ["var(--font-arabic)", "\"Noto Naskh Arabic\"", "serif"];
            readonly quran: readonly ["var(--font-quran)", "Amiri", "\"Noto Naskh Arabic\"", "serif"];
        };
        readonly fontWeights: {
            readonly regular: 400;
            readonly medium: 500;
            readonly semibold: 600;
            readonly bold: 700;
            readonly extrabold: 800;
        };
        readonly fontSizes: {
            readonly xs: "0.75rem";
            readonly sm: "0.875rem";
            readonly base: "1rem";
            readonly lg: "1.125rem";
            readonly xl: "1.25rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "1.875rem";
            readonly '4xl': "2.25rem";
            readonly '5xl': "3rem";
            readonly '6xl': "3.75rem";
        };
        readonly lineHeights: {
            readonly tight: 1.15;
            readonly snug: 1.3;
            readonly normal: 1.5;
            readonly relaxed: 1.65;
            readonly loose: 1.85;
        };
    };
    readonly spacing: {
        readonly 0: "0px";
        readonly 1: "0.25rem";
        readonly 2: "0.5rem";
        readonly 3: "0.75rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 8: "2rem";
        readonly 10: "2.5rem";
        readonly 12: "3rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 32: "8rem";
    };
    readonly borderRadius: {
        readonly none: "0px";
        readonly sm: "0.25rem";
        readonly md: "0.5rem";
        readonly lg: "0.75rem";
        readonly xl: "1rem";
        readonly '2xl': "1.5rem";
        readonly full: "9999px";
    };
    readonly shadows: {
        readonly sm: "0 1px 2px 0 rgba(13, 47, 23, 0.06)";
        readonly md: "0 4px 6px -1px rgba(13, 47, 23, 0.10), 0 2px 4px -2px rgba(13, 47, 23, 0.06)";
        readonly lg: "0 10px 15px -3px rgba(13, 47, 23, 0.12), 0 4px 6px -4px rgba(13, 47, 23, 0.08)";
        readonly xl: "0 20px 25px -5px rgba(13, 47, 23, 0.15), 0 8px 10px -6px rgba(13, 47, 23, 0.10)";
    };
};
type Tokens = typeof tokens;

export { type BorderRadius, type Colors, type FontFamilies, type FontSizes, type FontWeights, type GreenScale, type GreenStop, type LineHeights, type SemanticColors, type Shadows, type Spacing, type Tokens, type Typography, borderRadius, colors, fontFamilies, fontSizes, fontWeights, green, lineHeights, semantic, shadows, spacing, tokens, typography };
