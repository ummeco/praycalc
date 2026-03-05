"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "pc_dpc_card_dismissed";

/**
 * Dismissible info card explaining PrayCalc's Dynamic Prayer Calculation
 * method. Shown once in the top-right tray until the user dismisses it.
 */
export default function DPCInfoCard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(DISMISSED_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // ignore
    }
  }

  if (!visible) return null;

  return (
    <div className="dpc-info-card">
      <button
        type="button"
        onClick={dismiss}
        className="dpc-info-close"
        aria-label="Dismiss"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <p className="dpc-info-text">
        PrayCalc uses a Dynamic Prayer Calculation (DPC) method years in the making
        — improves on all existing methods for maximum accuracy. Free and open-source.
      </p>

      <a
        href="https://praycalc.org"
        target="_blank"
        rel="noopener noreferrer"
        className="dpc-info-link"
      >
        Read more about the project →
      </a>
    </div>
  );
}
