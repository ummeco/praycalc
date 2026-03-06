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
      className={`adhan-toast ${visible ? "adhan-toast--visible" : ""}`}
      role="alert"
    >
      <div className="adhan-toast-content">
        <p className="adhan-toast-name">{meta.en}</p>
        <p className="adhan-toast-time">{time}</p>
      </div>
      <button
        type="button"
        className="adhan-toast-close"
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
