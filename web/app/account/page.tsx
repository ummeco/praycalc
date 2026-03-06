"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/useSession";
import { useSettings } from "@/hooks/useSettings";
import { googleOAuthUrl } from "@/lib/auth-client";
import AccountDashboard from "@/components/AccountDashboard";

type Mode =
  | "magic-link"
  | "password"
  | "register"
  | "forgot-password"
  | "link-sent"
  | "reset-sent";

const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "continueWithGoogle" as const,
    available: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="currentColor"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="currentColor"/>
        <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="currentColor"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "apple",
    label: "continueWithApple" as const,
    available: false,
    icon: (
      <svg width="13" height="16" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.5c-44-81.9-79.6-207.2-79.6-326.8C0 504.2 39.7 431.9 108.2 381.1c50.7-37.2 119.1-61.8 191-61.8 68.8 0 127.3 28.7 160.2 28.7 31.9 0 103.4-30.5 160.2-30.5zm-316.6-68.3c-8.3-28.6-8.3-86.7 0-115.3 50.3-18.8 111.1-60.3 143.4-129.3 10.8 5.6 97.4 49.8 97.4 162 0 24.3-3.8 48.3-10.2 71.6-28.8 0-104.1-2.3-148.8-36.6l-81.8 47.6z"/>
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "continueWithFacebook" as const,
    available: false,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "x",
    label: "continueWithX" as const,
    available: false,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.261 5.631 5.903-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
] as const;

export default function AccountPage() {
  const t = useTranslations("ui");
  const {
    session,
    hydrated,
    isLoggedIn,
    login,
    loginWithPassword,
    register,
    sendMagicLink,
    sendPasswordReset,
    logout,
  } = useSession();
  const settings = useSettings();
  const [mode, setMode] = useState<Mode>("magic-link");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backHref, setBackHref] = useState("/");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("pc_recent_cities");
      const cities: Array<{ slug: string }> = raw ? JSON.parse(raw) : [];
      if (cities[0]?.slug) setBackHref(`/${cities[0].slug}`);
    } catch {
      // localStorage unavailable
    }
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError("");
    setConfirmPassword("");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await sendMagicLink(email.trim());
      setMode("link-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send login link.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      await loginWithPassword(email.trim(), password);
    } catch (err) {
      // Fallback to stub login if Hasura Auth is unreachable (dev/test).
      if (err instanceof TypeError && err.message.includes("fetch")) {
        login(email.trim());
      } else {
        setError(err instanceof Error ? err.message : "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        login(displayName.trim() || email.trim());
      } else {
        setError(err instanceof Error ? err.message : "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await sendPasswordReset(email.trim());
      setMode("reset-sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  }

  if (!hydrated) {
    return <main className="account-page" aria-busy="true" />;
  }

  if (isLoggedIn && session) {
    return (
      <main className="account-page">
        <AccountDashboard session={session} settings={settings} onLogout={logout} />
      </main>
    );
  }

  const showTabs = mode !== "link-sent" && mode !== "reset-sent";

  return (
    <main id="main-content" className="account-page">
      <div className="account-card">

        {/* Logo with back arrow */}
        <div className="account-logo-wrap">
          <Link href={backHref} className="account-logo-back" aria-label="Go back">&larr;</Link>
          <Link href={backHref} aria-label="PrayCalc home">
            <Image src="/logo.svg" alt="PrayCalc" width={130} height={38} priority unoptimized />
          </Link>
        </div>

        {/* Subtitle */}
        <p className="account-sub">
          Your account will sync all settings, preferences, and history across all of your devices.
        </p>

        {/* Login Link / Password tabs */}
        {showTabs && (
          <div className="account-mode-tabs">
            <button
              type="button"
              onClick={() => switchMode("magic-link")}
              className={`account-mode-tab${mode === "magic-link" ? " account-mode-tab--active" : ""}`}
            >
              Login Link
            </button>
            <button
              type="button"
              onClick={() => switchMode("password")}
              className={`account-mode-tab${mode === "password" || mode === "forgot-password" || mode === "register" ? " account-mode-tab--active" : ""}`}
            >
              Password
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="account-error">
            {error}{" "}
            <button
              type="button"
              className="account-mode-toggle"
              onClick={() => switchMode("magic-link")}
            >
              Use a login link instead.
            </button>
          </div>
        )}

        {/* Magic link form */}
        {mode === "magic-link" && (
          <form className="account-email-group" onSubmit={handleMagicLink}>
            <p className="account-hint">
              New here? We&rsquo;ll create your account automatically.
            </p>
            <input
              type="email"
              className="account-input"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending\u2026" : "Send Login Link"}
            </button>
          </form>
        )}

        {/* Password form */}
        {mode === "password" && (
          <form className="account-email-group" onSubmit={handlePassword}>
            <input
              type="email"
              className="account-input"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <input
              type="password"
              className="account-input"
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={loading || !email.trim() || !password}
            >
              {loading ? "Logging in\u2026" : "Login"}
            </button>
            <div className="account-toggle-row">
              <button
                type="button"
                className="account-mode-toggle"
                onClick={() => switchMode("register")}
              >
                Create Account
              </button>
              <button
                type="button"
                className="account-mode-toggle"
                onClick={() => switchMode("forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          </form>
        )}

        {/* Register form */}
        {mode === "register" && (
          <form className="account-email-group" onSubmit={handleRegister}>
            <input
              type="text"
              className="account-input"
              placeholder="Name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              autoFocus
            />
            <input
              type="email"
              className="account-input"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <input
              type="password"
              className="account-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <input
              type="password"
              className="account-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={loading || !email.trim() || !password || !confirmPassword}
            >
              {loading ? "Creating account\u2026" : "Create Account"}
            </button>
            <button
              type="button"
              className="account-mode-toggle"
              onClick={() => switchMode("password")}
            >
              Already have an account? Login
            </button>
          </form>
        )}

        {/* Forgot password form */}
        {mode === "forgot-password" && (
          <form className="account-email-group" onSubmit={handleForgotPassword}>
            <p className="account-hint">
              Enter your email and we&rsquo;ll send you a reset link.
            </p>
            <input
              type="email"
              className="account-input"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "Sending\u2026" : "Send Reset Link"}
            </button>
            <button
              type="button"
              className="account-mode-toggle"
              onClick={() => switchMode("password")}
            >
              Back to login
            </button>
          </form>
        )}

        {/* Link sent confirmation */}
        {mode === "link-sent" && (
          <div className="account-confirmation">
            <div className="account-confirmation-icon">
              <svg width="22" height="22" fill="none" stroke="#79C24C" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="account-confirmation-title">Check your inbox</p>
            <p className="account-confirmation-text">
              We sent a login link to <strong>{email}</strong>. It expires in 15 minutes.
            </p>
            <button
              type="button"
              className="account-mode-toggle"
              onClick={() => switchMode("magic-link")}
            >
              Use a different email
            </button>
          </div>
        )}

        {/* Reset sent confirmation */}
        {mode === "reset-sent" && (
          <div className="account-confirmation">
            <div className="account-confirmation-icon">
              <svg width="22" height="22" fill="none" stroke="#79C24C" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="account-confirmation-title">Reset link sent</p>
            <p className="account-confirmation-text">
              Check <strong>{email}</strong> for a password reset link.
            </p>
            <button
              type="button"
              className="account-mode-toggle"
              onClick={() => switchMode("password")}
            >
              Back to login
            </button>
          </div>
        )}

        {/* Social login row */}
        {showTabs && (
          <>
            <div className="account-divider">or</div>
            <div className="account-social-row">
              {SOCIAL_PROVIDERS.map(({ id, label, available, icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`account-social-btn${available ? "" : " account-social-btn--disabled"}`}
                  disabled={!available}
                  title={available ? t(label) : `${t(label)} \u2014 ${t("comingSoon")}`}
                  aria-label={available ? t(label) : `${t(label)} \u2014 ${t("comingSoon")}`}
                  onClick={available && id === "google" ? () => {
                    window.location.href = googleOAuthUrl();
                  } : undefined}
                >
                  {icon}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Footer tagline */}
        <p className="account-footer-note">
          PrayCalc is a part of the Ummat ecosystem, your account works across{" "}
          <a href="https://ummat.dev" target="_blank" rel="noopener noreferrer" className="account-footer-link">
            all of our apps
          </a>
          .
        </p>

      </div>
    </main>
  );
}
