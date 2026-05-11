/**
 * NpsWidget (PrayCalc wrapper) — Sprint C-S16 T01c
 *
 * Thin wrapper around `@ummat/feedback`'s NpsWidget for the PrayCalc web
 * surface. Wires Umami event tracking from `window.umami` (D-P3-21).
 *
 * Touchpoints (PrayCalc): after 3rd prayer alarm set, after Ramadan
 * calendar viewed (per T01 spec).
 */
'use client';
import React, { useCallback } from 'react';
import { NpsWidget as BaseNpsWidget } from '@ummat/feedback';

interface UmamiGlobal {
  umami?: {
    track: (event: string, props?: Record<string, unknown>) => void;
  };
}

function emitUmami(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const g = window as unknown as UmamiGlobal;
  if (g.umami && typeof g.umami.track === 'function') {
    g.umami.track(event, props);
  }
}

export interface NpsWidgetProps {
  userId: string;
  touchpoint: string;
  onSubmit?: (score: number, responseId: string | null) => void;
  onDismiss?: () => void;
}

export function NpsWidget(props: NpsWidgetProps): React.ReactElement {
  const handleSubmit = useCallback(
    (score: number, responseId: string | null) => {
      if (props.onSubmit) props.onSubmit(score, responseId);
    },
    [props],
  );
  return (
    <BaseNpsWidget
      userId={props.userId}
      appId="praycalc"
      touchpoint={props.touchpoint}
      onSubmit={handleSubmit}
      onDismiss={props.onDismiss}
      umami={emitUmami}
    />
  );
}
