export { BorderRadius, Colors, FontFamilies, FontSizes, FontWeights, GreenScale, GreenStop, LineHeights, SemanticColors, Shadows, Spacing, Tokens, Typography, borderRadius, colors, fontFamilies, fontSizes, fontWeights, green, lineHeights, semantic, shadows, spacing, tokens, typography } from './tokens/index.mjs';
export { defaultTheme, dhulHijjahTheme, eidTheme, getTheme, muharramTheme, ramadanTheme, themes } from './themes/index.mjs';
export { HijriDate, HijriMonth, getActiveTheme } from './seasonal.mjs';
import { B as BrandConfig } from './types-Bsw_Pzzw.mjs';
export { D as DbPrefix } from './types-Bsw_Pzzw.mjs';
export { default as ummatBrandPreset } from './tailwind-preset.mjs';
export { T as Theme, a as ThemeName } from './types-BL6p6X42.mjs';
export { chatislam } from './apps/chatislam.mjs';
export { flock } from './apps/flock.mjs';
export { islamwiki } from './apps/islamwiki.mjs';
export { praycalc } from './apps/praycalc.mjs';
export { ummatApp } from './apps/ummatApp.mjs';
export { ummatChat } from './apps/ummatChat.mjs';
export { ummatPro } from './apps/ummatPro.mjs';
import 'tailwindcss';

declare const brands: {
    readonly praycalc: BrandConfig;
    readonly islamwiki: BrandConfig;
    readonly chatislam: BrandConfig;
    readonly flock: BrandConfig;
    readonly ummatApp: BrandConfig;
    readonly ummatPro: BrandConfig;
    readonly ummatChat: BrandConfig;
};
type Brands = typeof brands;
type BrandKey = keyof Brands;

export { BrandConfig, type BrandKey, type Brands, brands };
