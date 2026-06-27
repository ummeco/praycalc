import { useState, useEffect } from 'react';
import type { PrayerEntry } from '../lib/ipc-types';
import { secondsUntil, formatCountdown } from '../lib/prayers';

interface Props {
  next: PrayerEntry | null;
}

export default function Countdown({ next }: Props) {
  const [seconds, setSeconds] = useState(() => (next ? secondsUntil(next.time) : 0));

  useEffect(() => {
    if (!next) return;
    setSeconds(secondsUntil(next.time));
    const id = setInterval(() => setSeconds(secondsUntil(next.time)), 1000);
    return () => clearInterval(id);
  }, [next]);

  if (!next) return null;

  return (
    <div className="px-4 py-3 bg-brand-deep/40 border-b border-brand-dark/40">
      <div className="text-[10px] uppercase tracking-widest text-brand-mid/70 mb-0.5">
        {next.name} in
      </div>
      <div className="text-xl font-bold text-brand-light tabular-nums">
        {formatCountdown(seconds)}
      </div>
    </div>
  );
}
