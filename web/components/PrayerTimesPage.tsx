"use client";

import { useState, useEffect, useRef } from "react";
import {
  fmtTime,
  getNextPrayer,
  PRAYER_META,
  DISPLAY_PRAYERS,
  type PrayerResult,
} from "@/lib/prayer-utils";
import MoonPhase from "./MoonPhase";

interface Props {
  shafiPrayers: PrayerResult;
  hanafiPrayers: PrayerResult;
  locationName: string;
}

export default function PrayerTimesPage({
  shafiPrayers,
  hanafiPrayers,
  locationName,
}: Props) {
  const [hanafi, setHanafi] = useState(false);
  const [use24h, setUse24h] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [nextPrayer, setNextPrayer] = useState<keyof PrayerResult>("Fajr");
  const [currentTime, setCurrentTime] = useState("");
  const settingsRef = useRef<HTMLDivElement>(null);

  const prayers = hanafi ? hanafiPrayers : shafiPrayers;

  useEffect(() => {
    function tick() {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, "0");
      const mm = d.getMinutes().toString().padStart(2, "0");
      const t = `${hh}:${mm}`;
      setCurrentTime(t);
      setNextPrayer(getNextPrayer(prayers, t));
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [prayers]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  const displayTime = currentTime
    ? fmtTime(`${currentTime}:00`, use24h)
    : null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Location header + settings gear */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">{locationName}</h1>
          <p className="text-white/40 text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          {displayTime && (
            <p className="text-[#C9F27A] text-xs font-mono tracking-widest">
              {displayTime.time}{displayTime.period ? ` ${displayTime.period}` : ""}
            </p>
          )}
        </div>

        {/* Settings gear */}
        <div className="relative" ref={settingsRef}>
          <button
            type="button"
            onClick={() => setSettingsOpen((v) => !v)}
            className="settings-gear-btn"
            aria-label="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {settingsOpen && (
            <div className="settings-panel">
              <p className="settings-panel-title">Display</p>

              <div className="settings-row">
                <span className="settings-label">Hanafi Asr</span>
                <button
                  type="button"
                  aria-label={hanafi ? "Disable Hanafi Asr" : "Enable Hanafi Asr"}
                  onClick={() => setHanafi((v) => !v)}
                  className={`hanafi-track${hanafi ? " hanafi-track--on" : ""}`}
                >
                  <span className={`hanafi-thumb${hanafi ? " hanafi-thumb--on" : ""}`} />
                </button>
              </div>

              <div className="settings-row">
                <span className="settings-label">24-hour time</span>
                <button
                  type="button"
                  aria-label={use24h ? "Switch to 12-hour time" : "Switch to 24-hour time"}
                  onClick={() => setUse24h((v) => !v)}
                  className={`hanafi-track${use24h ? " hanafi-track--on" : ""}`}
                >
                  <span className={`hanafi-thumb${use24h ? " hanafi-thumb--on" : ""}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prayer times grid */}
      <div className="prayer-grid">
        {DISPLAY_PRAYERS.map((key) => {
          const { time, period } = fmtTime(prayers[key], use24h);
          const meta = PRAYER_META[key];
          const isNext = key === nextPrayer;

          return (
            <div
              key={key}
              className={`prayer-row${isNext ? " prayer-row--next" : ""}`}
            >
              {/* Left: name */}
              <div>
                <p className={`text-sm font-semibold ${isNext ? "text-[#C9F27A]" : "text-white/90"}`}>
                  {meta.en}
                </p>
                <p className="text-white/35 text-xs arabic leading-tight">{meta.ar}</p>
              </div>

              {/* Right: time + next badge */}
              <div className="flex items-center gap-3">
                {isNext && <span className="next-badge">Next</span>}
                <div className="text-right">
                  <span className={`text-base font-mono font-semibold ${isNext ? "text-[#C9F27A]" : "text-white/80"}`}>
                    {time}
                  </span>
                  {period && <span className="text-white/35 text-xs ml-1">{period}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Moon phase */}
      <div className="moon-card">
        <MoonPhase />
      </div>
    </div>
  );
}
