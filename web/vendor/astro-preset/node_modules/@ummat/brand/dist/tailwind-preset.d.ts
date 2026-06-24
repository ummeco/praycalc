import { Config } from 'tailwindcss';

/**
 * FILE: packages/brand/src/tailwind-preset.ts
 * PURPOSE: Tailwind v3 preset exposing Ummat tokens as utility classes.
 * INVARIANTS:
 *   - Targets Tailwind v3.3+ (logical properties + text-start/end native).
 *   - Tailwind v4 consumers configure via @theme in globals.css — see packages/shared/tailwind/preset.ts.
 *   - The `green` palette object MUST match tokens/colors.ts canonical hex values.
 *   - No external plugins beyond a small RTL variant plugin (already shipped by @ummat/shared).
 * DO NOT: extend colors outside the green family here; consumer apps add brand-adjacent colors
 *   via their own tailwind.config.ts `theme.extend`.
 * REF: T-P7-C-S10-01, T-P7-C-S10-02
 */

declare const ummatBrandPreset: Config;

export { ummatBrandPreset as default, ummatBrandPreset };
