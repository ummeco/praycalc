/**
 * S-C-S05-T03 — Locale resolver for @ummat/consent strings.
 *
 * Messages inlined as TypeScript constants so the package ships as a single
 * compiled .js entry per file with no JSON-asset bundling concerns. EN + AR
 * are committed translations; ID / UR / BN fall back to EN with a dev-only
 * console warning until translated (mark them up in CI as "missing locale").
 *
 * Source-of-truth for the message TEXT remains the en.json / ar.json files
 * under src/messages/ for translator workflow; this module mirrors them.
 * When translations land, sync both places (CI gate planned).
 */
export type ConsentLocale = 'en' | 'ar' | 'id' | 'ur' | 'bn';
export interface ConsentMessages {
    banner: {
        title: string;
        body: string;
        acceptAll: string;
        rejectNonEssential: string;
        customize: string;
        privacyLink: string;
        cookieLink: string;
        eeaNote: string;
    };
    preferences: {
        title: string;
        save: string;
        cancel: string;
        withdrawAll: string;
        alwaysOn: string;
        strictlyNecessary: string;
        strictlyNecessaryDesc: string;
        functional: string;
        functionalDesc: string;
        analytics: string;
        analyticsDesc: string;
        marketing: string;
        marketingDesc: string;
    };
}
export declare function getMessages(locale: string | undefined): ConsentMessages;
export declare function isRtlLocale(locale: string | undefined): boolean;
//# sourceMappingURL=i18n.d.ts.map