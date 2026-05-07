import React from 'react';
import type { ConsentRecord } from './types.js';
interface ConsentContextValue {
    record: ConsentRecord | null;
    hasConsented: boolean;
    needsBanner: boolean;
    categories: ConsentRecord['categories'];
    openPreferences: () => void;
    closePreferences: () => void;
    preferencesOpen: boolean;
    acceptAll: () => void;
    rejectNonEssential: () => void;
    saveCategories: (cats: ConsentRecord['categories']) => void;
    resetConsent: () => void;
}
export interface ConsentProviderProps {
    children: React.ReactNode;
    onConsentChange?: (record: ConsentRecord) => void;
}
export declare function ConsentProvider({ children, onConsentChange }: ConsentProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function useConsent(): ConsentContextValue;
export {};
//# sourceMappingURL=useConsent.d.ts.map