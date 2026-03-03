"use client";

import { useRef, useEffect } from "react";

interface Props {
  qiblaBearingRounded: number;
  qiblaDir: string;
  onMonthlyOpen: () => void;
  onYearlyOpen: () => void;
  onQiblaOpen: () => void;
}

export default function FeatureTiles({
  qiblaBearingRounded,
  qiblaDir,
  onMonthlyOpen,
  onYearlyOpen,
  onQiblaOpen,
}: Props) {
  const compassNeedleRef = useRef<SVGSVGElement>(null);

  // Keep Qibla needle CSS variable in sync with bearing
  useEffect(() => {
    compassNeedleRef.current?.style.setProperty(
      "--ftile-bearing",
      `${qiblaBearingRounded}deg`,
    );
  }, [qiblaBearingRounded]);

  return (
    <div className="ftiles">

      {/* Monthly Times */}
      <button
        type="button"
        className="ftile ftile--live"
        onClick={onMonthlyOpen}
        aria-label="Open monthly prayer times table"
      >
        <div className="ftile-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="3" y="4" width="18" height="18" rx="2.5" />
            <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            <rect x="7" y="13" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
            <rect x="11" y="13" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
            <rect x="15" y="13" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
            <rect x="7" y="17" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
            <rect x="11" y="17" width="2" height="2" rx="0.4" fill="currentColor" stroke="none" />
          </svg>
        </div>
        <p className="ftile-name" aria-hidden="true">Monthly<br />Table</p>
      </button>

      {/* Yearly Calendar */}
      <button
        type="button"
        className="ftile ftile--live"
        onClick={onYearlyOpen}
        aria-label="Open yearly prayer calendar"
      >
        <div className="ftile-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <rect x="3" y="4" width="18" height="18" rx="2.5" />
            <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 16l2 1.5 3.5-4" />
            <path strokeLinecap="round" d="M16 15h3M16 18h2" />
          </svg>
        </div>
        <p className="ftile-name" aria-hidden="true">Yearly<br />Calendar</p>
      </button>

      {/* Qibla Direction — live */}
      <button
        type="button"
        className="ftile ftile--live"
        onClick={onQiblaOpen}
        aria-label={`Open Qibla direction. Bearing ${qiblaBearingRounded}° ${qiblaDir}`}
      >
        <div
          className="ftile-compass-ring"
          role="img"
          aria-label={`Compass showing Qibla direction at ${qiblaBearingRounded}° ${qiblaDir}`}
        >
          {/* North marker dot */}
          <div className="ftile-compass-n" />
          {/* Needle rotated to Qibla bearing */}
          <svg
            ref={compassNeedleRef}
            className="ftile-compass-needle"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <polygon points="16,3 18.5,16 13.5,16" fill="#79C24C" />
            <polygon points="16,29 18.5,16 13.5,16" fill="rgba(255,255,255,0.15)" />
            <circle
              cx="16"
              cy="16"
              r="2.5"
              fill="rgba(10,32,16,0.9)"
              stroke="#79C24C"
              strokeWidth="1.25"
            />
          </svg>
        </div>
        <p className="ftile-name" aria-hidden="true">Qibla</p>
        <p className="ftile-bearing" aria-hidden="true">{qiblaBearingRounded}° {qiblaDir}</p>
      </button>

    </div>
  );
}
