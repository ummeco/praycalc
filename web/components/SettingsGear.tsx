"use client";

import { useState, useEffect, useRef } from "react";
import SettingsPanel from "./SettingsPanel";
import type { AdhanVoice, HomeMode } from "@/lib/settings";
import type { SoundMode } from "@/hooks/useSettings";

interface Props {
  // Display toggles
  lightMode: boolean;
  hanafi: boolean;
  use24h: boolean;
  countdown: boolean;
  showQiyam: boolean;
  onToggleLightMode: () => void;
  onToggleHanafi: () => void;
  onToggleUse24h: () => void;
  onToggleCountdown: () => void;
  onToggleShowQiyam: () => void;

  // Sound
  soundMode: SoundMode;
  adhanVoice: AdhanVoice;
  onSetSoundMode: (mode: SoundMode) => void;
  onSetAdhanVoice: (voice: AdhanVoice) => void;

  // Home city
  homeMode: HomeMode;
  homeCity: { slug: string; name: string } | null;
  locationName: string;
  onSetHomeMode: (mode: HomeMode) => void;
  onClearHome: () => void;
  onSetHomeCityThisCity: () => void;
  onSwitchHomeModeToCity: () => void;

  // Auth
  isLoggedIn?: boolean;
  userName?: string;
  userInitials?: string;
  userPhotoUrl?: string;
  onLogin: () => void;
  onLogout?: () => void;
}

export default function SettingsGear(props: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="settings-gear-btn"
        aria-label="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {open && <SettingsPanel {...props} />}
    </div>
  );
}
