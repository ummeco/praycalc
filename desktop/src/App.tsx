import { useState, useEffect, useCallback } from 'react';
import type { PrayerEntry, PrayerName } from './lib/ipc-types';
import { DEFAULT_SETTINGS } from './lib/ipc-types';
import type { Settings } from './lib/ipc-types';
import { loadSettings } from './lib/store';
import { fetchPrayerTimes, updateTrayTooltip, sendPrayerNotification } from './lib/api';
import { getNextPrayer, getCurrentPrayer, formatTime12 } from './lib/prayers';
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
      if (n) await updateTrayTooltip(`${n.name} ${formatTime12(n.time)}`);
    } catch (e) {
      setError('Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      loadPrayers(s);
    });
  }, [loadPrayers]);

  // Refresh at midnight
  useEffect(() => {
    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const id = setTimeout(() => loadPrayers(settings), msToMidnight + 1000);
    return () => clearTimeout(id);
  }, [settings, loadPrayers]);

  // Notification firing when prayer arrives
  useEffect(() => {
    if (!next || !settings.notifications) return;
    const target = toMs(next.time);
    const now = toMsNow();
    if (target <= now) return;
    const id = setTimeout(() => {
      sendPrayerNotification(next.name);
      setTimeout(() => loadPrayers(settings), 5000);
    }, target - now);
    return () => clearTimeout(id);
  }, [next, settings, loadPrayers]);

  const handleSettingsSave = useCallback((s: Settings) => {
    setSettings(s);
    setView('prayers');
    loadPrayers(s);
  }, [loadPrayers]);

  return (
    <div className="w-[360px] bg-brand-bg text-green-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-dark/40">
        <div className="flex items-center gap-2">
          <span className="text-brand-light font-bold text-sm tracking-wide">PrayCalc</span>
          <span className="text-green-300/40 text-xs">{settings.city}</span>
        </div>
        <button
          onClick={() => setView(view === 'settings' ? 'prayers' : 'settings')}
          className="text-brand-mid hover:text-brand-light text-xs transition-colors"
          aria-label="Toggle settings"
        >
          {view === 'settings' ? '← Back' : '⚙ Settings'}
        </button>
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
          <Countdown next={next} />
          <PrayerList prayers={prayers} nextPrayer={next?.name ?? null} />
          {current && (
            <div className="px-4 py-2 text-[10px] text-green-300/40 text-center">
              Current: {current}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function toMs(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.getTime();
}

function toMsNow(): number {
  return Date.now();
}
