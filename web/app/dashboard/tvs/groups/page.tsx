'use client';
import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../../../../lib/session';

interface Group {
  id: string;
  name: string;
  deviceCount: number;
}

// TV2-11.5: Announce modal — sends crawler text to all TVs in group (3+ required)
function AnnounceModal({ group, onClose }: { group: Group; onClose: () => void }) {
  const [text, setText] = useState('');
  const [expiresIn, setExpiresIn] = useState(60);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(`/api/dashboard/tvs/groups/${group.id}/announce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim(), expires_in_minutes: expiresIn }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
      }
      setSent(true);
      setTimeout(onClose, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0D2F17] border border-[#79C24C]/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-1">Send Announcement</h2>
        <p className="text-white/50 text-sm mb-6">
          Crawler text will appear on all {group.deviceCount} TVs in{' '}
          <span className="text-[#C9F27A]">{group.name}</span>.
        </p>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-3">✓</p>
            <p className="text-[#C9F27A] font-semibold">
              Announcement sent to {group.deviceCount} TVs
            </p>
          </div>
        ) : (
          <>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. Jumu'ah prayer starts at 1:30 PM in the main hall"
              maxLength={500}
              rows={4}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60 resize-none mb-2"
            />
            <div className="flex justify-between items-center mb-6">
              <span className="text-white/30 text-xs">{text.length}/500</span>
              <div className="flex items-center gap-2 text-sm text-white/50">
                <span>Expires in</span>
                <select
                  value={expiresIn}
                  onChange={e => setExpiresIn(Number(e.target.value))}
                  aria-label="Expiry duration"
                  className="bg-black/30 border border-white/10 rounded-lg px-2 py-1 text-white text-sm outline-none focus-visible:ring-1 focus-visible:ring-[#79C24C]/60"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 hour</option>
                  <option value={180}>3 hours</option>
                  <option value={1440}>24 hours</option>
                </select>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                aria-label="Close"
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="flex-1 py-3 rounded-xl bg-[#1E5E2F] text-[#C9F27A] font-semibold hover:bg-[#79C24C]/20 border border-[#79C24C]/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending…' : 'Send to All TVs'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function TvGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [newGroupName, setNewGroupName] = useState('');
  const [announceGroup, setAnnounceGroup] = useState<Group | null>(null);

  const fetchGroups = useCallback(async () => {
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch('/api/dashboard/tvs/groups', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { groups?: Array<{ id: string; name: string; device_count?: number }> };
      setGroups((data.groups ?? []).map(g => ({ id: g.id, name: g.name, deviceCount: g.device_count ?? 0 })));
    } catch {
      // keep empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchGroups(); }, [fetchGroups]);

  async function createGroup() {
    if (!newGroupName.trim()) return;
    const session = getSession();
    const token = session?.tokens?.accessToken;
    const name = newGroupName.trim();
    setNewGroupName('');
    // Optimistic add
    const tempId = `temp-${Date.now()}`;
    setGroups(g => [...g, { id: tempId, name, deviceCount: 0 }]);
    if (token) {
      try {
        const res = await fetch('/api/dashboard/tvs/groups', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const data = await res.json() as { group?: { id: string } };
          if (data.group?.id) {
            setGroups(g => g.map(x => x.id === tempId ? { ...x, id: data.group!.id } : x));
          }
        }
      } catch { /* keep optimistic */ }
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {announceGroup && (
        <AnnounceModal group={announceGroup} onClose={() => setAnnounceGroup(null)} />
      )}

      <h1 className="text-3xl font-bold text-white mb-2">TV Groups</h1>
      {loading && <p className="text-white/40 text-sm mb-4">Loading groups...</p>}
      <p className="text-white/60 mb-8">
        Group TVs together to push settings or announcements in bulk.
      </p>

      <div className="flex gap-3 mb-8">
        <input
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
          placeholder="New group name..."
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
          onKeyDown={e => { if (e.key === 'Enter') createGroup(); }}
        />
        <button
          type="button"
          onClick={createGroup}
          className="bg-[#1E5E2F] text-[#C9F27A] px-6 rounded-xl font-medium hover:bg-[#79C24C]/20 border border-[#79C24C]/30 transition-colors"
        >
          Create
        </button>
      </div>

      <div className="space-y-4">
        {groups.map(g => (
          <div
            key={g.id}
            className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-2xl p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="text-white font-bold text-xl">{g.name}</h3>
              <p className="text-white/50 text-sm">
                {g.deviceCount} TV{g.deviceCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-end">
              {/* TV2-11.5: Bulk announce — only shown when group has 3+ TVs */}
              {g.deviceCount >= 3 && (
                <button
                  type="button"
                  onClick={() => setAnnounceGroup(g)}
                  className="bg-[#0D2F17] text-[#C9F27A] px-4 py-2 rounded-xl text-sm hover:bg-[#1E5E2F]/60 border border-[#79C24C]/20 transition-colors"
                  title="Send crawler announcement to all TVs in this group"
                >
                  Announce
                </button>
              )}
              <button type="button" className="bg-[#1E5E2F]/40 text-[#C9F27A] px-4 py-2 rounded-xl text-sm hover:bg-[#1E5E2F]/60 transition-colors">
                Push Settings
              </button>
              <button
                type="button"
                className="text-white/30 hover:text-red-400 px-3 py-2 rounded-xl text-sm transition-colors"
                onClick={() => setGroups(g2 => g2.filter(x => x.id !== g.id))}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50">
            No groups yet. Create one to manage multiple TVs together.
          </p>
        </div>
      )}
    </div>
  );
}
