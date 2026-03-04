"use client";

import { useState } from "react";

const features = [
  { name: "Prayer times (web + mobile)", free: true, plus: true },
  { name: "Qibla direction", free: true, plus: true },
  { name: "Prayer calendar + PDF export", free: true, plus: true },
  { name: "Adhan notifications", free: true, plus: true },
  { name: "TV display mode", free: true, plus: true },
  { name: "Voice queries (Google/Alexa/Siri)", free: "5/day", plus: "Unlimited" },
  { name: "Smart home automations", free: false, plus: true },
  { name: "Webhook integrations", free: false, plus: true },
  { name: "Cross-device sync", free: false, plus: true },
  { name: "Watch app + complications", free: false, plus: true },
  { name: "Desktop menubar app", free: false, plus: true },
  { name: "Priority support", free: false, plus: true },
];

export default function UpgradePage() {
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not start checkout. Please try again later.");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Checkout is not available yet. Please try again later.");
      }
    } catch {
      setError("Could not connect to billing service. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D2F17] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-center text-4xl font-bold text-[#C9F27A]">
          Ummat+
        </h1>
        <p className="mb-12 text-center text-lg text-gray-300">
          Unlock the full PrayCalc experience across all your devices.
        </p>

        {/* Pricing card */}
        <div className="mx-auto mb-12 max-w-sm rounded-2xl border border-[#1E5E2F] bg-[#0D2F17]/80 p-8 text-center shadow-xl">
          <div className="mb-1 text-5xl font-bold text-[#C9F27A]">$9.99</div>
          <div className="mb-6 text-gray-400">per year</div>
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full rounded-xl bg-[#79C24C] px-6 py-4 text-lg font-bold text-[#0D2F17] transition hover:bg-[#C9F27A] disabled:opacity-50"
          >
            {loading ? "Loading..." : "Subscribe to Ummat+"}
          </button>
          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
          <p className="mt-3 text-xs text-gray-500">
            Cancel anytime. 7-day free trial included.
          </p>
        </div>

        {/* Feature comparison */}
        <h2 className="mb-6 text-center text-2xl font-semibold">
          What you get
        </h2>
        <div className="overflow-hidden rounded-xl border border-[#1E5E2F]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1E5E2F] bg-[#1E5E2F]/30">
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 text-center font-medium">Free</th>
                <th className="px-4 py-3 text-center font-medium text-[#C9F27A]">
                  Ummat+
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr
                  key={f.name}
                  className="border-b border-[#1E5E2F]/50 last:border-0"
                >
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3 text-center">
                    {renderCell(f.free)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {renderCell(f.plus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer links */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <a href="/privacy" className="underline hover:text-gray-300">
            Privacy Policy
          </a>
          {" · "}
          <a href="/terms" className="underline hover:text-gray-300">
            Terms of Service
          </a>
          {" · "}
          <a
            href="mailto:support@praycalc.com"
            className="underline hover:text-gray-300"
          >
            Contact Support
          </a>
        </div>
      </div>
    </main>
  );
}

function renderCell(value: boolean | string) {
  if (value === true) return <span className="text-[#79C24C]">&#10003;</span>;
  if (value === false) return <span className="text-gray-600">&mdash;</span>;
  return <span className="text-gray-300">{value}</span>;
}
