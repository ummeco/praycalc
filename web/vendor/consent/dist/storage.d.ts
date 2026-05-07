import type { ConsentRecord, ConsentVersion } from './types.js';
export declare const STORAGE_KEY = "ummat_consent";
export declare const CURRENT_CONSENT_VERSION: ConsentVersion;
export declare function readConsent(): ConsentRecord | null;
export declare function writeConsent(record: ConsentRecord): void;
export declare function clearConsent(): void;
export declare function buildConsentRecord(categories: ConsentRecord['categories'], options?: {
    doNotTrack?: boolean;
    doNotSell?: boolean;
}): ConsentRecord;
export declare function buildAcceptAllRecord(options?: {
    doNotTrack?: boolean;
    doNotSell?: boolean;
}): ConsentRecord;
export declare function buildRejectNonEssentialRecord(options?: {
    doNotTrack?: boolean;
    doNotSell?: boolean;
}): ConsentRecord;
export declare function shouldRePrompt(record: ConsentRecord | null): boolean;
//# sourceMappingURL=storage.d.ts.map