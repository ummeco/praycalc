/**
 * Purpose: Self-contained "Account" settings tab — Ummat sign-in/sign-up, entitlement
 *   badge/upsell, and sign-out. Manages its own local state independent of the
 *   prayer-settings `form`/`onSave` flow in Settings.tsx.
 * Inputs: none (props-free; reads/writes auth state via lib/auth.ts).
 * Outputs: renders sign-in form (signed-out) or account summary (signed-in).
 * Constraints: no `any`; matches existing dark-green Tailwind conventions from the
 *   `location` tab's input styling; opens external links via tauri-plugin-opener
 *   (a plain <a href> does not work correctly inside the tray webview shell).
 * SPORT: praycalc desktop — account sign-in (Account tab UI).
 */
import { useState, useEffect, useCallback } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import type { AuthSession, EntitlementStatus } from '../lib/auth-types';
import { signIn, signUp, signOut, loadAuthState, scheduleRefresh, checkEntitlement } from '../lib/auth';

type Mode = 'signin' | 'signup';

export default function AccountTab() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [entitlement, setEntitlement] = useState<EntitlementStatus>({ isPlus: false });
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEntitlement = useCallback(async (s: AuthSession) => {
    const status = await checkEntitlement(s.accessToken);
    setEntitlement(status);
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadAuthState().then((s) => {
      if (cancelled) return;
      setSession(s);
      setLoading(false);
      if (s) refreshEntitlement(s);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshEntitlement]);

  // Auto-refresh the access token 60s before it expires while signed in.
  useEffect(() => {
    if (!session) return;
    const cancel = scheduleRefresh(session, (next) => {
      setSession(next);
      if (next) refreshEntitlement(next);
    });
    return cancel;
  }, [session, refreshEntitlement]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const s = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
      setSession(s);
      setPassword('');
      await refreshEntitlement(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed');
    } finally {
      setSubmitting(false);
    }
  }, [mode, email, password, refreshEntitlement]);

  const handleSignOut = useCallback(async () => {
    if (session) await signOut(session.refreshToken);
    setSession(null);
    setEntitlement({ isPlus: false });
    setEmail('');
  }, [session]);

  const handleUpgrade = useCallback(() => {
    openUrl('https://praycalc.com/upgrade').catch(() => {});
  }, []);

  if (loading) {
    return <div className="text-[11px] text-green-300/50">Loading account…</div>;
  }

  if (session) {
    return (
      <div className="space-y-3">
        <div>
          <div className="text-[11px] text-green-300/60 mb-1">Signed in as</div>
          <div className="text-sm text-green-100">{session.email}</div>
        </div>

        {entitlement.isPlus ? (
          <div className="inline-block bg-brand-mid/20 border border-brand-mid text-brand-light text-[11px] font-semibold px-2 py-1 rounded">
            Ummat+ active
          </div>
        ) : (
          <div className="bg-brand-deep border border-brand-dark rounded px-3 py-2.5 space-y-2">
            <div className="text-sm text-green-100 font-medium">Ummat+ — $9.99/yr</div>
            <div className="text-[11px] text-green-300/60">Unlocks TV &amp; Smart Home</div>
            <button
              onClick={handleUpgrade}
              className="bg-brand-mid hover:bg-brand-light text-brand-bg text-xs font-semibold px-3 py-1.5 rounded transition-colors"
            >
              Upgrade
            </button>
          </div>
        )}

        <button
          onClick={() => void handleSignOut()}
          className="text-white/40 hover:text-red-400 text-xs font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 text-[11px] font-medium">
        <button
          onClick={() => setMode('signin')}
          className={`px-2 py-1 rounded transition-colors ${
            mode === 'signin' ? 'text-brand-light bg-brand-dark/40' : 'text-green-300/50 hover:text-green-300/80'
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode('signup')}
          className={`px-2 py-1 rounded transition-colors ${
            mode === 'signup' ? 'text-brand-light bg-brand-dark/40' : 'text-green-300/50 hover:text-green-300/80'
          }`}
        >
          Create account
        </button>
      </div>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="text-[11px] text-green-300/60 block mb-1">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-brand-deep border border-brand-dark rounded px-2 py-1.5 text-sm text-green-100 focus:outline-none focus:border-brand-mid"
          placeholder="••••••••"
        />
      </label>

      {error && <div className="text-[11px] text-red-400">{error}</div>}

      <button
        onClick={() => void handleSubmit()}
        disabled={submitting || !email || !password}
        className="bg-brand-mid hover:bg-brand-light disabled:opacity-40 disabled:cursor-not-allowed text-brand-bg text-xs font-semibold px-3 py-1.5 rounded transition-colors"
      >
        {submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
      </button>
    </div>
  );
}
