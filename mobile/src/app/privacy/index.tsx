/**
 * Purpose: Privacy & consent route — thin wrapper mounting the analytics-consent
 *   toggle screen (also reachable from onboarding). Keeps the privacy control
 *   discoverable after first launch so users can change their choice any time.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-privacy
 */
import React from 'react';
import { PrivacyConsentScreen } from '../../features/consent/screens/PrivacyConsentScreen';

export default function PrivacyRoute() {
  return <PrivacyConsentScreen />;
}
