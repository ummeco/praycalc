/**
 * NpsWidget (PrayCalc — self-contained shim) — Sprint C-S16 T01c / P7-W25-fix
 *
 * Inlined from @ummat/feedback so praycalc (standalone repo) does not require a
 * workspace link. When @ummat/feedback is published to npm in P8, replace this
 * file with:
 *   import { NpsWidget as BaseNpsWidget } from '@ummat/feedback';
 *
 * Touchpoints (PrayCalc): after 3rd prayer alarm set, after Ramadan calendar
 * viewed (per T01 spec). Wires Umami event tracking from window.umami (D-P3-21).
 *
 * Public interface is unchanged: { userId, touchpoint, onSubmit?, onDismiss? }.
 */
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Inline types (mirrors @ummat/feedback/src/types.ts)
// ---------------------------------------------------------------------------

interface NpsSubmissionPayload {
  user_id: string;
  app_id: string;
  score: number;
  touchpoint: string;
}

interface NpsSubmissionResponse {
  id?: string | null;
}

// ---------------------------------------------------------------------------
// Submit helper
// ---------------------------------------------------------------------------

async function submitNps(
  endpoint: string,
  payload: NpsSubmissionPayload,
): Promise<NpsSubmissionResponse> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => res.statusText);
    throw new Error(`NPS submission failed (${res.status}): ${txt}`);
  }
  return res.json() as Promise<NpsSubmissionResponse>;
}

// ---------------------------------------------------------------------------
// Umami helper
// ---------------------------------------------------------------------------

interface UmamiGlobal {
  umami?: { track: (event: string, props?: Record<string, unknown>) => void };
}

function emitUmami(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const g = window as unknown as UmamiGlobal;
  if (g.umami && typeof g.umami.track === 'function') {
    g.umami.track(event, props);
  }
}

// ---------------------------------------------------------------------------
// Brand constants (Ummat green palette)
// ---------------------------------------------------------------------------

const BRAND = '#1E5E2F';
const BRAND_LIGHT = '#C9F27A';
const PROMPT_TEXT = 'How likely are you to recommend PrayCalc to a friend?';

type WidgetState = 'idle' | 'submitting' | 'submitted' | 'error';

// ---------------------------------------------------------------------------
// Public interface — unchanged from previous wrapper
// ---------------------------------------------------------------------------

export interface NpsWidgetProps {
  userId: string;
  touchpoint: string;
  onSubmit?: (score: number, responseId: string | null) => void;
  onDismiss?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NpsWidget(props: NpsWidgetProps): React.ReactElement | null {
  const { userId, touchpoint, onSubmit, onDismiss } = props;

  const [state, setState] = useState<WidgetState>('idle');
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shownFiredRef = useRef(false);

  useEffect(() => {
    if (shownFiredRef.current) return;
    shownFiredRef.current = true;
    emitUmami('nps_widget_shown', { app_id: 'praycalc', touchpoint });
  }, [touchpoint]);

  const handleScore = useCallback(
    async (value: number) => {
      if (state === 'submitting' || state === 'submitted') return;
      setScore(value);
      setState('submitting');
      setError(null);
      try {
        const res = await submitNps('/api/nps', {
          user_id: userId,
          app_id: 'praycalc',
          score: value,
          touchpoint,
        });
        setState('submitted');
        emitUmami('nps_score_submitted', { app_id: 'praycalc', touchpoint, score: value });
        if (onSubmit) onSubmit(value, res.id ?? null);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Submission failed';
        setError(msg);
        setState('error');
      }
    },
    [state, userId, touchpoint, onSubmit],
  );

  const handleDismiss = useCallback(() => {
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  if (state === 'submitted') {
    return (
      <div
        role="status"
        aria-live="polite"
        data-testid="nps-widget-thanks"
        style={{ padding: '1rem', borderRadius: '8px', background: BRAND_LIGHT, color: BRAND }}
      >
        Thanks for the feedback.
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Net Promoter Score"
      data-testid="nps-widget"
      style={{
        padding: '1rem',
        borderRadius: '8px',
        background: '#fff',
        border: `1px solid ${BRAND}`,
        maxWidth: '420px',
      }}
    >
      <p style={{ margin: 0, marginBottom: '0.75rem', fontWeight: 600 }}>{PROMPT_TEXT}</p>
      <div
        role="radiogroup"
        aria-label="NPS score"
        style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '0.5rem' }}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={score === i}
            disabled={state === 'submitting'}
            onClick={() => handleScore(i)}
            data-testid={`nps-score-${i}`}
            style={{
              minWidth: '32px',
              minHeight: '32px',
              borderRadius: '4px',
              border: `1px solid ${BRAND}`,
              background: score === i ? BRAND : '#fff',
              color: score === i ? '#fff' : BRAND,
              cursor: state === 'submitting' ? 'wait' : 'pointer',
              fontWeight: 600,
            }}
          >
            {i}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#555' }}>
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
      {state === 'error' && error && (
        <p
          role="alert"
          data-testid="nps-widget-error"
          style={{ color: '#a00', fontSize: '0.85rem', marginTop: '0.5rem' }}
        >
          {error}
        </p>
      )}
      <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
        <button
          type="button"
          onClick={handleDismiss}
          data-testid="nps-widget-dismiss"
          style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
