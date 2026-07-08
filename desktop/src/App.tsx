import { useState, useEffect, useCallback, useRef } from 'react';
import type { PrayerEntry, PrayerName } from './lib/ipc-types';
import { DEFAULT_SETTINGS } from './lib/ipc-types';
import type { Settings } from './lib/ipc-types';
import { loadSettings } from './lib/store';
import { fetchPrayerTimes, quitApp } from './lib/api';
import { getNextPrayer, getCurrentPrayer, secondsUntil, getHijriDate } from './lib/prayers';
import PrayerList from './components/PrayerList';
import Countdown from './components/Countdown';
import SettingsPanel, { type SettingsPanelHandle } from './components/Settings';
import AdhanOverlay from './components/AdhanOverlay';
import { useUpdater } from './hooks/useUpdater';
import { useTraySync } from './hooks/useTraySync';
import { useAdhanListener } from './hooks/useAdhanListener';

type View = 'prayers' | 'settings';

export default function App() {
  const [view, setView] = useState<View>('prayers');
  const [prayers, setPrayers] = useState<PrayerEntry[]>([]);
  const [next, setNext] = useState<PrayerEntry | null>(null);
  const [current, setCurrent] = useState<PrayerName | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hijri, setHijri] = useState(() => getHijriDate());
  const [seconds, setSeconds] = useState(0);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  const settingsPanelRef = useRef<SettingsPanelHandle>(null);
  const viewRef = useRef<View>('prayers');

  settingsRef.current = settings;
  viewRef.current = view;

  const loadPrayers = useCallback(async (s: Settings) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchPrayerTimes(s.lat, s.lng, s.tz, s.method, s.hanafi);
      setPrayers(resp.prayers);
      // After Isha all of today's prayers have passed and getNextPrayer returns
      // null — roll over to tomorrow's Fajr so the countdown (tray + popup)
      // keeps running across midnight instead of freezing on "Isha!".
      const n =
        getNextPrayer(resp.prayers, s.tz) ??
        (resp.tomorrowFajr ? { name: 'Fajr' as const, time: resp.tomorrowFajr } : null);
      const c = getCurrentPrayer(resp.prayers, s.tz);
      setNext(n);
      setCurrent(c);
      setSeconds(n ? secondsUntil(n.time, s.tz) : 0); // signed: negative means prayer just passed
    } catch {
      setError('Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  }, []);

  const { updateReady, restart } = useUpdater();
  useTraySync(next, settings);
  const { adhanActive, adhanActiveRef, dismissAdhan } = useAdhanListener(loadPrayers, settingsRef);

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      settingsRef.current = s;
      loadPrayers(s);
    });
  }, [loadPrayers]);

  // 1-second tick for UI countdown display only (Rust handles tray + adhan + refresh)
  useEffect(() => {
    const id = setInterval(() => {
      if (next) setSeconds(secondsUntil(next.time, settingsRef.current.tz));
      setHijri(getHijriDate());
    }, 1000);
    return () => clearInterval(id);
  }, [next]);

  // Refresh prayers at midnight
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const id = setTimeout(() => loadPrayers(settings), msToMidnight + 1000);
    return () => clearTimeout(id);
  }, [settings, loadPrayers]);

  useEffect(() => {
    (window as unknown as Record<string, unknown>).__showSettings = () => setView('settings');
  }, []);

  // Hide window on blur/ESC — suppressed while adhan plays.
  // ESC in settings cancels (navigates back) instead of hiding.
  useEffect(() => {
    const hide = () => {
      if (adhanActiveRef.current) return;
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().hide().catch(() => {});
      });
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewRef.current === 'settings') {
          setView('prayers');
        } else {
          hide();
        }
      }
    };
    window.addEventListener('blur', hide);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('blur', hide);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [adhanActiveRef]);

  const handleSettingsSave = useCallback(
    (s: Settings) => {
      setSettings(s);
      settingsRef.current = s;
      setView('prayers');
      loadPrayers(s);
    },
    [loadPrayers],
  );

  return (
    <div
      className="w-[360px] h-[520px] text-green-100 flex flex-col select-none overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #0d2015 0%, #1a3d27 45%, #0f2a1a 100%)' }}
    >
      {adhanActive && (
        <AdhanOverlay prayerName={adhanActive} adhan={settings.adhan ?? 'makkah'} onDone={dismissAdhan} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <div className="text-brand-light font-bold text-[15px] tracking-wide">PrayCalc</div>
          <div className="text-green-300/60 text-[10px] mt-0.5">{hijri}</div>
        </div>
        <div className="text-green-300/60 text-xs">{settings.city}</div>
      </div>

      {/* Content */}
      {view === 'settings' ? (
        <div className="flex-1 overflow-y-auto">
          <SettingsPanel ref={settingsPanelRef} settings={settings} onSave={handleSettingsSave} />
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center text-green-300/60 text-sm">
          Loading…
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">{error}</div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <Countdown
            next={next}
            seconds={seconds}
            displayMode={settings.displayMode}
            nameFormat={settings.nameFormat}
            arabicMode={settings.arabicMode}
            showSeconds={settings.showSeconds}
            countdownPrefix={settings.countdownPrefix}
          />
          <div className="flex-1 overflow-y-auto">
            <PrayerList
              prayers={prayers}
              nextPrayer={next?.name ?? null}
              currentPrayer={current}
              nameFormat={settings.nameFormat}
              arabicMode={settings.arabicMode}
              displayMode={settings.displayMode}
            />
          </div>
        </div>
      )}

      {/* Update-ready banner — appears once a newer signed build has finished
          downloading in the background; restart is user-initiated, never forced. */}
      {updateReady && (
        <div
          className="flex items-center justify-between px-5 py-2 flex-shrink-0 text-[11px]"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(121,194,76,0.12)' }}
        >
          <span className="text-green-200/80">Update ready — v{updateReady}</span>
          <button
            onClick={restart}
            className="text-brand-light hover:text-white font-semibold transition-colors"
          >
            Restart
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between px-5 py-2.5 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.18)' }}
      >
        {view === 'settings' ? (
          <>
            <button
              onClick={() => setView('prayers')}
              className="text-white/55 hover:text-white/70 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => settingsPanelRef.current?.save()}
              className="bg-brand-mid hover:bg-brand-light text-brand-bg text-xs font-semibold px-4 py-1.5 rounded transition-colors"
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setView('settings')}
              className="flex items-center gap-1.5 text-brand-mid hover:text-brand-light text-xs font-medium transition-colors"
            >
              <span className="text-sm">⚙</span>
              <span>Settings</span>
            </button>
            <button
              onClick={() => quitApp().catch(() => {})}
              className="text-white/55 hover:text-red-400 text-xs transition-colors"
            >
              Quit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
