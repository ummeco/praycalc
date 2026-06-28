import { useState, useEffect, useCallback, useRef } from 'react';
import type { PrayerEntry, PrayerName } from './lib/ipc-types';
import { DEFAULT_SETTINGS } from './lib/ipc-types';
import type { Settings } from './lib/ipc-types';
import { loadSettings } from './lib/store';
import { fetchPrayerTimes, updateTrayTitle, sendPrayerNotification } from './lib/api';
import {
  getNextPrayer,
  getCurrentPrayer,
  secondsUntil,
  formatTrayLabel,
  getHijriDate,
} from './lib/prayers';
import PrayerList from './components/PrayerList';
import Countdown from './components/Countdown';
import SettingsPanel from './components/Settings';

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
  const nextRef = useRef<PrayerEntry | null>(null);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);

  nextRef.current = next;
  settingsRef.current = settings;

  const loadPrayers = useCallback(async (s: Settings) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchPrayerTimes(s.lat, s.lng, s.tz, s.method, s.hanafi);
      setPrayers(resp.prayers);
      const n = getNextPrayer(resp.prayers);
      const c = getCurrentPrayer(resp.prayers);
      setNext(n);
      setCurrent(c);
      setSeconds(n ? secondsUntil(n.time) : 0);
    } catch {
      setError('Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      settingsRef.current = s;
      loadPrayers(s);
    });
  }, [loadPrayers]);

  // Tick every second — update countdown + tray label
  useEffect(() => {
    const id = setInterval(() => {
      const n = nextRef.current;
      const s = settingsRef.current;
      const secs = n ? secondsUntil(n.time) : 0;
      setSeconds(secs);
      const label = formatTrayLabel(n, secs, s.displayMode, s.nameFormat);
      updateTrayTitle(label).catch(() => {});
      // Update Hijri at midnight
      setHijri(getHijriDate());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Refresh at midnight
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const id = setTimeout(() => loadPrayers(settings), msToMidnight + 1000);
    return () => clearTimeout(id);
  }, [settings, loadPrayers]);

  // Notification when prayer arrives
  useEffect(() => {
    if (!next || !settings.notifications) return;
    const secs = secondsUntil(next.time);
    if (secs <= 0) return;
    const id = setTimeout(() => {
      sendPrayerNotification(next.name);
      setTimeout(() => loadPrayers(settings), 5000);
    }, secs * 1000);
    return () => clearTimeout(id);
  }, [next, settings, loadPrayers]);

  // Show settings via tray menu trigger
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__showSettings = () => setView('settings');
  }, []);

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
    <div className="w-[360px] bg-brand-bg text-green-100 flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark/40">
        <div className="flex flex-col">
          <span className="text-brand-light font-bold text-sm tracking-wide">PrayCalc</span>
          <span className="text-green-300/50 text-[10px]">{hijri}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-green-300/40 text-xs">{settings.city}</span>
          <button
            onClick={() => setView(view === 'settings' ? 'prayers' : 'settings')}
            className="text-brand-mid hover:text-brand-light text-xs transition-colors"
            aria-label="Toggle settings"
          >
            {view === 'settings' ? '← Back' : '⚙'}
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'settings' ? (
        <SettingsPanel settings={settings} onSave={handleSettingsSave} />
      ) : loading ? (
        <div className="px-4 py-8 text-center text-green-300/50 text-sm">Loading…</div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-red-400 text-sm">{error}</div>
      ) : (
        <>
          <Countdown next={next} seconds={seconds} displayMode={settings.displayMode} nameFormat={settings.nameFormat} arabicMode={settings.arabicMode} />
          <PrayerList
            prayers={prayers}
            nextPrayer={next?.name ?? null}
            currentPrayer={current}
            nameFormat={settings.nameFormat}
            arabicMode={settings.arabicMode}
            displayMode={settings.displayMode}
          />
        </>
      )}
    </div>
  );
}
