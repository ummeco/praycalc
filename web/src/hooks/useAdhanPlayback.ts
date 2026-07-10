/**
 * useAdhanPlayback.ts — Fires a beep/adhan sound when the clock crosses a
 * prayer time.
 *
 * PURPOSE: Extracted from CityClient.tsx (file-size split, ASI Policy 3 — one
 * responsibility per unit) so the orchestrator component stays under the
 * 300-line cap. Behavior is unchanged from the inline effect it replaces.
 * INPUTS: the per-second clock string (HH:MM:SS in the city's timezone),
 *   current settings, both madhab prayer-time sets, and the fixed-method
 *   Fajr/Isha overlay (null when DPC is selected).
 * OUTPUTS: none — side-effect only (plays a beep tone or an adhan audio file
 *   once per prayer per day).
 * CONSTRAINTS: Client-only. Owns its own refs so callers don't need to.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useRef } from 'react';
import { DISPLAY_PRAYERS, type PrayerResult } from '@/lib/prayer-utils';
import type { PrayCalcSettings } from '@/lib/settings';

export function useAdhanPlayback(
  clockHHMMSS: string,
  settings: PrayCalcSettings,
  shafiPrayers: PrayerResult,
  hanafiPrayers: PrayerResult,
  methodOverlay: { Fajr: string; Isha: string } | null,
): void {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAdhanPrayer = useRef<string>('');

  useEffect(() => {
    if (settings.soundMode === 'none' || !clockHHMMSS) return;
    const base = settings.hanafi ? hanafiPrayers : shafiPrayers;
    const prayers = methodOverlay
      ? { ...base, Fajr: methodOverlay.Fajr, Isha: methodOverlay.Isha }
      : base;
    const hhmm = clockHHMMSS.slice(0, 5);
    const ss = clockHHMMSS.slice(6, 8);
    if (ss !== '00') return; // only fire at the top of the minute

    for (const p of DISPLAY_PRAYERS) {
      if (prayers[p] !== 'N/A' && prayers[p].slice(0, 5) === hhmm) {
        if (lastAdhanPrayer.current === `${p}-${hhmm}`) break; // avoid double-trigger
        lastAdhanPrayer.current = `${p}-${hhmm}`;

        if (settings.soundMode === 'beep') {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
          } catch { /* AudioContext blocked by browser policy */ }
        } else {
          const voice = settings.adhanVoice ?? 'makkah';
          const src =
            p === 'Fajr' && voice === 'mishari'
              ? '/audio/fajr-mishari.mp3'
              : `/audio/adhan/${voice}.mp3`;
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          const audio = new Audio(src);
          audioRef.current = audio;
          audio.play().catch(() => {/* autoplay blocked */});
        }
        break;
      }
    }
  }, [clockHHMMSS, settings, shafiPrayers, hanafiPrayers, methodOverlay]);
}
