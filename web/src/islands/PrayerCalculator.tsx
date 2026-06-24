/**
 * PrayerCalculator.tsx — Prayer times calculator React island (client:load).
 *
 * PURPOSE: Interactive prayer times display with full 7 UI states:
 *   1. loading — fetching geolocation or data
 *   2. permission-denied — geolocation refused by user
 *   3. error — network/calculation failure
 *   4. geo-resolving — geolocation granted, looking up city
 *   5. loaded — prayer times displayed (SSR data passed via props)
 *   6. settings-open — settings panel open
 *   7. qibla-open — qibla modal open
 *
 * INPUTS: SSR-computed prayer times (shafiPrayers, hanafiPrayers, locationName, etc.)
 * OUTPUTS: Interactive prayer times UI with location picker and settings
 * CONSTRAINTS:
 *   - Astro island: client:load directive
 *   - No next/navigation, no useRouter — use window.location for navigation
 *   - No Intl calendar:islamic — uses @ummat/shared/hijri pattern (src/lib/hijri.ts)
 *   - RTL via dir attribute set by astroUmmat() integration (vendored @ummat/astro-preset)
 * REF: P2-E3-W02-S02-T03 · D-P2-STACK-CANON · D-P2-REACT19
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  fmtTime,
  getNextPrayer,
  PRAYER_META,
  DISPLAY_PRAYERS,
  type PrayerResult,
} from '@/lib/prayer-utils';
import { gregorianToHijri } from '@/lib/hijri';
import { qiblaAngle, compassDir } from '@/lib/qibla';
import { getSettings, saveSetting } from '@/lib/settings';
import LocationSearch from './LocationSearch';

/** All 7 UI states */
type UIState =
  | 'loading'
  | 'permission-denied'
  | 'error'
  | 'geo-resolving'
  | 'loaded'
  | 'settings-open'
  | 'qibla-open';

interface Props {
  shafiPrayers: PrayerResult;
  hanafiPrayers: PrayerResult;
  locationName: string;
  timezone: string;
  slug: string;
  lat: number;
  lng: number;
}

export default function PrayerCalculator({
  shafiPrayers,
  hanafiPrayers,
  locationName,
  timezone: _timezone,
  slug,
  lat,
  lng,
}: Props) {
  // ── Settings ─────────────────────────────────────────────────────────────
  const [hanafi, setHanafi] = useState(false);
  const [use24h, setUse24h] = useState(false);
  const [showQiyam, setShowQiyam] = useState(false);

  // ── UI state machine ─────────────────────────────────────────────────────
  const [uiState, setUiState] = useState<UIState>('loaded');

  // ── Clock ─────────────────────────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState('');
  const [nextPrayer, setNextPrayer] = useState<keyof PrayerResult>('Fajr');

  // ── Hijri date ────────────────────────────────────────────────────────────
  const [hijriDate, setHijriDate] = useState('');

  // ── Settings panel ref ───────────────────────────────────────────────────
  const settingsRef = useRef<HTMLDivElement>(null);

  const prayers = hanafi ? hanafiPrayers : shafiPrayers;
  const displayList: Array<keyof PrayerResult> = showQiyam
    ? [...DISPLAY_PRAYERS, 'Qiyam']
    : DISPLAY_PRAYERS;

  // Load settings from localStorage on mount
  useEffect(() => {
    const s = getSettings();
    setHanafi(s.hanafi);
    setUse24h(s.use24h);
    setShowQiyam(s.showQiyam);
  }, []);

  // Clock tick — update every 30s
  useEffect(() => {
    function tick() {
      const d = new Date();
      const hh = d.getHours().toString().padStart(2, '0');
      const mm = d.getMinutes().toString().padStart(2, '0');
      const t = `${hh}:${mm}`;
      setCurrentTime(t);
      setNextPrayer(getNextPrayer(prayers, t, displayList));
    }
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [prayers, displayList]);

  // Hijri date — compute once
  useEffect(() => {
    try {
      const h = gregorianToHijri(new Date());
      setHijriDate(h.formatted);
    } catch {
      setHijriDate('');
    }
  }, []);

  // Close settings panel on outside click
  useEffect(() => {
    if (uiState !== 'settings-open') return;
    function handleClick(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setUiState('loaded');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [uiState]);

  const toggleHanafi = useCallback(() => {
    setHanafi((v) => { const next = !v; saveSetting('hanafi', next); return next; });
  }, []);
  const toggleUse24h = useCallback(() => {
    setUse24h((v) => { const next = !v; saveSetting('use24h', next); return next; });
  }, []);
  const toggleShowQiyam = useCallback(() => {
    setShowQiyam((v) => { const next = !v; saveSetting('showQiyam', next); return next; });
  }, []);

  const displayTimeFmt = currentTime ? fmtTime(`${currentTime}:00`, use24h) : null;
  const qibla = qiblaAngle(lat, lng);
  const qiblaCompass = compassDir(qibla);

  // ── UI STATE: loading ─────────────────────────────────────────────────────
  if (uiState === 'loading' || uiState === 'geo-resolving') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-white/10 rounded-xl w-48" />
        <div className="prayer-grid">
          {DISPLAY_PRAYERS.map((p) => (
            <div key={p} className="prayer-cell">
              <div className="h-3 w-12 bg-white/10 rounded" />
              <div className="h-5 w-16 bg-white/10 rounded mt-1" />
            </div>
          ))}
        </div>
        <p className="text-white/40 text-sm text-center">
          {uiState === 'geo-resolving' ? 'Finding your location…' : 'Loading prayer times…'}
        </p>
      </div>
    );
  }

  // ── UI STATE: permission-denied ───────────────────────────────────────────
  if (uiState === 'permission-denied') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
          <div className="text-4xl mb-3" role="img" aria-label="Location denied">📍</div>
          <h2 className="text-white font-semibold text-lg mb-2">Location access denied</h2>
          <p className="text-white/50 text-sm mb-4">
            To use GPS-based prayer times, allow location access in your browser settings,
            or search for your city below.
          </p>
          <button
            onClick={() => setUiState('loaded')}
            className="text-ummat-light text-sm underline"
          >
            Continue without GPS
          </button>
        </div>
        <LocationSearch />
      </div>
    );
  }

  // ── UI STATE: error ───────────────────────────────────────────────────────
  if (uiState === 'error') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="rounded-2xl bg-red-900/20 border border-red-500/30 p-6 text-center">
          <p className="text-red-300 text-sm">
            Could not load prayer times. Please try again or search for your city.
          </p>
        </div>
        <LocationSearch />
      </div>
    );
  }

  // ── UI STATE: qibla-open ──────────────────────────────────────────────────
  if (uiState === 'qibla-open') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">
            Qibla from {locationName}
          </h2>
          <button
            onClick={() => setUiState('loaded')}
            className="text-white/50 hover:text-white text-sm"
            aria-label="Close Qibla"
          >
            ✕ Close
          </button>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 p-8 flex flex-col items-center gap-4">
          {/* Compass needle — rotated to qibla bearing */}
          <div
            className="w-24 h-24 rounded-full border-4 border-ummat-mid flex items-center justify-center relative"
            aria-label={`Qibla direction: ${Math.round(qibla)}° (${qiblaCompass})`}
          >
            <div
              style={{ transform: `rotate(${qibla}deg)` }}
              className="absolute top-2 text-ummat-light text-2xl"
              aria-hidden="true"
            >
              🕋
            </div>
          </div>
          <p className="text-white font-semibold text-xl">{Math.round(qibla)}°</p>
          <p className="text-white/50 text-sm">{qiblaCompass} from your location</p>
          <p className="text-white/30 text-xs">{locationName}</p>
        </div>
        <button
          onClick={() => setUiState('loaded')}
          className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white text-sm transition-colors"
        >
          Back to prayer times
        </button>
      </div>
    );
  }

  // ── UI STATE: settings-open ───────────────────────────────────────────────
  if (uiState === 'settings-open') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6" ref={settingsRef}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">Settings</h2>
          <button
            onClick={() => setUiState('loaded')}
            className="text-white/50 hover:text-white text-sm"
            aria-label="Close settings"
          >
            ✕ Close
          </button>
        </div>
        <div className="rounded-2xl bg-white/5 border border-white/10 divide-y divide-white/5">
          {/* Madhab */}
          <label className="flex items-center justify-between p-4 cursor-pointer">
            <div>
              <p className="text-white text-sm font-medium">Hanafi Asr</p>
              <p className="text-white/40 text-xs">Later Asr time (shadow = 2x)</p>
            </div>
            <input
              type="checkbox"
              checked={hanafi}
              onChange={toggleHanafi}
              aria-label="Hanafi Asr"
              className="w-4 h-4 accent-ummat-mid"
            />
          </label>
          {/* 24h */}
          <label className="flex items-center justify-between p-4 cursor-pointer">
            <div>
              <p className="text-white text-sm font-medium">24-hour time</p>
              <p className="text-white/40 text-xs">Display times in 24-hour format</p>
            </div>
            <input
              type="checkbox"
              checked={use24h}
              onChange={toggleUse24h}
              aria-label="24-hour time"
              className="w-4 h-4 accent-ummat-mid"
            />
          </label>
          {/* Qiyam */}
          <label className="flex items-center justify-between p-4 cursor-pointer">
            <div>
              <p className="text-white text-sm font-medium">Show Qiyam</p>
              <p className="text-white/40 text-xs">Show late-night optional prayer</p>
            </div>
            <input
              type="checkbox"
              checked={showQiyam}
              onChange={toggleShowQiyam}
              aria-label="Show Qiyam"
              className="w-4 h-4 accent-ummat-mid"
            />
          </label>
        </div>
        <button
          onClick={() => setUiState('loaded')}
          className="w-full py-3 rounded-xl bg-ummat-mid/20 border border-ummat-mid/30 text-ummat-light text-sm font-medium transition-colors hover:bg-ummat-mid/30"
        >
          Done
        </button>
      </div>
    );
  }

  // ── UI STATE: loaded (main view) ──────────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Location header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-white text-2xl font-semibold tracking-tight">{locationName}</h1>
          <p className="text-white/40 text-sm">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          {hijriDate && (
            <p className="text-ummat-light/60 text-xs">{hijriDate}</p>
          )}
          {displayTimeFmt && (
            <p className="text-ummat-light text-xs font-mono tracking-widest">
              {displayTimeFmt.time}{displayTimeFmt.period ? ` ${displayTimeFmt.period}` : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setUiState('qibla-open')}
            aria-label="Show Qibla direction"
            title={`Qibla: ${Math.round(qibla)}° ${qiblaCompass}`}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-xs transition-colors"
          >
            🕋 Qibla
          </button>
          <button
            onClick={() => setUiState('settings-open')}
            aria-label="Open settings"
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-sm transition-colors"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Location search (compact) */}
      <LocationSearch compact />

      {/* Prayer times grid */}
      <div className="prayer-grid" role="list" aria-label="Prayer times">
        {displayList.map((prayer) => {
          const formatted = fmtTime(prayers[prayer], use24h);
          const isNext = prayer === nextPrayer;
          const meta = PRAYER_META[prayer];
          return (
            <div
              key={prayer}
              className={`prayer-cell${isNext ? ' next-prayer' : ''}`}
              role="listitem"
              aria-label={`${meta.en}: ${formatted.time}${formatted.period ? ' ' + formatted.period : ''}`}
            >
              <span className="prayer-cell-name" lang="en">{meta.en}</span>
              {/* Arabic prayer name for RTL locale support */}
              <span className="prayer-cell-name arabic hidden" lang="ar" dir="rtl" aria-hidden="true">
                {meta.ar}
              </span>
              <span className="prayer-cell-time">{formatted.time}</span>
              {!use24h && formatted.period && (
                <span className="prayer-cell-period">{formatted.period}</span>
              )}
              {isNext && (
                <span className="text-ummat-light text-xs mt-1">Next</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Madhab indicator */}
      <p className="text-white/25 text-xs text-center">
        {hanafi ? 'Hanafi' : "Shafi'i/Maliki/Hanbali"} · {use24h ? '24h' : '12h'}
      </p>

      {/* Share / back links */}
      <div className="flex justify-center gap-4">
        <a
          href="/"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← Search another city
        </a>
        <a
          href={`/times/${slug}`}
          className="text-ummat-light/60 hover:text-ummat-light text-sm transition-colors"
        >
          Share this page
        </a>
      </div>
    </div>
  );
}
