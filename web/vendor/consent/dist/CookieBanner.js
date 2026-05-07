"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useConsent } from './useConsent.js';
const DEFAULT_STRINGS = {
    title: 'We use cookies',
    body: 'We use cookies to improve your experience. Non-essential cookies are only set with your consent.',
    acceptAll: 'Accept all',
    rejectNonEssential: 'Reject non-essential',
    customize: 'Manage preferences',
};
export function CookieBanner({ strings, region, privacyPolicyUrl = '/privacy', cookiePolicyUrl = '/cookies', }) {
    const { needsBanner, acceptAll, rejectNonEssential, openPreferences } = useConsent();
    const s = { ...DEFAULT_STRINGS, ...strings };
    if (!needsBanner)
        return null;
    const isEu = region === 'EU';
    return (_jsx("div", { role: "dialog", "aria-modal": "false", "aria-label": "Cookie consent", className: "fixed bottom-0 left-0 right-0 z-50 bg-[#0D2F17] border-t border-[#1E5E2F] shadow-lg", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-5", children: _jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-semibold text-[#C9F27A] mb-1", children: s.title }), _jsxs("p", { className: "text-sm text-gray-300 leading-relaxed", children: [s.body, ' ', _jsx("a", { href: privacyPolicyUrl, className: "underline text-[#79C24C] hover:text-[#C9F27A] transition-colors", children: "Privacy Policy" }), ' · ', _jsx("a", { href: cookiePolicyUrl, className: "underline text-[#79C24C] hover:text-[#C9F27A] transition-colors", children: "Cookie Policy" }), isEu && (_jsx("span", { className: "ml-2 text-gray-400 text-xs", children: "(EEA \u2014 GDPR applies)" }))] })] }), _jsxs("div", { className: "flex flex-wrap gap-2 flex-shrink-0", children: [_jsx("button", { type: "button", onClick: rejectNonEssential, className: "px-4 py-2 text-sm rounded-md border border-gray-500 text-gray-300 hover:border-gray-300 hover:text-white transition-colors whitespace-nowrap", children: s.rejectNonEssential }), _jsx("button", { type: "button", onClick: openPreferences, className: "px-4 py-2 text-sm rounded-md border border-[#79C24C] text-[#79C24C] hover:border-[#C9F27A] hover:text-[#C9F27A] transition-colors whitespace-nowrap", children: s.customize }), _jsx("button", { type: "button", onClick: acceptAll, className: "px-4 py-2 text-sm rounded-md bg-[#79C24C] text-[#0D2F17] font-semibold hover:bg-[#C9F27A] transition-colors whitespace-nowrap", children: s.acceptAll })] })] }) }) }));
}
//# sourceMappingURL=CookieBanner.js.map