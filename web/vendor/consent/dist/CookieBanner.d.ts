import type { CookieBannerStrings, ConsentRegion } from './types.js';
export interface CookieBannerProps {
    strings?: CookieBannerStrings;
    region?: ConsentRegion;
    privacyPolicyUrl?: string;
    cookiePolicyUrl?: string;
}
export declare function CookieBanner({ strings, region, privacyPolicyUrl, cookiePolicyUrl, }: CookieBannerProps): import("react/jsx-runtime").JSX.Element | null;
//# sourceMappingURL=CookieBanner.d.ts.map