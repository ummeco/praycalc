'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';

const SMART_URL = 'https://smart.praycalc.com/api/v1/stats';
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type Prayer = typeof PRAYERS[number];

interface Stats {
  weekly: Record<Prayer, number>;
  monthly: Record<Prayer, number>;
  weeklyPct: number;
  monthlyPct: number;
  currentStreak: number;
  mostConsistent: string | null;
  mostMissed: string | null;
  totalLogged: number;
}

function Bar({ count, max, label }: { count: number; max: number; label: string }) {
  const pct = max === 0 ? 0 : Math.round((count / max) * 100);
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-white/60 text-xs font-mono">{count}</span>
      <div className="relative w-8 bg-white/5 rounded-full overflow-hidden" style={{ height: 80 }}>
        <div
          className="absolute bottom-0 w-full bg-[#79C24C] rounded-full transition-all duration-500"
          style={{ height: `${pct}%` }}
        />
      </div>
      <span className="text-white/50 text-[10px] text-center leading-tight">{label}</span>
    </div>
  );
}

function RingCard({ pct, label, sublabel }: { pct: number; label: string; sublabel: string }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={10} fill="none" />
        <circle
          cx={50} cy={50} r={r}
          stroke="#79C24C"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text x={50} y={55} textAnchor="middle" fill="white" fontSize={18} fontWeight="bold">{pct}%</text>
      </svg>
      <p className="text-white/80 text-sm font-semibold">{label}</p>
      <p className="text-white/40 text-xs">{sublabel}</p>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/40 text-xs mt-0.5">{label}</div>
    </div>
  );
}

export default function StatsPage() {
  const { session, hydrated, isLoggedIn } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    async function load() {
      try {
        const r = await fetch(SMART_URL, { headers: { Authorization: `Bearer ${token}` } });
        if (cancelled) return;
        if (!r.ok) throw new Error(r.statusText);
        const data = await r.json() as Stats;
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setError('Could not load stats. Try again later.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    setLoading(true);
    setError('');
    load();
    return () => { cancelled = true; };
  }, [token]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center">
        <div className="text-white/30 text-sm">Loading…</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center p-8">
        <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-3xl p-12 max-w-md w-full text-center">
          <div className="text-5xl mb-5">📊</div>
          <h1 className="text-2xl font-bold text-white mb-3">Prayer Stats</h1>
          <p className="text-white/60 mb-8">Sign in to track your prayer consistency and streaks.</p>
          <Link href="/account" className="block bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-lg transition-colors border border-[#79C24C]/30">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const weekMax = stats ? Math.max(...PRAYERS.map(p => stats.weekly[p] ?? 0), 1) : 7;
  const monthMax = stats ? Math.max(...PRAYERS.map(p => stats.monthly[p] ?? 0), 1) : 30;

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white pb-16">
      <div className="max-w-lg mx-auto px-4 pt-8">
        <h1 className="text-2xl font-bold text-white mb-1">📊 Prayer Stats</h1>
        <p className="text-white/40 text-sm mb-8">Track your consistency and streaks</p>

        {loading && <p className="text-white/30 text-center py-16">Loading…</p>}
        {error && <p className="text-red-400 text-center py-8 text-sm">{error}</p>}

        {stats && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <StatCard icon="🔥" value={stats.currentStreak} label={stats.currentStreak === 1 ? 'day streak' : 'day streak'} />
              <StatCard icon="🕌" value={stats.totalLogged} label="total prayed" />
              <StatCard icon={stats.mostMissed ? '⚠️' : '✨'} value={stats.mostMissed ?? '—'} label="needs attention" />
            </div>

            {/* Completion rings */}
            <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-5 mb-6">
              <div className="flex justify-around">
                <RingCard pct={stats.weeklyPct} label="This week" sublabel="of 35 prayers" />
                <RingCard pct={stats.monthlyPct} label="This month" sublabel="of 150 prayers" />
              </div>
            </div>

            {/* Weekly bar chart */}
            <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-5 mb-6">
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">Last 7 days</h2>
              <div className="flex justify-around items-end">
                {PRAYERS.map(p => (
                  <Bar key={p} count={stats.weekly[p] ?? 0} max={weekMax} label={p.slice(0, 3)} />
                ))}
              </div>
            </div>

            {/* Monthly bar chart */}
            <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-5 mb-6">
              <h2 className="text-white/60 text-xs uppercase tracking-wider mb-4">Last 30 days</h2>
              <div className="flex justify-around items-end">
                {PRAYERS.map(p => (
                  <Bar key={p} count={stats.monthly[p] ?? 0} max={monthMax} label={p.slice(0, 3)} />
                ))}
              </div>
            </div>

            {stats.mostConsistent && (
              <p className="text-white/30 text-xs text-center">
                Most consistent: <span className="text-[#C9F27A]">{stats.mostConsistent}</span>
                {stats.mostMissed && stats.mostMissed !== stats.mostConsistent && (
                  <> · Needs work: <span className="text-orange-400">{stats.mostMissed}</span></>
                )}
              </p>
            )}

            {stats.totalLogged === 0 && (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm mb-2">No prayers logged yet.</p>
                <p className="text-white/20 text-xs">Open the PrayCalc app to start tracking your prayers.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
