"use client";

import { useEffect, useState } from "react";
import { PRAYER_META, type PrayerResult } from "@/lib/prayer-utils";

interface Props {
  prayer: keyof PrayerResult;
  time: string;
  onClose: () => void;
}

export default function AdhanToast({ prayer, time, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on next frame
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(onClose, 30_000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const meta = PRAYER_META[prayer];

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 px-4 py-3.5
        bg-[#0D2F17]/90 backdrop-blur-md border border-white/10 rounded-xl
        shadow-lg shadow-black/20
        transition-transform duration-200 ease-out pointer-events-auto
        ${visible ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"}`}
      role="alert"
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-white leading-snug">{meta.en}</p>
        <p className="text-sm text-white/50 mt-0.5">{time}</p>
      </div>
      <button
        type="button"
        className="shrink-0 p-1 text-white/40 hover:text-white/80 transition-colors duration-150 cursor-pointer"
        onClick={onClose}
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
