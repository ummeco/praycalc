'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from '@/hooks/useSession';

const SMART_URL = 'https://smart.praycalc.com/api/v1/agendas';

type Anchor = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'fixed';

interface AgendaItem {
  id: string;
  label: string;
  anchor: Anchor;
  offsetMinutes: number;
  durationMinutes: number;
  notes?: string;
}

interface Agenda {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  is_public: boolean;
  lat?: number;
  lng?: number;
  timezone: string;
  items_json: AgendaItem[];
  updated_at: string;
}

const ANCHOR_LABELS: Record<Anchor, string> = {
  fajr: 'Fajr', sunrise: 'Sunrise', dhuhr: 'Dhuhr',
  asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha', fixed: 'Fixed time',
};

function itemSummary(item: AgendaItem): string {
  const offset = item.offsetMinutes === 0 ? 'at' : `${item.offsetMinutes > 0 ? '+' : ''}${item.offsetMinutes}m`;
  return `${offset} ${ANCHOR_LABELS[item.anchor]}`;
}

// ── AgendaEditor component ────────────────────────────────────────────────────

function AgendaEditor({ agenda, token, onSave, onCancel }: {
  agenda: Partial<Agenda>;
  token: string;
  onSave: (updated: Agenda) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(agenda.title ?? '');
  const [description, setDescription] = useState(agenda.description ?? '');
  const [isPublic, setIsPublic] = useState(agenda.is_public ?? false);
  const [items, setItems] = useState<AgendaItem[]>(agenda.items_json ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addItem = () => setItems(prev => [...prev, {
    id: crypto.randomUUID(),
    label: '',
    anchor: 'fajr',
    offsetMinutes: 0,
    durationMinutes: 30,
  }]);

  const updateItem = (id: string, patch: Partial<AgendaItem>) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const save = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      const method = agenda.id ? 'PATCH' : 'POST';
      const url = agenda.id ? `${SMART_URL}/${agenda.id}` : SMART_URL;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined, items_json: items, is_public: isPublic }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json() as Agenda;
      onSave(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-[#0D2F17] border border-[#79C24C]/20 rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-5">{agenda.id ? 'Edit Agenda' : 'New Agenda'}</h2>

        <label className="block mb-4">
          <span className="text-white/60 text-sm">Title</span>
          <input value={title} onChange={e => setTitle(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#79C24C]/40 focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
            placeholder="e.g. Ramadan Program" />
        </label>

        <label className="block mb-4">
          <span className="text-white/60 text-sm">Description (optional)</span>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#79C24C]/40 focus-visible:ring-2 focus-visible:ring-[#79C24C]/60 resize-none"
            rows={2} placeholder="Brief description..." />
        </label>

        {/* Items */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/60 text-sm">Schedule items</span>
            <button type="button" onClick={addItem}
              className="text-xs text-[#C9F27A] border border-[#79C24C]/30 rounded-lg px-2 py-1 hover:bg-[#79C24C]/10 transition-colors">
              + Add item
            </button>
          </div>
          {items.length === 0 && <p className="text-white/30 text-xs text-center py-3">No items yet</p>}
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex gap-2 mb-2">
                  <input value={item.label} onChange={e => updateItem(item.id, { label: e.target.value })}
                    className="flex-1 bg-transparent text-white text-sm border-b border-white/20 focus:outline-none focus:border-[#79C24C]/50 focus-visible:ring-1 focus-visible:ring-[#79C24C]/60 pb-0.5"
                    placeholder="Item name" />
                  <button type="button" onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 text-xs transition-colors">✕</button>
                </div>
                <div className="flex gap-2">
                  <select value={item.anchor} onChange={e => updateItem(item.id, { anchor: e.target.value as Anchor })}
                    aria-label="Prayer anchor"
                    className="flex-1 bg-[#0D2F17] border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#79C24C]/60">
                    {Object.entries(ANCHOR_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <input type="number" value={item.offsetMinutes} onChange={e => updateItem(item.id, { offsetMinutes: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-[#0D2F17] border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#79C24C]/60 text-center"
                    title="Offset in minutes" placeholder="0m" />
                  <input type="number" min={0} value={item.durationMinutes} onChange={e => updateItem(item.id, { durationMinutes: parseInt(e.target.value) || 0 })}
                    className="w-16 bg-[#0D2F17] border border-white/10 rounded-lg px-2 py-1 text-white/70 text-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-[#79C24C]/60 text-center"
                    title="Duration in minutes" placeholder="30m" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public toggle */}
        <label className="flex items-center gap-3 mb-5 cursor-pointer">
          <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)}
            className="w-4 h-4 accent-[#79C24C]" />
          <span className="text-white/70 text-sm">Share publicly (generates a shareable link)</span>
        </label>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-white/10 text-white/50 text-sm hover:text-white/70 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-[#1E5E2F] border border-[#79C24C]/30 text-[#C9F27A] font-semibold text-sm hover:bg-[#79C24C]/20 disabled:opacity-50 transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AgendasPage() {
  const { session, hydrated, isLoggedIn } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';

  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Agenda> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(SMART_URL, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setAgendas((await res.json()).agendas ?? []);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleSave = (updated: Agenda) => {
    setAgendas(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
      return [updated, ...prev];
    });
    setEditing(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`${SMART_URL}/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setAgendas(prev => prev.filter(a => a.id !== id));
    } finally { setDeleting(null); }
  };

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
          <div className="text-5xl mb-5">📋</div>
          <h1 className="text-2xl font-bold text-white mb-3">Prayer Agendas</h1>
          <p className="text-white/60 mb-8">Sign in to create and manage prayer time agendas.</p>
          <Link href="/account" className="block bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-lg transition-colors border border-[#79C24C]/30">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white pb-16">
      {editing && (
        <AgendaEditor
          agenda={editing}
          token={token}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="max-w-lg mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">📋 Prayer Agendas</h1>
            <p className="text-white/40 text-sm mt-1">Schedule events anchored to prayer times</p>
          </div>
          <button type="button" onClick={() => setEditing({})}
            className="bg-[#1E5E2F] border border-[#79C24C]/30 text-[#C9F27A] font-semibold rounded-xl px-4 py-2 text-sm hover:bg-[#79C24C]/20 transition-colors">
            + New
          </button>
        </div>

        {loading && <p className="text-white/30 text-center py-12">Loading…</p>}

        {!loading && agendas.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white/40 mb-2">No agendas yet</p>
            <button type="button" onClick={() => setEditing({})}
              className="text-[#C9F27A] text-sm hover:underline">
              Create your first agenda
            </button>
          </div>
        )}

        <div className="space-y-3">
          {agendas.map(agenda => (
            <div key={agenda.id} className="bg-[#1E5E2F]/10 border border-[#79C24C]/10 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold truncate">{agenda.title}</h3>
                    {agenda.is_public && (
                      <span className="text-xs bg-[#79C24C]/10 text-[#C9F27A] px-2 py-0.5 rounded-full border border-[#79C24C]/20 flex-shrink-0">
                        Public
                      </span>
                    )}
                  </div>
                  {agenda.description && (
                    <p className="text-white/50 text-sm mt-0.5 truncate">{agenda.description}</p>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    {agenda.items_json?.length ?? 0} items · {agenda.timezone}
                  </p>
                  {agenda.slug && (
                    <a href={`/agenda/${agenda.slug}`} target="_blank" rel="noopener noreferrer"
                      className="text-[#79C24C] text-xs hover:underline">
                      praycalc.com/agenda/{agenda.slug}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button type="button" onClick={() => setEditing(agenda)}
                    className="text-white/30 hover:text-white/60 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm" title="Edit">
                    ✏️
                  </button>
                  <button type="button" onClick={() => handleDelete(agenda.id)} disabled={deleting === agenda.id}
                    className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-sm disabled:opacity-30" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              {/* Item preview */}
              {agenda.items_json?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                  {agenda.items_json.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-center gap-2 text-xs text-white/40">
                      <span className="text-[#79C24C]/60">·</span>
                      <span className="text-white/60">{item.label}</span>
                      <span>{itemSummary(item)}</span>
                    </div>
                  ))}
                  {agenda.items_json.length > 3 && (
                    <p className="text-white/20 text-xs">+{agenda.items_json.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
