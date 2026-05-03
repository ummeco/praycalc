"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type FormState =
  | { phase: "idle" }
  | { phase: "submitting" }
  | { phase: "success"; email: string }
  | { phase: "error"; message: string };

/**
 * Cloudflare Turnstile widget (loaded via CDN script in layout).
 * Renders the challenge in the container ref and calls onVerify when solved.
 */
function TurnstileWidget({
  siteKey,
  onVerify,
}: {
  siteKey: string;
  onVerify: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    function mount() {
      if (!containerRef.current) return;
      if (
        typeof window === "undefined" ||
        !(window as unknown as Record<string, unknown>).turnstile
      ) {
        return;
      }

      const turnstile = (
        window as unknown as {
          turnstile: {
            render: (
              el: HTMLElement,
              opts: {
                sitekey: string;
                callback: (token: string) => void;
                theme: string;
              }
            ) => string;
            remove: (id: string) => void;
          };
        }
      ).turnstile;

      if (widgetIdRef.current) {
        turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        theme: "dark",
      });
    }

    // Turnstile script may already be loaded or loading
    if (
      (window as unknown as Record<string, unknown>).turnstile
    ) {
      mount();
    } else {
      const script = document.querySelector<HTMLScriptElement>(
        'script[src*="turnstile"]'
      );
      if (script) {
        script.addEventListener("load", mount);
        return () => script.removeEventListener("load", mount);
      }
    }
  }, [siteKey, onVerify]);

  return (
    <div
      ref={containerRef}
      aria-label="Bot protection challenge"
      className="mt-2"
    />
  );
}

export default function AccountDeletePage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [emailError, setEmailError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [state, setState] = useState<FormState>({ phase: "idle" });

  const siteKey =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY ?? "";

  function validateEmail(value: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError("Email address is required.");
      return false;
    }
    if (!re.test(value.trim())) {
      setEmailError("Please enter a valid email address.");
      return false;
    }
    setEmailError("");
    return true;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const emailOk = validateEmail(email);
    if (!confirmed) {
      setConfirmError(
        "You must confirm that you understand account deletion is permanent."
      );
    }
    if (!emailOk || !confirmed) return;
    setConfirmError("");

    if (!turnstileToken) {
      setState({
        phase: "error",
        message:
          "Please complete the bot protection challenge before submitting.",
      });
      return;
    }

    setState({ phase: "submitting" });

    try {
      const res = await fetch("/api/account/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          reason: reason.trim() || null,
          turnstileToken,
        }),
      });

      const data = await res.json().catch(() => ({})) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok) {
        setState({
          phase: "error",
          message:
            (data as { error?: string }).error ||
            "Something went wrong. Please try again or email support@praycalc.com.",
        });
        return;
      }

      trackEvent("account.delete.requested", { source: "web" });
      setState({ phase: "success", email: email.trim() });
    } catch {
      setState({
        phase: "error",
        message:
          "Could not connect. Please try again or email support@praycalc.com.",
      });
    }
  }

  if (state.phase === "success") {
    return (
      <main
        id="main-content"
        className="min-h-screen bg-[#0D2F17]"
        aria-labelledby="page-heading"
      >
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1E5E2F]"
              aria-hidden="true"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C9F27A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1
              id="page-heading"
              className="mb-2 text-2xl font-bold text-[#C9F27A]"
            >
              Request received
            </h1>
            <p className="mb-1 text-white/70">
              We received your deletion request for{" "}
              <strong className="text-white/90">{state.email}</strong>.
            </p>
            <p className="mb-6 text-sm text-white/50">
              Our team reviews each request within 7 business days. You will
              receive a confirmation email once the deletion is complete.
            </p>
            <Link
              href="/"
              className="inline-block rounded-xl bg-[#1E5E2F] px-6 py-3 text-sm font-medium text-[#C9F27A] transition hover:bg-[#79C24C] hover:text-[#0D2F17]"
            >
              Back to PrayCalc
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Turnstile script — injected once, loaded async */}
      <script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
      />

      <main
        id="main-content"
        className="min-h-screen bg-[#0D2F17]"
        aria-labelledby="page-heading"
      >
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          {/* Back link */}
          <Link
            href="/"
            className="mb-8 inline-block text-sm text-white/40 transition hover:text-white/70"
          >
            &larr; Back to PrayCalc
          </Link>

          <h1
            id="page-heading"
            className="mb-2 text-3xl font-bold text-[#C9F27A] sm:text-4xl"
          >
            Delete Your Account
          </h1>
          <p className="mb-8 text-white/60">
            You have the right to delete your PrayCalc account and all
            associated data at any time.
          </p>

          {/* Data disclosure */}
          <section
            className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6"
            aria-label="Data deletion details"
          >
            <h2 className="mb-3 text-lg font-semibold text-[#79C24C]">
              What gets deleted
            </h2>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#79C24C]" aria-hidden="true">
                  •
                </span>
                <span>
                  <strong className="text-white/90">Account profile</strong>{" "}
                  — email address, display name, and login credentials
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#79C24C]" aria-hidden="true">
                  •
                </span>
                <span>
                  <strong className="text-white/90">Saved locations</strong>{" "}
                  — cities and GPS coordinates you have saved for prayer
                  reminders
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#79C24C]" aria-hidden="true">
                  •
                </span>
                <span>
                  <strong className="text-white/90">
                    Prayer schedule preferences
                  </strong>{" "}
                  — calculation method, school of thought, and adhan reminder
                  settings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-[#79C24C]" aria-hidden="true">
                  •
                </span>
                <span>
                  <strong className="text-white/90">IAP receipts</strong>{" "}
                  — in-app purchase and subscription records associated with
                  your account
                </span>
              </li>
            </ul>
            <p className="mt-4 text-sm text-white/50">
              Deletion is permanent and cannot be reversed. Processing takes up
              to 7 business days.
            </p>
          </section>

          {/* Unauthenticated note */}
          <div
            className="mb-8 rounded-xl border border-[#1E5E2F] bg-[#1E5E2F]/30 p-4 text-sm text-white/70"
            role="note"
          >
            <strong className="text-white/90">
              Don&rsquo;t have an account on this device?
            </strong>{" "}
            Email{" "}
            <a
              href="mailto:support@praycalc.com?subject=Account%20Deletion%20Request"
              className="text-[#C9F27A] underline underline-offset-2 hover:text-[#79C24C]"
            >
              support@praycalc.com
            </a>{" "}
            with the subject &ldquo;Account Deletion Request&rdquo; and the
            email address associated with your account. We will process your
            request within 7 business days.
          </div>

          {/* Deletion request form */}
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-label="Account deletion request form"
          >
            <div className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="delete-email"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Email address{" "}
                  <span className="text-red-400" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="delete-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  aria-required="true"
                  aria-describedby={
                    emailError ? "delete-email-error" : undefined
                  }
                  aria-invalid={emailError ? true : undefined}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  onBlur={(e) => validateEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-[#79C24C] focus:ring-2 focus:ring-[#79C24C]/40 aria-[invalid]:border-red-500"
                />
                {emailError && (
                  <p
                    id="delete-email-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-400"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Reason (optional) */}
              <div>
                <label
                  htmlFor="delete-reason"
                  className="mb-1.5 block text-sm font-medium text-white/80"
                >
                  Reason for leaving{" "}
                  <span className="text-white/40">(optional)</span>
                </label>
                <textarea
                  id="delete-reason"
                  name="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Help us improve PrayCalc…"
                  className="w-full resize-none rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition focus:border-[#79C24C] focus:ring-2 focus:ring-[#79C24C]/40"
                />
              </div>

              {/* Confirmation checkbox */}
              <div>
                <div className="flex items-start gap-3">
                  <input
                    id="delete-confirm"
                    type="checkbox"
                    name="confirmed"
                    required
                    aria-required="true"
                    aria-describedby={
                      confirmError ? "delete-confirm-error" : undefined
                    }
                    aria-invalid={confirmError ? true : undefined}
                    checked={confirmed}
                    onChange={(e) => {
                      setConfirmed(e.target.checked);
                      if (confirmError && e.target.checked)
                        setConfirmError("");
                    }}
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-[#79C24C] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]"
                  />
                  <label
                    htmlFor="delete-confirm"
                    className="cursor-pointer text-sm text-white/70 leading-relaxed"
                  >
                    I understand that deleting my account is{" "}
                    <strong className="text-white/90">permanent</strong> and
                    cannot be undone. All my data will be removed from PrayCalc
                    within 7 business days.
                  </label>
                </div>
                {confirmError && (
                  <p
                    id="delete-confirm-error"
                    role="alert"
                    className="mt-1.5 text-sm text-red-400"
                  >
                    {confirmError}
                  </p>
                )}
              </div>

              {/* Turnstile bot protection */}
              {siteKey && (
                <TurnstileWidget
                  siteKey={siteKey}
                  onVerify={setTurnstileToken}
                />
              )}

              {/* API-level error */}
              {state.phase === "error" && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                >
                  {state.message}
                </div>
              )}

              {/* Submit */}
              <button
                aria-label="Submit"
                type="submit"
                disabled={state.phase === "submitting"}
                aria-busy={state.phase === "submitting"}
                className="w-full rounded-xl bg-red-600 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D2F17] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {state.phase === "submitting"
                  ? "Submitting…"
                  : "Request account deletion"}
              </button>
            </div>
          </form>

          {/* Footer links */}
          <div className="mt-16 flex flex-wrap gap-4 text-sm text-white/40">
            <Link
              href="/privacy"
              className="transition hover:text-[#C9F27A]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="transition hover:text-[#C9F27A]"
            >
              Contact Us
            </Link>
            <Link href="/" className="transition hover:text-[#C9F27A]">
              Back to PrayCalc
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
