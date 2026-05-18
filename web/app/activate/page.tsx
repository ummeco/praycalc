'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function ActivateContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') ?? '';
  const [code, setCode] = useState(initialCode.toUpperCase().replace(/[^A-Z0-9]/g, ''));
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleActivate() {
    const clean = code.replace(/[^A-Z0-9]/g, '');
    if (clean.length < 8) {
      setError('Please enter the full 8-character code shown on your TV (e.g., ABCD-1234).');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await fetch('/api/tv/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: clean }),
        credentials: 'include',
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      setStatus('success');
    } catch (e: unknown) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Failed to activate. Check the code and try again.');
    }
  }

  function formatCode(raw: string) {
    const clean = raw.replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (clean.length > 4) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    return clean;
  }

  return (
    <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center p-8">
      <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-3xl p-12 max-w-md w-full text-center">
        <div className="text-6xl mb-6">📺</div>
        <h1 className="text-3xl font-bold text-white mb-2">Activate TV</h1>
        <p className="text-white/60 mb-8">
          Enter the code shown on your TV screen to connect it to your PrayCalc account.
        </p>

        {status === 'success' ? (
          <div>
            <div className="text-6xl mb-4">✅</div>
            <p className="text-[#C9F27A] text-xl font-bold">TV Connected!</p>
            <p className="text-white/60 mt-2">Your TV will sync automatically within a few seconds.</p>
          </div>
        ) : (
          <>
            <input
              value={formatCode(code)}
              onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
              placeholder="ABCD-1234"
              className="w-full bg-black/30 border border-white/20 rounded-2xl px-6 py-4 text-white text-3xl font-mono tracking-widest text-center placeholder-white/20 focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60 mb-4"
              maxLength={9}
              onKeyDown={e => e.key === 'Enter' && handleActivate()}
              autoCapitalize="characters"
              autoComplete="off"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleActivate}
              disabled={status === 'loading'}
              className="w-full bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-xl transition-colors border border-[#79C24C]/30 disabled:opacity-50"
            >
              {status === 'loading' ? 'Connecting...' : 'Connect TV'}
            </button>
            <p className="text-white/40 text-xs mt-6">
              You must be signed in to your PrayCalc account for this to work.{' '}
              <Link href="/login" className="text-[#5A9438] underline">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    }>
      <ActivateContent />
    </Suspense>
  );
}
