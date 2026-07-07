/**
 * Purpose: Onboarding route — thin wrapper mounting the multi-step onboarding
 *   flow (welcome → location → notifications → method → consent → done).
 * Inputs: none.
 * Outputs: <OnboardingFlow /> screen.
 * Constraints: Route stays thin — all step logic lives in
 *   src/features/onboarding/** so it is unit-testable independent of expo-router.
 * SPORT: REGISTRY-ROUTES.md#praycalc-mobile-onboarding
 */

import React from 'react';
import { OnboardingFlow } from '../../features/onboarding/OnboardingFlow';

export default function OnboardingScreen() {
  return <OnboardingFlow />;
}
