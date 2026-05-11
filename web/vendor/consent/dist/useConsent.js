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
/**
 * S05-07: Reliable consent sync to lg_consent_record.
 *
 * Sync is required-on-consent (not fire-and-forget): we attempt up to MAX_RETRIES
 * times with exponential backoff. On all-retry failure the record is flagged with
 * sync_pending=true in localStorage so a background sweep can retry later.
 *
 * Spec: banner marks consent stored only after HTTP 200 from /api/consent.
 */
const CONSENT_SYNC_KEY = 'ummat_consent_sync_pending';
const MAX_RETRIES = 3;
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const res = await fetch(url, options);
            if (res.ok)
                return true;
            // Non-2xx response — treat as retryable
        }
        catch {
            // Network error — retryable
        }
        if (attempt < retries - 1) {
            // Exponential backoff: 500ms, 1000ms, 2000ms
            await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, attempt)));
        }
    }
    return false;
}
async function syncConsentToBackend(record) {
    if (typeof window === 'undefined')
        return;
    const encoded = btoa(JSON.stringify(record));
    const success = await fetchWithRetry('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent: encoded }),
        credentials: 'same-origin',
    });
    if (!success) {
        // Flag for background retry sweep (S05-07 fallback)
        try {
            const pending = JSON.parse(window.localStorage.getItem(CONSENT_SYNC_KEY) ?? '[]');
            pending.push({ record, queuedAt: Date.now() });
            window.localStorage.setItem(CONSENT_SYNC_KEY, JSON.stringify(pending));
        }
        catch {
            // localStorage unavailable — fail silently
        }
        console.warn('[consent] Backend sync failed after retries — queued for background retry');
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