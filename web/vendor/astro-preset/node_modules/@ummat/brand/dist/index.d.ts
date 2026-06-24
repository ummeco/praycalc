export { BorderRadius, Colors, FontFamilies, FontSizes, FontWeights, GreenScale, GreenStop, LineHeights, SemanticColors, Shadows, Spacing, Tokens, Typography, borderRadius, colors, fontFamilies, fontSizes, fontWeights, green, lineHeights, semantic, shadows, spacing, tokens, typography } from './tokens/index.js';
export { defaultTheme, dhulHijjahTheme, eidTheme, getTheme, muharramTheme, ramadanTheme, themes } from './themes/index.js';
export { HijriDate, HijriMonth, getActiveTheme } from './seasonal.js';
import { B as BrandConfig } from './types-Bsw_Pzzw.js';
export { D as DbPrefix } from './types-Bsw_Pzzw.js';
export { default as ummatBrandPreset } from './tailwind-preset.js';
export { T as Theme, a as ThemeName } from './types-BL6p6X42.js';
export { chatislam } from './apps/chatislam.js';
export { flock } from './apps/flock.js';
export { islamwiki } from './apps/islamwiki.js';
export { praycalc } from './apps/praycalc.js';
export { ummatApp } from './apps/ummatApp.js';
export { ummatChat } from './apps/ummatChat.js';
export { ummatPro } from './apps/ummatPro.js';
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
