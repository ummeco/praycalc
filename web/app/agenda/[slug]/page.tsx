import { Metadata } from 'next';
import Link from 'next/link';

interface AgendaItem {
  id: string;
  label: string;
  anchor: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'fixed';
  offsetMinutes: number;
  durationMinutes: number;
  notes?: string;
}

interface Agenda {
  id: string;
  title: string;
  description?: string;
  lat?: number;
  lng?: number;
  timezone: string;
  items_json: AgendaItem[];
  updated_at: string;
}

async function fetchAgenda(slug: string): Promise<Agenda | null> {
  try {
    const res = await fetch(
      `https://smart.praycalc.com/api/v1/agendas/share/${encodeURIComponent(slug)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const agenda = await fetchAgenda(params.slug);
  if (!agenda) return { title: 'Agenda not found — PrayCalc' };
  return {
    title: `${agenda.title} — PrayCalc`,
    description: agenda.description ?? 'A prayer time agenda shared via PrayCalc.',
  };
}

const ANCHOR_LABELS: Record<AgendaItem['anchor'], string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
  fixed: 'Fixed time',
};

function offsetLabel(minutes: number): string {
  if (minutes === 0) return 'At';
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return (minutes < 0 ? '-' : '+') + parts.join(' ');
}

function durationLabel(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ');
}

export default async function AgendaSharePage({ params }: { params: { slug: string } }) {
  const agenda = await fetchAgenda(params.slug);

  if (!agenda) {
    return (
      <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center p-8">
        <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-3xl p-12 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-white mb-3">Agenda not found</h1>
          <p className="text-white/60 mb-8">This agenda link has expired or been made private.</p>
          <Link href="/" className="block bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-lg transition-colors border border-[#79C24C]/30 text-center">
            Open PrayCalc
          </Link>
        </div>
      </div>
    );
  }

  const items: AgendaItem[] = Array.isArray(agenda.items_json) ? agenda.items_json : [];

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white pb-16">
      {/* Header */}
      <div className="bg-[#1E5E2F]/10 border-b border-white/5 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-4xl">📋</span>
            <div>
              <h1 className="text-2xl font-bold text-white">{agenda.title}</h1>
              {agenda.description && (
                <p className="text-white/60 text-sm mt-1">{agenda.description}</p>
              )}
              <p className="text-white/30 text-xs mt-2">
                {agenda.timezone} · Updated {new Date(agenda.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-3">
        {items.length === 0 ? (
          <p className="text-white/40 text-center py-12">No items in this agenda.</p>
        ) : items.map((item) => (
          <div key={item.id} className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white font-semibold">{item.label}</h3>
              {item.durationMinutes > 0 && (
                <span className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-full border border-white/10 flex-shrink-0">
                  {durationLabel(item.durationMinutes)}
                </span>
              )}
            </div>
            <p className="text-[#C9F27A]/70 text-sm mt-1">
              <span className="text-white/40">{offsetLabel(item.offsetMinutes)}</span>
              {' '}{item.anchor !== 'fixed' ? ANCHOR_LABELS[item.anchor] : ''}
            </p>
            {item.notes && <p className="text-white/40 text-xs mt-1">{item.notes}</p>}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="max-w-lg mx-auto px-4 mt-10 text-center">
        <p className="text-white/40 text-sm mb-4">
          Create your own prayer time agenda in PrayCalc.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl px-8 py-3 text-base transition-colors border border-[#79C24C]/30"
        >
          Open PrayCalc
        </Link>
      </div>
    </div>
  );
}
