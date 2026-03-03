"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { PrayerResult } from "@/lib/prayer-utils";
import type { AdhanVoice } from "@/lib/settings";
import type { SoundMode } from "./useSettings";

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.5);
  } catch {
    // Audio not available
  }
}

export interface AdhanState {
  arrivedPrayer: keyof PrayerResult | null;
  adhanPlaying: boolean;
  /** Stable refs kept in sync with current sound settings — consumed by useClock. */
  soundModeRef: React.MutableRefObject<SoundMode>;
  mutedPrayersRef: React.MutableRefObject<Set<string>>;
  stopAdhan: () => void;
  handleOverlayClose: () => void;
  /**
   * Call when a prayer arrives. Always shows the overlay; plays audio only
   * when soundMode !== "none" and the prayer is not muted (mirrors original).
   */
  triggerArrival: (arrived: keyof PrayerResult) => void;
}

interface UseAdhanOptions {
  soundMode: SoundMode;
  adhanVoice: AdhanVoice;
  mutedPrayers: Set<string>;
}

export function useAdhan({
  soundMode,
  adhanVoice,
  mutedPrayers,
}: UseAdhanOptions): AdhanState {
  const [arrivedPrayer, setArrivedPrayer] = useState<keyof PrayerResult | null>(null);
  const [adhanPlaying, setAdhanPlaying] = useState(false);

  const adhanRef = useRef<HTMLAudioElement | null>(null);
  const adhanPlayedRef = useRef(false);
  const arrivalDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs so closures (audio.onended, tick) always see latest values
  const soundModeRef = useRef<SoundMode>(soundMode);
  const adhanVoiceRef = useRef<AdhanVoice>(adhanVoice);
  const mutedPrayersRef = useRef<Set<string>>(mutedPrayers);

  soundModeRef.current = soundMode;
  adhanVoiceRef.current = adhanVoice;
  mutedPrayersRef.current = mutedPrayers;

  const stopAdhan = useCallback(() => {
    if (adhanRef.current) {
      adhanRef.current.pause();
      adhanRef.current.currentTime = 0;
      adhanRef.current = null;
    }
    if (arrivalDismissTimerRef.current) {
      clearTimeout(arrivalDismissTimerRef.current);
      arrivalDismissTimerRef.current = null;
    }
    setAdhanPlaying(false);
  }, []);

  const handleOverlayClose = useCallback(() => {
    stopAdhan();
    setArrivedPrayer(null);
  }, [stopAdhan]);

  // Auto-dismiss arrival overlay: 60s fallback if no adhan; 5s after adhan ends
  useEffect(() => {
    if (arrivalDismissTimerRef.current) {
      clearTimeout(arrivalDismissTimerRef.current);
      arrivalDismissTimerRef.current = null;
    }
    if (!arrivedPrayer) {
      adhanPlayedRef.current = false;
      return;
    }
    arrivalDismissTimerRef.current = setTimeout(() => {
      stopAdhan();
      setArrivedPrayer(null);
    }, 60_000);
    return () => {
      if (arrivalDismissTimerRef.current) {
        clearTimeout(arrivalDismissTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arrivedPrayer]);

  /**
   * Always shows the overlay. Plays audio only if soundMode !== "none" and
   * the prayer is not muted — matching the original CityPageClient behavior.
   */
  const triggerArrival = useCallback((arrived: keyof PrayerResult) => {
    // Always show the arrival overlay regardless of sound/mute state
    setArrivedPrayer(arrived);

    // Play audio only when sound is enabled and prayer is not muted
    if (
      soundModeRef.current !== "none" &&
      !mutedPrayersRef.current.has(arrived)
    ) {
      if (soundModeRef.current === "beep") {
        playBeep();
      } else {
        try {
          const adhanFile =
            arrived === "Fajr"
              ? "/adhan/fajr-mishari.mp3"
              : `/adhan/${adhanVoiceRef.current}.mp3`;
          const audio = new Audio(adhanFile);
          adhanRef.current = audio;
          setAdhanPlaying(true);
          audio.onended = () => {
            adhanRef.current = null;
            setAdhanPlaying(false);
            adhanPlayedRef.current = true;
            // Dismiss overlay 5s after adhan ends
            if (arrivalDismissTimerRef.current)
              clearTimeout(arrivalDismissTimerRef.current);
            arrivalDismissTimerRef.current = setTimeout(
              () => setArrivedPrayer(null),
              5_000,
            );
          };
          audio.play().catch(() => {
            adhanRef.current = null;
            setAdhanPlaying(false);
          });
        } catch {
          // Audio not available
        }
      }
    }
  }, []);

  return {
    arrivedPrayer,
    adhanPlaying,
    soundModeRef,
    mutedPrayersRef,
    stopAdhan,
    handleOverlayClose,
    triggerArrival,
  };
}
