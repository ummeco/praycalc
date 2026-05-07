export type CookieCategory = 'strictly-necessary' | 'functional' | 'analytics' | 'marketing';
export type ConsentVersion = string;
export interface ConsentCategories {
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
}
export interface ConsentRecord {
    version: ConsentVersion;
    timestamp: number;
    categories: ConsentCategories;
    doNotTrack: boolean;
    doNotSell: boolean;
    explicit: boolean;
}
export type ConsentRegion = 'EU' | 'CA' | 'GLOBAL';
export interface CookieEntry {
    name: string;
    app: string;
    setBy: string;
    category: CookieCategory;
    durationDays: number | 'session';
    purpose: string;
    strictlyNecessary: boolean;
}
export interface CookieBannerStrings {
    title?: string;
    body?: string;
    acceptAll?: string;
    rejectNonEssential?: string;
    customize?: string;
}
export interface PreferencesModalStrings {
    title?: string;
    save?: string;
    cancel?: string;
    strictlyNecessaryLabel?: string;
    strictlyNecessaryDesc?: string;
    functionalLabel?: string;
    functionalDesc?: string;
    analyticsLabel?: string;
    analyticsDesc?: string;
    marketingLabel?: string;
    marketingDesc?: string;
    alwaysOn?: string;
}
//# sourceMappingURL=types.d.ts.map