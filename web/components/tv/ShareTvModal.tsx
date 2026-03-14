'use client';

import { useState } from 'react';

interface ShareTvModalProps {
  deviceId: string;
  deviceName: string;
  token: string;
  onClose: () => void;
}

type ShareState = 'idle' | 'loading' | 'success' | 'error';

export default function ShareTvModal({ deviceId, deviceName, token, onClose }: ShareTvModalProps) {
  const [email, setEmail] = useState('');
  const [canControl, setCanControl] = useState(true);
  const [canAnnounce, setCanAnnounce] = useState(false);
  const [state, setState] = useState<ShareState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sharedEmail, setSharedEmail] = useState('');

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Enter a valid email address.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmed,
          permissions: {
            view: true,
            control: canControl,
            announce: canAnnounce,
          },
        }),
      });

      const data = await res.json() as { success?: boolean; sharedWith?: { email: string }; error?: string };

      if (!res.ok) {
        if (res.status === 404) {
          setErrorMsg('No PrayCalc account found for that email address.');
        } else if (res.status === 400) {
          setErrorMsg(data.error ?? 'Invalid request.');
        } else if (res.status === 403) {
          setErrorMsg('You do not own this TV.');
        } else {
          setErrorMsg(data.error ?? 'Something went wrong. Try again.');
        }
        setState('error');
        return;
      }

      setSharedEmail(data.sharedWith?.email ?? trimmed);
      setState('success');
    } catch {
      setErrorMsg('Could not reach the server. Check your connection.');
      setState('error');
    }
  }

  function reset() {
    setEmail('');
    setCanControl(true);
    setCanAnnounce(false);
    setState('idle');
    setErrorMsg('');
    setSharedEmail('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0D2F17] border border-[#79C24C]/30 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl">Share TV</h2>
            <p className="text-white/40 text-sm mt-0.5 truncate max-w-[200px]">{deviceName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Success state */}
        {state === 'success' ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-14 h-14 rounded-full bg-[#1E5E2F] flex items-center justify-center text-3xl">
              ✓
            </div>
            <p className="text-white font-semibold text-lg text-center">Shared successfully</p>
            <p className="text-white/50 text-sm text-center">
              <span className="text-[#C9F27A]">{sharedEmail}</span> can now view this TV.
            </p>
            <div className="flex gap-2 w-full mt-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 px-4 py-2 bg-[#1E5E2F]/40 hover:bg-[#1E5E2F]/60 text-[#C9F27A] rounded-xl text-sm font-medium transition-colors"
              >
                Share with another
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-xl text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleShare(e)} className="flex flex-col gap-5">
            {/* Email input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="share-email" className="text-white/70 text-sm font-medium">
                Email address
              </label>
              <input
                id="share-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle'); }}
                placeholder="user@example.com"
                className="bg-black/30 border border-[#79C24C]/30 focus:border-[#79C24C] rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none transition-colors"
                autoFocus
                disabled={state === 'loading'}
                autoComplete="email"
              />
            </div>

            {/* Permissions */}
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm font-medium">Permissions</p>
              <div className="flex flex-col gap-2">
                {/* View — always on, disabled */}
                <label className="flex items-center gap-3 cursor-not-allowed">
                  <div className="w-4 h-4 rounded bg-[#79C24C]/40 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                      <path d="M1 4l2.5 2.5L9 1" stroke="#C9F27A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-white/40 text-sm">View</span>
                    <span className="text-white/25 text-xs ml-2">Always granted</span>
                  </div>
                </label>

                {/* Control */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canControl}
                    onChange={e => setCanControl(e.target.checked)}
                    disabled={state === 'loading'}
                    className="sr-only"
                  />
                  <div
                    onClick={() => state !== 'loading' && setCanControl(v => !v)}
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      canControl
                        ? 'bg-[#79C24C] border-[#79C24C]'
                        : 'bg-transparent border-[#79C24C]/30'
                    }`}
                    role="presentation"
                  >
                    {canControl && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#0D2F17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-white/80 text-sm">Control</span>
                    <span className="text-white/30 text-xs ml-2">Change display, settings</span>
                  </div>
                </label>

                {/* Announce */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canAnnounce}
                    onChange={e => setCanAnnounce(e.target.checked)}
                    disabled={state === 'loading'}
                    className="sr-only"
                  />
                  <div
                    onClick={() => state !== 'loading' && setCanAnnounce(v => !v)}
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                      canAnnounce
                        ? 'bg-[#79C24C] border-[#79C24C]'
                        : 'bg-transparent border-[#79C24C]/30'
                    }`}
                    role="presentation"
                  >
                    {canAnnounce && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                        <path d="M1 4l2.5 2.5L9 1" stroke="#0D2F17" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="text-white/80 text-sm">Announce</span>
                    <span className="text-white/30 text-xs ml-2">Send announcements to TV</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Error */}
            {state === 'error' && errorMsg && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full py-2.5 bg-[#1E5E2F] hover:bg-[#2a7a3d] disabled:opacity-50 disabled:cursor-not-allowed text-[#C9F27A] rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {state === 'loading' ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#C9F27A]/30 border-t-[#C9F27A] rounded-full animate-spin" />
                  Sharing…
                </>
              ) : (
                'Share'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
