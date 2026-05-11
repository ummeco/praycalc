"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { useConsent } from './useConsent.js';
export function ConsentGatedScript({ category, src, strategy = 'afterInteractive', ...rest }) {
    const { categories, hasConsented } = useConsent();
    // Only inject the script once consent has been recorded AND the specific
    // category is accepted.  Before consent is given, hasConsented=false so
    // we wait; after rejection the category boolean is false — script stays out.
    if (!hasConsented || !categories[category])
        return null;
    // We render a plain <script> element rather than importing next/script to
    // keep this package free of Next.js peer dependencies.  next/script's
    // "afterInteractive" strategy is equivalent to defer/async on a script that
    // executes after hydration — achieved here by conditionally mounting the
    // element only after the client-side consent check.
    return (_jsx("script", { src: src, async: true, ...rest }));
}
//# sourceMappingURL=ConsentGatedScript.js.map