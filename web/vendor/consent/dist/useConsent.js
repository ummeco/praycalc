"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, } from 'react';
import { buildAcceptAllRecord, buildRejectNonEssentialRecord, buildConsentRecord, clearConsent, readConsent, shouldRePrompt, writeConsent, } from './storage.js';
const DEFAULT_CATEGORIES = {
    analytics: false,
    marketing: false,
    functional: false,
};
const ConsentContext = createContext({
    record: null,
    hasConsented: false,
    needsBanner: true,
    categories: DEFAULT_CATEGORIES,
    openPreferences: () => undefined,
    closePreferences: () => undefined,
    preferencesOpen: false,
    acceptAll: () => undefined,
    rejectNonEssential: () => undefined,
    saveCategories: () => undefined,
    resetConsent: () => undefined,
});
function detectDoNotTrack() {
    if (typeof navigator === 'undefined')
        return false;
    return navigator.doNotTrack === '1' || navigator.msDoNotTrack === '1';
}
async function syncConsentToBackend(record) {
    try {
        const encoded = btoa(JSON.stringify(record));
        await fetch('/api/consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ consent: encoded }),
            credentials: 'same-origin',
        });
    }
    catch {
        // Network sync is best-effort; localStorage is the source of truth
    }
}
export function ConsentProvider({ children, onConsentChange }) {
    const [record, setRecord] = useState(null);
    const [preferencesOpen, setPreferencesOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const onConsentChangeRef = useRef(onConsentChange);
    onConsentChangeRef.current = onConsentChange;
    useEffect(() => {
        setMounted(true);
        const stored = readConsent();
        const dnt = detectDoNotTrack();
        if (dnt && !stored) {
            const dntRecord = buildRejectNonEssentialRecord({ doNotTrack: true });
            writeConsent(dntRecord);
            setRecord(dntRecord);
        }
        else if (!shouldRePrompt(stored)) {
            setRecord(stored);
        }
    }, []);
    const persist = useCallback((r) => {
        writeConsent(r);
        setRecord(r);
        syncConsentToBackend(r);
        onConsentChangeRef.current?.(r);
    }, []);
    const acceptAll = useCallback(() => {
        const dnt = detectDoNotTrack();
        persist(buildAcceptAllRecord({ doNotTrack: dnt }));
        setPreferencesOpen(false);
    }, [persist]);
    const rejectNonEssential = useCallback(() => {
        const dnt = detectDoNotTrack();
        persist(buildRejectNonEssentialRecord({ doNotTrack: dnt }));
        setPreferencesOpen(false);
    }, [persist]);
    const saveCategories = useCallback((cats) => {
        const dnt = detectDoNotTrack();
        persist(buildConsentRecord(cats, { doNotTrack: dnt }));
        setPreferencesOpen(false);
    }, [persist]);
    const resetConsent = useCallback(() => {
        clearConsent();
        setRecord(null);
        setPreferencesOpen(false);
    }, []);
    const openPreferences = useCallback(() => setPreferencesOpen(true), []);
    const closePreferences = useCallback(() => setPreferencesOpen(false), []);
    const needsBanner = mounted && record === null;
    const value = useMemo(() => ({
        record,
        hasConsented: record !== null,
        needsBanner,
        categories: record?.categories ?? DEFAULT_CATEGORIES,
        openPreferences,
        closePreferences,
        preferencesOpen,
        acceptAll,
        rejectNonEssential,
        saveCategories,
        resetConsent,
    }), [record, needsBanner, openPreferences, closePreferences, preferencesOpen, acceptAll, rejectNonEssential, saveCategories, resetConsent]);
    return (_jsx(ConsentContext.Provider, { value: value, children: children }));
}
export function useConsent() {
    return useContext(ConsentContext);
}
//# sourceMappingURL=useConsent.js.map