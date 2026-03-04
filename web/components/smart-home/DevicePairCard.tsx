"use client";

import { useState } from "react";

interface DevicePairCardProps {
  onPairComplete: () => void;
}

export default function DevicePairCard({ onPairComplete }: DevicePairCardProps) {
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(300); // 5 minutes default

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smart-home/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-code" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to generate pairing code.");
        return;
      }
      const data = await res.json();
      setPairingCode(data.code);
      setExpiresIn(data.expiresIn || 300);

      // Start countdown
      const interval = setInterval(() => {
        setExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setPairingCode(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("Could not connect to the pairing service.");
    } finally {
      setLoading(false);
    }
  };

  const formatCountdown = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (pairingCode) {
    return (
      <div className="rounded-xl border-2 border-dashed border-[#79C24C]/50 bg-[#0A2010] p-6 text-center">
        <p className="mb-2 text-sm text-gray-400">
          Enter this code on your device
        </p>
        <div className="mb-3 font-mono text-4xl font-bold tracking-[0.3em] text-[#C9F27A]">
          {pairingCode}
        </div>
        <p className="mb-4 text-xs text-gray-500">
          Expires in {formatCountdown(expiresIn)}
        </p>
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPairingCode(null);
              onPairComplete();
            }}
            className="rounded-lg bg-[#79C24C] px-4 py-2 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A]"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => setPairingCode(null)}
            className="rounded-lg border border-[#1E5E2F] px-4 py-2 text-sm text-gray-400 transition hover:bg-[#1E5E2F]/50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-dashed border-[#1E5E2F] bg-[#0A2010] p-6 text-center">
      {error && (
        <p className="mb-3 text-sm text-red-400">{error}</p>
      )}
      <p className="mb-3 text-sm text-gray-400">
        Pair a new TV, watch, or desktop app
      </p>
      <button
        type="button"
        onClick={generateCode}
        disabled={loading}
        className="rounded-lg bg-[#79C24C] px-6 py-2.5 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A] disabled:opacity-50"
      >
        {loading ? "Generating..." : "Pair new device"}
      </button>
    </div>
  );
}
