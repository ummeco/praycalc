/**
 * QiblaModal.tsx — Qibla direction modal (city page).
 *
 * PURPOSE: Show the Qibla bearing from the current city with an animated compass
 *   needle, degrees, cardinal direction, and distance to the Ka'bah in km + miles.
 * DOM contract (city-page.spec): role="dialog" containing text /Qibla|Direction/.
 *   Closes via aria-label="Close" and Escape. .qibla-needle (static rotation).
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect } from 'react';
import { KAABA_LAT, KAABA_LNG, distanceKm } from '@/lib/qibla';

interface Props {
  locationName: string;
  lat: number;
  lng: number;
  qiblaDeg: number;
  qiblaCompass: string;
  onClose: () => void;
}

export default function QiblaModal({ locationName, lat, lng, qiblaDeg, qiblaCompass, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const km = Math.round(distanceKm(lat, lng, KAABA_LAT, KAABA_LNG));
  const miles = Math.round(km * 0.621371);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="qibla-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Qibla Direction"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">Qibla Direction</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Compass with needle pointing toward Ka'bah */}
        <div className="qibla-compass" aria-hidden="true">
          <div className="qibla-rose">
            <span className="qibla-rose-n">N</span>
            <span className="qibla-rose-e">E</span>
            <span className="qibla-rose-s">S</span>
            <span className="qibla-rose-w">W</span>
            {/* Tick marks */}
            <div className="qibla-rose-circle" />
          </div>
          <div
            className="qibla-needle"
            style={{ transform: `rotate(${qiblaDeg}deg)` }}
            title={`${Math.round(qiblaDeg)}° ${qiblaCompass}`}
          >
            🕋
          </div>
        </div>

        <p className="qibla-bearing">
          <strong>{Math.round(qiblaDeg)}°</strong> {qiblaCompass}
        </p>
        <p className="qibla-from">from {locationName}</p>
        <p className="qibla-distance">
          {km.toLocaleString()} km &nbsp;/&nbsp; {miles.toLocaleString()} mi to Ka'bah
        </p>
      </div>
    </div>
  );
}
