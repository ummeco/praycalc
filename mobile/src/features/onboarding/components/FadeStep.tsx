/**
 * Purpose: Gentle fade+slide transition wrapper for each onboarding step, keyed by
 *   step id so React remounts (and re-animates) on every step change.
 * Inputs: children (the step's content), a `stepKey` used only to force remount.
 * Outputs: FadeStep component — fades opacity 0→1 and slides translateY 12→0 on mount.
 * Constraints: Uses React Native's built-in Animated API (no new dependency) — this
 *   matches the task's "no new heavy deps" constraint even though reanimated is
 *   present elsewhere in the app; a simple mount fade doesn't need it.
 * SPORT: REGISTRY-COMPONENTS.md#praycalc-mobile-onboarding-fade-step
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface FadeStepProps {
  children: React.ReactNode;
}

export function FadeStep({ children }: FadeStepProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(12);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
