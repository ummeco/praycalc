"use client";
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useConsent } from './useConsent.js';
/**
 * Returns true iff a consent record exists AND the given category is granted.
 *
 * Pre-consent (record === null) → false.
 * Post-reject              → false.
 * Post-accept              → true once the category is opted in.
 */
export function useConsentGate(category) {
    const { hasConsented, categories } = useConsent();
    if (!hasConsented)
        return false;
    return categories[category] === true;
}
/**
 * Declarative gating wrapper.  Use anywhere third-party scripts, embeds, or
 * analytics-bearing components live.  Example:
 *
 *   <ConsentGated category="analytics">
 *     <UmamiScript />
 *   </ConsentGated>
 *
 * SSR safety: the underlying useConsent hook sets needsBanner/categories
 * only after client mount (storage.readConsent is gated on `window`).  So
 * the server-side render of <ConsentGated> always returns the fallback
 * (or null).  This prevents flash-of-tracker content during hydration.
 */
export function ConsentGated({ category, children, fallback = null }) {
    const granted = useConsentGate(category);
    if (!granted)
        return _jsx(_Fragment, { children: fallback });
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=gating.js.map