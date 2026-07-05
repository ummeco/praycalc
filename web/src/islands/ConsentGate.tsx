/**
 * ConsentGate.tsx — GDPR/CCPA consent island for PrayCalc.
 *
 * PURPOSE: Single hydrated React tree hosting ConsentProvider + CookieBanner +
 *   PreferencesModal + the consent-gated Umami script. Astro islands do not
 *   share context across separate `client:*` boundaries, so the banner and the
 *   gated script must live in one component to see the same consent state.
 * INPUTS: umamiSiteId (Umami website id; script renders only once analytics
 *   consent is granted), umamiSrc (override for self-hosted Umami instances).
 * CONSTRAINTS: Astro island (client:load). SSR renders nothing (banner/modal
 *   default to closed pre-hydration; no script tag until consent exists) — see
 *   ConsentProvider's mounted-gate in @ummat/consent/useConsent.
 * REF: S05-12 · D-P3-21 (Umami, self-hosted) · GDPR Art 7 ·
 *   .claude/docs/compliance/cookie-consent-audit-2026-04-27.md
 */

import {
  ConsentProvider,
  CookieBanner,
  PreferencesModal,
  ConsentGatedScript,
} from '@ummat/consent';

export interface ConsentGateProps {
  umamiSiteId?: string;
  umamiSrc?: string;
}

export default function ConsentGate({
  umamiSiteId,
  umamiSrc = 'https://cloud.umami.is/script.js',
}: ConsentGateProps) {
  return (
    <ConsentProvider>
      <CookieBanner privacyPolicyUrl="/legal/privacy" cookiePolicyUrl="/legal/privacy" />
      <PreferencesModal appSlug="praycalc.com" />
      {umamiSiteId && (
        <ConsentGatedScript category="analytics" src={umamiSrc} data-website-id={umamiSiteId} />
      )}
    </ConsentProvider>
  );
}
