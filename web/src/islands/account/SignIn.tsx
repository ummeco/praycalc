/**
 * SignIn.tsx — Account sign-in card (magic-link default tab + password tab).
 *
 * PURPOSE: Renders when AccountClient has no active session. Magic-link
 *   requests hit the shared Ummat Hasura Auth instance directly; password
 *   sign-in goes through src/lib/auth/client.ts's same-origin proxy routes.
 * INPUTS: onSignedIn callback, invoked with the built PrayCalcSession once
 *   password sign-in succeeds (magic-link is a "check your email" dead end).
 * OUTPUTS: Sign-in form UI; calls onSignedIn on successful password auth.
 * CONSTRAINTS: Astro island child (rendered only inside AccountClient's
 *   client:load boundary). No next/* imports. Extracted from AccountClient.tsx
 *   (2026-07 file-size split) — behavior unchanged.
 * REF: P2-PRAYCALC-E2E-REBUILD · account.spec.ts
 */

import { useState } from 'react';
import { buildSession, type PrayCalcSession } from '@/lib/session';
import { signIn, requestMagicLink } from '@/lib/auth/client';

type Mode = 'magic' | 'password';

export default function SignIn({ onSignedIn }: { onSignedIn: (s: PrayCalcSession) => void }) {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const submitDisabled =
    loading || (mode === 'magic' ? !email.trim() : !(email.trim() && password));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitDisabled) return;
    setError(null);

    if (mode === 'magic') {
      setLoading(true);
      try {
        await requestMagicLink(email.trim());
        setMagicLinkSent(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send login link.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email.trim(), password);
      const session: PrayCalcSession = {
        ...buildSession(result.user.email || email, result.user.displayName),
        accessTokenExpiresAt: result.accessTokenExpiresAt,
      };
      onSignedIn(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'magic' && magicLinkSent) {
    return (
      <div className="account-card">
        <a href="/" className="account-logo-back" aria-label="Back to PrayCalc">
          <span aria-hidden="true">←</span>
          <img src="/logo-sunrise.svg" alt="PrayCalc" width="28" height="28" />
        </a>
        <h1 className="account-title">Check your email</h1>
        <p className="account-magic-sent">
          We sent a login link to <strong>{email.trim()}</strong>. Click it to sign in.
        </p>
        <button
          type="button"
          className="account-submit-btn"
          onClick={() => {
            setMagicLinkSent(false);
            setError(null);
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="account-card">
      <a href="/" className="account-logo-back" aria-label="Back to PrayCalc">
        <span aria-hidden="true">←</span>
        <img src="/logo-sunrise.svg" alt="PrayCalc" width="28" height="28" />
      </a>

      <h1 className="account-title">Sign in to PrayCalc</h1>

      <div className="account-mode-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'magic'}
          className={`account-mode-tab${mode === 'magic' ? ' account-mode-tab--active' : ''}`}
          onClick={() => {
            setMode('magic');
            setError(null);
          }}
        >
          Login Link
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'password'}
          className={`account-mode-tab${mode === 'password' ? ' account-mode-tab--active' : ''}`}
          onClick={() => {
            setMode('password');
            setError(null);
          }}
        >
          Password
        </button>
      </div>

      <form className="account-form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="account-input"
          placeholder="you@example.com"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode === 'password' && (
          <input
            type="password"
            className="account-input"
            placeholder="Password"
            aria-label="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {error && (
          <p className="account-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="account-submit-btn" disabled={submitDisabled}>
          {loading ? 'Please wait…' : mode === 'magic' ? 'Send login link' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
