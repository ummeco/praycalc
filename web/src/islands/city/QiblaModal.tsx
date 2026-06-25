/**
 * QiblaModal.tsx — Qibla direction modal (city page).
 *
 * PURPOSE: Show the Qibla bearing from the current city with a compass needle.
 * DOM contract (city-page.spec): role="dialog" containing text /Qibla|Direction/.
 *   Closes via aria-label="Close" and Escape.
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect } from 'react';

interface Props {
  locationName: string;
  qiblaDeg: number;
  qiblaCompass: string;
  onClose: () => void;
}

export default function QiblaModal({ locationName, qiblaDeg, qiblaCompass, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

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
        <div className="qibla-compass">
          <div
            className="qibla-needle"
            style={{ transform: `rotate(${qiblaDeg}deg)` }}
            aria-hidden="true"
          >
            🕋
          </div>
        </div>
        <p className="qibla-bearing">{Math.round(qiblaDeg)}° {qiblaCompass}</p>
        <p className="qibla-from">Qibla from {locationName}</p>
      </div>
    </div>
  );
}
