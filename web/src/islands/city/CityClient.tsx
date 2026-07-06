/**
 * CityClient.tsx — City prayer-times page island (orchestrator).
 *
 * PURPOSE: Owns client state for the city page — settings, session, the settings
 *   panel, live clock, adhan playback, and the Qibla / calendar modals — and
 *   composes the header, compact search, prayer grid, and feature tiles.
 * DOM contract: see child components + .settings-gear-btn (aria-label "Settings").
 * REF: P2-PRAYCALC-E2E-REBUILD
 */

import { useEffect, useRef, useState } from 'react';
import { getSettings, saveSetting, type PrayCalcSettings } from '@/lib/settings';
import { getSession, clearSession, type PrayCalcSession } from '@/lib/session';
import { qiblaAngle, compassDir } from '@/lib/qibla';
import { getNextPrayer, DISPLAY_PRAYERS, type PrayerResult } from '@/lib/prayer-utils';
import LocationSearch from '@/islands/LocationSearch';
import PrayerGrid from './PrayerGrid';
import FeatureTiles from './FeatureTiles';
import SettingsPanel from './SettingsPanel';
import QiblaModal from './QiblaModal';
import CalendarModal from './CalendarModal';

interface Props {
  shafiPrayers: PrayerResult;
  hanafiPrayers: PrayerResult;
  locationName: string;
  timezone: string;
  slug: string;
  lat: number;
  lng: number;
  locale?: string;
}

type ModalKind = null | 'qibla' | 'monthly' | 'yearly';

/** Timezone-accurate HH:MM:SS string for a given tz identifier. */
function nowHHMMSS(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(new Date());
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '00';
    return `${get('hour')}:${get('minute')}:${get('second')}`;
  } catch {
    return new Date().toTimeString().slice(0, 8);
  }
}

export default function CityClient({
  shafiPrayers,
  hanafiPrayers,
  locationName,
  timezone,
  lat,
  lng,
  locale = 'en',
}: Props) {
  const [settings, setSettings] = useState<PrayCalcSettings>(() => getSettings());
  const [session, setSession] = useState<PrayCalcSession | null>(() => getSession());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [clockHHMMSS, setClockHHMMSS] = useState('');

  const panelRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLButtonElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAdhanPrayer = useRef<string>('');

  // Hydrate settings + session from localStorage on mount
  useEffect(() => {
    setSettings(getSettings());
    setSession(getSession());
  }, []);

  // Apply light-mode class
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('light-mode', settings.lightMode);
  }, [settings.lightMode]);

  // Per-second clock in city timezone
  useEffect(() => {
    setClockHHMMSS(nowHHMMSS(timezone));
    const id = setInterval(() => setClockHHMMSS(nowHHMMSS(timezone)), 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // Adhan playback — fires when clock crosses a prayer time
  useEffect(() => {
    if (settings.soundMode === 'none' || !clockHHMMSS) return;
    const prayers = settings.hanafi ? hanafiPrayers : shafiPrayers;
    const hhmm = clockHHMMSS.slice(0, 5);
    const ss = clockHHMMSS.slice(6, 8);
    if (ss !== '00') return; // only fire at the top of the minute

    const list = DISPLAY_PRAYERS;
    for (const p of list) {
      if (prayers[p] !== 'N/A' && prayers[p].slice(0, 5) === hhmm) {
        if (lastAdhanPrayer.current === `${p}-${hhmm}`) break; // avoid double-trigger
        lastAdhanPrayer.current = `${p}-${hhmm}`;

        if (settings.soundMode === 'beep') {
          try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.4, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
            osc.start();
            osc.stop(ctx.currentTime + 1.5);
          } catch { /* AudioContext blocked by browser policy */ }
        } else {
          // adhan audio
          const voice = settings.adhanVoice ?? 'makkah';
          const src =
            p === 'Fajr' && voice === 'mishari'
              ? '/audio/fajr-mishari.mp3'
              : `/audio/adhan/${voice}.mp3`;
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          const audio = new Audio(src);
          audioRef.current = audio;
          audio.play().catch(() => {/* autoplay blocked */});
        }
        break;
      }
    }
  }, [clockHHMMSS, settings, shafiPrayers, hanafiPrayers]);

  // Outside-click closes the settings panel (but not when clicking the gear)
  useEffect(() => {
    if (!settingsOpen) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (gearRef.current?.contains(t)) return;
      setSettingsOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [settingsOpen]);

  function handleChange<K extends keyof PrayCalcSettings>(key: K, value: PrayCalcSettings[K]) {
    saveSetting(key, value);
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSignOut() {
    clearSession();
    setSession(null);
  }

  const prayers = settings.hanafi ? hanafiPrayers : shafiPrayers;
  const qDeg = qiblaAngle(lat, lng);
  const qCompass = compassDir(qDeg);

  const nowHHMM = clockHHMMSS ? clockHHMMSS.slice(0, 5) : undefined;
  const list = settings.showQiyam ? ([...DISPLAY_PRAYERS, 'Qiyam'] as Array<keyof PrayerResult>) : DISPLAY_PRAYERS;
  const nextPrayer = nowHHMM ? getNextPrayer(prayers, nowHHMM, list) : null;

  return (
    <div className="city-client">
      <header className="city-header">
        <h2 className="city-name">{locationName}</h2>
        <button
          type="button"
          ref={gearRef}
          className="settings-gear-btn"
          aria-label="Settings"
          onClick={() => setSettingsOpen((v) => !v)}
        >
          ⚙️
        </button>
      </header>

      <div className="city-search">
        <LocationSearch compact />
      </div>

      <PrayerGrid
        prayers={prayers}
        use24h={settings.use24h}
        showQiyam={settings.showQiyam}
        locale={locale}
        nowHHMMSS={clockHHMMSS}
        nextPrayer={nextPrayer}
        showCountdown={settings.countdown}
      />

      <FeatureTiles
        qiblaDeg={qDeg}
        qiblaCompass={qCompass}
        onOpenQibla={() => setModal('qibla')}
        onOpenMonthly={() => setModal('monthly')}
        onOpenYearly={() => setModal('yearly')}
      />

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onChange={handleChange}
          session={session}
          onSignOut={handleSignOut}
          panelRef={panelRef}
        />
      )}

      {modal === 'qibla' && (
        <QiblaModal
          locationName={locationName}
          lat={lat}
          lng={lng}
          qiblaDeg={qDeg}
          qiblaCompass={qCompass}
          onClose={() => setModal(null)}
        />
      )}

      {(modal === 'monthly' || modal === 'yearly') && (
        <CalendarModal
          lat={lat}
          lng={lng}
          timezone={timezone}
          hanafi={settings.hanafi}
          locationName={locationName}
          initialView={modal === 'yearly' ? 'year' : 'month'}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
