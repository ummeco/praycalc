/**
 * Purpose: Verify the onboarding step-progression state machine — steps advance
 *   in order, back() reverses, skipToEnd() jumps straight to 'done' (a valid
 *   completion state), goTo() jumps to an arbitrary step.
 * Constraints: Exercises the hook via react-test-renderer's `act` + a minimal
 *   harness component (no @testing-library/react-hooks dependency present in
 *   this project — this avoids adding one).
 */

import React from 'react';
import { create, act } from 'react-test-renderer';
import { useOnboardingFlow, ONBOARDING_STEPS, type OnboardingFlowState } from '../useOnboardingFlow';

function renderFlowHook(): { current: OnboardingFlowState } {
  const ref: { current: OnboardingFlowState | null } = { current: null };

  function Harness() {
    ref.current = useOnboardingFlow();
    return null;
  }

  act(() => {
    create(React.createElement(Harness));
  });

  return ref as { current: OnboardingFlowState };
}

describe('useOnboardingFlow', () => {
  it('starts on the first step', () => {
    const hook = renderFlowHook();
    expect(hook.current.step).toBe(ONBOARDING_STEPS[0]);
    expect(hook.current.stepIndex).toBe(0);
    expect(hook.current.totalSteps).toBe(ONBOARDING_STEPS.length);
    expect(hook.current.isLastStep).toBe(false);
  });

  it('advances through every step in order via next()', () => {
    const hook = renderFlowHook();

    for (let i = 1; i < ONBOARDING_STEPS.length; i++) {
      act(() => hook.current.next());
      expect(hook.current.step).toBe(ONBOARDING_STEPS[i]);
      expect(hook.current.stepIndex).toBe(i);
    }
    expect(hook.current.isLastStep).toBe(true);
  });

  it('clamps at the final step — next() past the end is a no-op', () => {
    const hook = renderFlowHook();
    for (let i = 0; i < ONBOARDING_STEPS.length + 3; i++) {
      act(() => hook.current.next());
    }
    expect(hook.current.step).toBe(ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1]);
  });

  it('back() reverses one step and clamps at the first step', () => {
    const hook = renderFlowHook();
    act(() => hook.current.next());
    act(() => hook.current.next());
    expect(hook.current.stepIndex).toBe(2);

    act(() => hook.current.back());
    expect(hook.current.stepIndex).toBe(1);

    act(() => hook.current.back());
    act(() => hook.current.back());
    act(() => hook.current.back());
    expect(hook.current.stepIndex).toBe(0);
  });

  it('skipToEnd() jumps directly to the done step (a valid completion state)', () => {
    const hook = renderFlowHook();
    act(() => hook.current.skipToEnd());
    expect(hook.current.step).toBe('done');
    expect(hook.current.isLastStep).toBe(true);
  });

  it('goTo() jumps to an arbitrary step', () => {
    const hook = renderFlowHook();
    act(() => hook.current.goTo('method'));
    expect(hook.current.step).toBe('method');
    expect(hook.current.stepIndex).toBe(ONBOARDING_STEPS.indexOf('method'));
  });
});
