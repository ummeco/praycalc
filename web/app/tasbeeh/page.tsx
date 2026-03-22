'use client';

import { useState, useEffect, useCallback } from 'react';

const PRESETS = [
  { label: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { label: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { label: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 33 },
  { label: 'La ilaha illallah', arabic: 'لَا إِلَهَ إِلَّا اللَّهُ', target: 100 },
  { label: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
  { label: 'Salawat', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', target: 100 },
  { label: 'HasbunAllah', arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', target: 40 },
  { label: 'La hawla wala quwwata', arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', target: 100 },
] as const;

type PresetLabel = typeof PRESETS[number]['label'];

interface Session {
  label: PresetLabel;
  count: number;
  target: number;
  completedAt?: string;
}

const LS_KEY = 'pc_tasbeeh_history';

function loadHistory(): Session[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]');
  } catch { return []; }
}

function saveHistory(sessions: Session[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(sessions.slice(-20))); } catch { /* ignore */ }
}

export default function TasbeehPage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<Session[]>(loadHistory);
  const [justCompleted, setJustCompleted] = useState(false);

  const preset = PRESETS[presetIdx];
  const progress = Math.min(count / preset.target, 1);
  const circumference = 2 * Math.PI * 88; // r=88

  const increment = useCallback(() => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
    setCount(c => {
      const next = c + 1;
      if (next === preset.target) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 1500);
        const session: Session = { label: preset.label, count: next, target: preset.target, completedAt: new Date().toISOString() };
        setHistory(prev => {
          const updated = [...prev, session];
          saveHistory(updated);
          return updated;
        });
      }
      return next;
    });
  }, [preset]);

  const reset = useCallback(() => {
    setCount(0);
    setJustCompleted(false);
  }, []);

  const selectPreset = useCallback((idx: number) => {
    setPresetIdx(idx);
    setCount(0);
    setJustCompleted(false);
  }, []);

  // Spacebar support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        increment();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [increment]);

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <div className="max-w-sm mx-auto">
          <h1 className="text-xl font-bold text-white mb-1">📿 Tasbeeh</h1>
          <p className="text-white/40 text-xs">Tap the circle or press Space to count</p>
        </div>
      </div>

      {/* Preset selector */}
      <div className="px-4 pb-4">
        <div className="max-w-sm mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESETS.map((p, i) => (
              <button
                type="button"
                key={p.label}
                onClick={() => selectPreset(i)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  i === presetIdx
                    ? 'bg-[#1E5E2F] text-[#C9F27A] border-[#79C24C]/40'
                    : 'bg-white/5 text-white/50 border-white/10 hover:text-white/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Counter */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        {/* SVG ring */}
        <button
          type="button"
          onClick={increment}
          className={`relative rounded-full transition-transform active:scale-95 ${justCompleted ? 'scale-105' : ''}`}
          aria-label={`Count ${preset.label}`}
          style={{ width: 200, height: 200 }}
        >
          <svg width="200" height="200" className="absolute inset-0 -rotate-90">
            {/* Track */}
            <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke={justCompleted ? '#C9F27A' : '#79C24C'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              className="transition-all duration-150"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <span className="arabic text-4xl text-white leading-none">{preset.arabic}</span>
            <span className={`text-5xl font-bold tabular-nums transition-colors ${justCompleted ? 'text-[#C9F27A]' : 'text-white'}`}>{count}</span>
            <span className="text-white/30 text-sm">/ {preset.target}</span>
          </div>
        </button>

        {/* Controls */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white/70 text-sm transition-colors"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={increment}
            className="px-8 py-2.5 rounded-xl bg-[#1E5E2F] border border-[#79C24C]/30 text-[#C9F27A] font-semibold text-sm hover:bg-[#79C24C]/20 transition-colors"
          >
            +1
          </button>
        </div>

        {justCompleted && (
          <div className="text-[#C9F27A] text-sm animate-pulse">
            ✓ {preset.target} completed — بارك الله فيك
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="px-4 pb-8">
          <div className="max-w-sm mx-auto">
            <h2 className="text-white/40 text-xs uppercase tracking-wider mb-3">Recent</h2>
            <div className="space-y-2">
              {history.slice(-5).reverse().map((s, i) => (
                <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2 border border-white/5">
                  <span className="text-white/60 text-sm">{s.label}</span>
                  <span className={`text-sm font-mono ${s.count >= s.target ? 'text-[#C9F27A]' : 'text-white/40'}`}>
                    {s.count}/{s.target}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
