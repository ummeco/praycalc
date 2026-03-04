"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useSession } from "@/hooks/useSession";
import { useSettings } from "@/hooks/useSettings";
import AccountDashboard from "@/components/AccountDashboard";

type Mode = "password" | "emaillink";

// Social provider definition — available=false = greyed until Hasura Auth backend is live
const SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "continueWithGoogle" as const,
    available: false,
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
  const { session, hydrated, isLoggedIn, login, logout } = useSession();
  const settings = useSettings();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  function switchToEmailLink() { setMode("emaillink"); setSent(false); }
  function switchToPassword() { setMode("password"); setSent(false); setEmail(""); }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    // Mock login — any credentials work until Hasura Auth is live
    login(email.trim());
  }

  async function handleEmailLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Email OTP requires Hasura Auth backend (auth.ummat.dev) to be deployed.
    // When live: POST /signin/email-otp { email: email.trim() }
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSent(true);
  }

  // Don't flash the sign-in form before localStorage loads
  if (!hydrated) {
    return <main className="account-page" aria-busy="true" />;
  }

  // Signed-in: show dashboard
  if (isLoggedIn && session) {
    return (
      <main className="account-page">
        <AccountDashboard session={session} settings={settings} onLogout={logout} />
      </main>
    );
  }

  return (
    <main id="main-content" className="account-page">
      <div className="account-card">

        {/* Logo */}
        <Link href="/" aria-label="PrayCalc home" className="account-logo">
          <Image src="/logo.svg" alt="PrayCalc" width={130} height={38} priority unoptimized />
        </Link>

        {/* Heading */}
        <h1 className="account-heading">{t("signIn")}</h1>
        <p className="account-sub">{t("accountBenefits")}</p>

        {/* ── Password form (default) ───────────────────────────────── */}
        {mode === "password" && (
          <form className="account-email-group" onSubmit={handlePasswordSignIn}>
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
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={!email.trim() || !password}
            >
              {t("signIn")}
            </button>
            <button type="button" className="account-mode-toggle" onClick={switchToEmailLink}>
              {t("useEmailLink")}
            </button>
          </form>
        )}

        {/* ── Email link form ───────────────────────────────────────── */}
        {mode === "emaillink" && !sent && (
          <form className="account-email-group" onSubmit={handleEmailLink}>
            <input
              type="email"
              className="account-input"
              placeholder={t("emailAddress")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <button
              type="submit"
              className="account-submit-btn"
              disabled={loading || !email.trim()}
            >
              {loading ? "…" : t("getLoginLink")}
            </button>
            <button type="button" className="account-mode-toggle" onClick={switchToPassword}>
              {t("usePassword")}
            </button>
          </form>
        )}

        {/* ── Link sent confirmation ────────────────────────────────── */}
        {mode === "emaillink" && sent && (
          <div className="account-email-group">
            <p className="account-sent">{t("loginLinkSent")}</p>
            <button type="button" className="account-mode-toggle" onClick={switchToPassword}>
              {t("usePassword")}
            </button>
          </div>
        )}

        {/* ── Social login row ──────────────────────────────────────── */}
        <div className="account-divider">{t("orContinueWith")}</div>

        <div className="account-social-row">
          {SOCIAL_PROVIDERS.map(({ id, label, available, icon }) => (
            <button
              key={id}
              type="button"
              className={`account-social-btn${available ? "" : " account-social-btn--disabled"}`}
              disabled={!available}
              title={available ? t(label) : `${t(label)} — ${t("comingSoon")}`}
              aria-label={available ? t(label) : `${t(label)} — ${t("comingSoon")}`}
            >
              {icon}
              <span>{t(label)}</span>
            </button>
          ))}
        </div>

        {/* Back link */}
        <Link href="/" className="account-back">
          &larr; {t("backHome")}
        </Link>

      </div>
    </main>
  );
}
