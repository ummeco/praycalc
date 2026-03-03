"use client";

import { useState, useEffect } from "react";
import {
  getSettings,
  saveSetting,
  type HomeMode,
  type AdhanVoice,
} from "@/lib/settings";

export type SoundMode = "none" | "beep" | "adhan";

export interface SettingsState {
  hanafi: boolean;
  use24h: boolean;
  lightMode: boolean;
  soundMode: SoundMode;
  adhanVoice: AdhanVoice;
  countdown: boolean;
  showQiyam: boolean;
  homeMode: HomeMode;
  homeCity: { slug: string; name: string } | null;
}

export interface SettingsActions {
  toggleHanafi: () => void;
  toggleUse24h: () => void;
  toggleLightMode: () => void;
  toggleCountdown: () => void;
  toggleShowQiyam: () => void;
  setSoundModeAndSave: (mode: SoundMode) => void;
  setAdhanVoiceAndSave: (voice: AdhanVoice) => void;
  setHomeModeAndSave: (mode: HomeMode) => void;
  clearHome: () => void;
  setHomeCityAndSave: (city: { slug: string; name: string }) => void;
}

export function useSettings(): SettingsState & SettingsActions {
  const [hanafi, setHanafi] = useState(false);
  const [use24h, setUse24h] = useState(false);
  const [lightMode, setLightMode] = useState(false);
  const [soundMode, setSoundMode] = useState<SoundMode>("none");
  const [adhanVoice, setAdhanVoice] = useState<AdhanVoice>("makkah");
  const [countdown, setCountdown] = useState(false);
  const [showQiyam, setShowQiyam] = useState(false);
  const [homeMode, setHomeMode] = useState<HomeMode>("none");
  const [homeCity, setHomeCity] = useState<{ slug: string; name: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const s = getSettings();
    setHanafi(s.hanafi);
    setUse24h(s.use24h);
    setLightMode(s.lightMode);
    setSoundMode(s.soundMode);
    setAdhanVoice(s.adhanVoice);
    setCountdown(s.countdown);
    setShowQiyam(s.showQiyam);
    setHomeMode(s.homeMode);
    setHomeCity(s.homeCity);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      lightMode ? "light" : "dark",
    );
    return () => document.documentElement.removeAttribute("data-theme");
  }, [lightMode]);

  function toggleHanafi() {
    const next = !hanafi;
    setHanafi(next);
    saveSetting("hanafi", next);
  }

  function toggleUse24h() {
    const next = !use24h;
    setUse24h(next);
    saveSetting("use24h", next);
  }

  function toggleLightMode() {
    const next = !lightMode;
    setLightMode(next);
    saveSetting("lightMode", next);
  }

  function toggleCountdown() {
    const next = !countdown;
    setCountdown(next);
    saveSetting("countdown", next);
  }

  function toggleShowQiyam() {
    const next = !showQiyam;
    setShowQiyam(next);
    saveSetting("showQiyam", next);
  }

  function setSoundModeAndSave(mode: SoundMode) {
    setSoundMode(mode);
    saveSetting("soundMode", mode);
  }

  function setAdhanVoiceAndSave(voice: AdhanVoice) {
    setAdhanVoice(voice);
    saveSetting("adhanVoice", voice);
  }

  function setHomeModeAndSave(mode: HomeMode) {
    setHomeMode(mode);
    saveSetting("homeMode", mode);
  }

  function clearHome() {
    setHomeMode("none");
    saveSetting("homeMode", "none");
    setHomeCity(null);
    saveSetting("homeCity", null);
  }

  function setHomeCityAndSave(city: { slug: string; name: string }) {
    setHomeCity(city);
    saveSetting("homeCity", city);
  }

  return {
    hanafi,
    use24h,
    lightMode,
    soundMode,
    adhanVoice,
    countdown,
    showQiyam,
    homeMode,
    homeCity,
    toggleHanafi,
    toggleUse24h,
    toggleLightMode,
    toggleCountdown,
    toggleShowQiyam,
    setSoundModeAndSave,
    setAdhanVoiceAndSave,
    setHomeModeAndSave,
    clearHome,
    setHomeCityAndSave,
  };
}
