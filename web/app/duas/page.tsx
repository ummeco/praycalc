'use client';

import { useState, useCallback } from 'react';
import type { Metadata } from 'next';
import { morningAdhkar, eveningAdhkar, selectedDuas, duaCategories, type DuaEntry, type Dhikr, type DuaCategory } from '@/lib/duas-data';

// Note: metadata export is not supported in 'use client' components.
// This page uses client-side for localStorage favorites and search.

type Tab = 'morning' | 'evening' | 'duas';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [text]);
  return (
    <button
      type="button"
      onClick={copy}
      className="text-xs px-2 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
      title="Copy translation"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function AdhkarCard({ dhikr, index }: { dhikr: Dhikr; index: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-5 hover:border-[#79C24C]/25 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[#79C24C]/50 text-sm font-mono">{String(index + 1).padStart(2, '0')}</span>
        <div className="flex items-center gap-2">
          {dhikr.repeatCount && dhikr.repeatCount > 1 && (
            <span className="text-xs bg-[#79C24C]/10 text-[#C9F27A] px-2 py-0.5 rounded-full border border-[#79C24C]/20">
              ×{dhikr.repeatCount}
            </span>
          )}
          <CopyButton text={dhikr.translation} />
        </div>
      </div>
      <p className="text-white text-2xl leading-loose text-right arabic mb-3" dir="rtl">{dhikr.arabic}</p>
      <p className="text-[#C9F27A]/70 text-sm italic mb-2">{dhikr.transliteration}</p>
      <p className="text-white/70 text-sm leading-relaxed">{dhikr.translation}</p>
      {dhikr.reference && (
        <button type="button" onClick={() => setExpanded(!expanded)} className="mt-2 text-xs text-white/30 hover:text-white/50 transition-colors">
          {expanded ? '▲' : '▼'} {dhikr.reference}
        </button>
      )}
    </div>
  );
}

function DuaCard({ dua, favs, onToggleFav }: { dua: DuaEntry; favs: Set<string>; onToggleFav: (key: string) => void }) {
  const key = dua.title;
  const isFav = favs.has(key);
  return (
    <div className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-5 hover:border-[#79C24C]/25 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-[#C9F27A] font-semibold text-base">{dua.title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggleFav(key)}
            className={`text-sm transition-colors ${isFav ? 'text-yellow-400' : 'text-white/20 hover:text-white/50'}`}
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFav ? '★' : '☆'}
          </button>
          <CopyButton text={dua.translation} />
        </div>
      </div>
      <p className="text-white text-2xl leading-loose text-right arabic mb-3" dir="rtl">{dua.arabic}</p>
      <p className="text-[#C9F27A]/70 text-sm italic mb-2">{dua.transliteration}</p>
      <p className="text-white/70 text-sm leading-relaxed">{dua.translation}</p>
      {dua.reference && <p className="mt-2 text-xs text-white/30">{dua.reference}</p>}
    </div>
  );
}

export default function DuasPage() {
  const [tab, setTab] = useState<Tab>('morning');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<DuaCategory | 'All' | 'Favorites'>('All');
  const [favs, setFavs] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem('pc_dua_favs');
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const toggleFav = useCallback((key: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      try { localStorage.setItem('pc_dua_favs', JSON.stringify([...next])); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const q = search.toLowerCase();

  const filteredDuas = selectedDuas.filter(d => {
    if (category === 'Favorites' && !favs.has(d.title)) return false;
    if (category !== 'All' && category !== 'Favorites' && d.category !== category) return false;
    if (!q) return true;
    return d.title.toLowerCase().includes(q) || d.translation.toLowerCase().includes(q) || d.transliteration.toLowerCase().includes(q);
  });

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'morning', label: '🌅 Morning', count: morningAdhkar.length },
    { id: 'evening', label: '🌙 Evening', count: eveningAdhkar.length },
    { id: 'duas', label: '🤲 Duas', count: selectedDuas.length },
  ];

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0D2F17]/95 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🤲</span>
            <div>
              <h1 className="text-xl font-bold text-white">Duas & Adhkar</h1>
              <p className="text-white/40 text-xs">From Hisn al-Muslim and authentic hadith</p>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            {tabs.map(t => (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-[#1E5E2F] text-[#C9F27A] border border-[#79C24C]/30'
                    : 'bg-white/5 text-white/50 hover:text-white/70 border border-white/10'
                }`}
              >
                {t.label}
                <span className="ml-1 text-xs opacity-60">({t.count})</span>
              </button>
            ))}
          </div>
          {/* Duas search + filter */}
          {tab === 'duas' && (
            <div className="mt-3 flex gap-2">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search duas..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#79C24C]/40"
              />
              <label htmlFor="dua-category-filter" className="sr-only">Filter by category</label>
              <select
                id="dua-category-filter"
                aria-label="Filter duas by category"
                value={category}
                onChange={e => setCategory(e.target.value as DuaCategory | 'All' | 'Favorites')}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-[#79C24C]/40"
              >
                <option value="All">All</option>
                <option value="Favorites">★ Favorites</option>
                {duaCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 pt-5 space-y-3">
        {tab === 'morning' && morningAdhkar.map((d, i) => <AdhkarCard key={i} dhikr={d} index={i} />)}
        {tab === 'evening' && eveningAdhkar.map((d, i) => <AdhkarCard key={i} dhikr={d} index={i} />)}
        {tab === 'duas' && (
          filteredDuas.length === 0
            ? (
              <div className="text-center py-16 text-white/30">
                {search ? `No duas matching "${search}"` : 'No favorites yet — star a dua to save it'}
              </div>
            )
            : filteredDuas.map((d, i) => (
              <DuaCard key={i} dua={d} favs={favs} onToggleFav={toggleFav} />
            ))
        )}
      </div>
    </div>
  );
}
