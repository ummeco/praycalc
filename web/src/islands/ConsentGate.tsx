/**
 * ConsentGate.tsx — Astro island wiring @ummat/consent into PrayCalc.
 *
 * PURPOSE: Single client entry point for cookie consent — mounts the
 *   ConsentProvider context, the CookieBanner, the PreferencesModal, and gates
 *   the Umami analytics script behind the "analytics" consent category so it
 *   never loads before the user consents (GDPR Art. 6/7).
 * INPUTS: umamiSiteId (optional — Umami script is omitted entirely if unset)
 * OUTPUTS: Cookie banner UI + preferences modal + consent-gated Umami script
 * CONSTRAINTS:
 *   - D-P3-21: Umami only, must not load before consent.
 *   - Restores consent-gating dropped in the Next.js→Astro migration.
 *   - Imports from the './components' and './hooks' subpaths, not the package
 *     root — the root barrel re-exports server-handler.ts (node:crypto),
 *     which breaks the client Vite bundle if pulled into a browser build.
 * REF: .github/docs/adr/ADR-consent-banner-astro-gate.md
 */

import { CookieBanner, PreferencesModal, ConsentGatedScript } from '@ummat/consent/components';
import { ConsentProvider } from '@ummat/consent/hooks';

interface Props {
  umamiSiteId?: string;
}

export default function ConsentGate({ umamiSiteId }: Props) {
  return (
    <ConsentProvider>
      <CookieBanner />
      <PreferencesModal appSlug="praycalc" />
      {umamiSiteId && (
        <ConsentGatedScript
          category="analytics"
          src="https://cloud.umami.is/script.js"
          data-website-id={umamiSiteId}
        />
      )}
    </ConsentProvider>
  );
}
