/**
 * Purpose: Step-progression state machine for the multi-step onboarding flow —
 *   separated from the screen component so step-advance/skip logic is unit
 *   testable without rendering React Native views.
 * Inputs: none (self-contained useState).
 * Outputs: current step id/index, total step count, next()/back()/skipToEnd()/
 *   goTo() controls.
 * Constraints: STEPS order is the single source of truth for step sequence.
 *   skipToEnd() jumps straight to 'done' — callers are still responsible for
 *   applying sensible default settings (DPC method, onboardingDone=true, a
 *   location if one was never captured) before calling it, this hook only
 *   tracks which screen is showing.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-onboarding-flow-hook
 */

import { useState, useCallback, useMemo } from 'react';

export const ONBOARDING_STEPS = ['welcome', 'location', 'notifications', 'method', 'consent', 'done'] as const;
export type OnboardingStepId = typeof ONBOARDING_STEPS[number];

export interface OnboardingFlowState {
  step: OnboardingStepId;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  next: () => void;
  back: () => void;
  skipToEnd: () => void;
  goTo: (step: OnboardingStepId) => void;
}

export function useOnboardingFlow(): OnboardingFlowState {
  const [step, setStep] = useState<OnboardingStepId>(ONBOARDING_STEPS[0]);

  const stepIndex = ONBOARDING_STEPS.indexOf(step);
  const totalSteps = ONBOARDING_STEPS.length;
  const isLastStep = stepIndex === totalSteps - 1;

  const next = useCallback(() => {
    setStep((current) => {
      const idx = ONBOARDING_STEPS.indexOf(current);
      const nextIdx = Math.min(idx + 1, ONBOARDING_STEPS.length - 1);
      return ONBOARDING_STEPS[nextIdx];
    });
  }, []);

  const back = useCallback(() => {
    setStep((current) => {
      const idx = ONBOARDING_STEPS.indexOf(current);
      const prevIdx = Math.max(idx - 1, 0);
      return ONBOARDING_STEPS[prevIdx];
    });
  }, []);

  const skipToEnd = useCallback(() => {
    setStep('done');
  }, []);

  const goTo = useCallback((target: OnboardingStepId) => {
    setStep(target);
  }, []);

  return useMemo(
    () => ({ step, stepIndex, totalSteps, isLastStep, next, back, skipToEnd, goTo }),
    [step, stepIndex, totalSteps, isLastStep, next, back, skipToEnd, goTo],
  );
}
