export const STORAGE_KEY = 'ummat_consent';
export const CURRENT_CONSENT_VERSION = '2';
function isServer() {
    return typeof window === 'undefined';
}
export function readConsent() {
    if (isServer())
        return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        if (!isValidConsentRecord(parsed))
            return null;
        if (parsed.version !== CURRENT_CONSENT_VERSION)
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
export function writeConsent(record) {
    if (isServer())
        return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    }
    catch {
        // Storage may be unavailable in private browsing — fail silently
    }
}
export function clearConsent() {
    if (isServer())
        return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    }
    catch {
        // Fail silently
    }
}
export function buildConsentRecord(categories, options = {}) {
    return {
        version: CURRENT_CONSENT_VERSION,
        timestamp: Date.now(),
        categories,
        doNotTrack: options.doNotTrack ?? false,
        doNotSell: options.doNotSell ?? false,
        explicit: true,
    };
}
export function buildAcceptAllRecord(options = {}) {
    return buildConsentRecord({ analytics: true, marketing: true, functional: true }, options);
}
export function buildRejectNonEssentialRecord(options = {}) {
    return buildConsentRecord({ analytics: false, marketing: false, functional: false }, options);
}
export function shouldRePrompt(record) {
    if (!record)
        return true;
    if (record.version !== CURRENT_CONSENT_VERSION)
        return true;
    return false;
}
function isValidConsentRecord(value) {
    if (!value || typeof value !== 'object')
        return false;
    const obj = value;
    if (typeof obj.version !== 'string')
        return false;
    if (typeof obj.timestamp !== 'number')
        return false;
    if (typeof obj.explicit !== 'boolean')
        return false;
    const cats = obj.categories;
    if (!cats || typeof cats !== 'object')
        return false;
    const c = cats;
    if (typeof c.analytics !== 'boolean')
        return false;
    if (typeof c.marketing !== 'boolean')
        return false;
    if (typeof c.functional !== 'boolean')
        return false;
    return true;
}
//# sourceMappingURL=storage.js.map