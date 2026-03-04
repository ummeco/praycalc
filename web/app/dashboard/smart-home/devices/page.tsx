"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import DevicePairCard from "@/components/smart-home/DevicePairCard";

interface Device {
  id: string;
  name: string;
  type: "tv" | "watch" | "desktop" | "other";
  online: boolean;
  lastSeen: string | null;
  pairedAt: string;
}

const DEVICE_ICONS: Record<string, string> = {
  tv: "📺",
  watch: "⌚",
  desktop: "🖥️",
  other: "📱",
};

const NAV_ITEMS = [
  { key: "integrations", label: "Smart Home", href: "/dashboard/smart-home" },
  { key: "webhooks", label: "Webhooks", href: "/dashboard/smart-home/webhooks" },
  { key: "devices", label: "Devices", href: "/dashboard/smart-home/devices" },
] as const;

export default function DevicesPage() {
  const { session, hydrated, isLoggedIn, isUmmatPlus } = useSession();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnpair, setConfirmUnpair] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smart-home/devices");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load devices");
        return;
      }
      const data = await res.json();
      setDevices(data.devices || []);
    } catch {
      setError("Could not connect to the device service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isUmmatPlus) {
      fetchDevices();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, isUmmatPlus, fetchDevices]);

  const handleUnpair = async (id: string) => {
    if (confirmUnpair !== id) {
      setConfirmUnpair(id);
      return;
    }
    try {
      const res = await fetch(`/api/smart-home/devices?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setConfirmUnpair(null);
        await fetchDevices();
      }
    } catch {
      // User can retry
    }
  };

  const formatLastSeen = (ts: string | null): string => {
    if (!ts) return "Never";
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "Unknown";
    }
  };

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-[#0D2F17]" aria-busy="true">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-[#1E5E2F]" />
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#0D2F17] text-white">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="mb-3 text-2xl font-bold text-[#C9F27A]">
            Sign in required
          </h1>
          <Link
            href="/account"
            className="inline-block rounded-xl bg-[#79C24C] px-8 py-3 font-bold text-[#0D2F17]"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!isUmmatPlus) {
    return (
      <main className="min-h-screen bg-[#0D2F17] text-white">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="mb-3 text-2xl font-bold text-[#C9F27A]">
            Ummat+ required
          </h1>
          <p className="mb-8 text-gray-400">
            Device pairing requires an Ummat+ subscription.
          </p>
          <Link
            href="/upgrade"
            className="inline-block rounded-xl bg-[#79C24C] px-8 py-3 font-bold text-[#0D2F17]"
          >
            Upgrade to Ummat+
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D2F17] text-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <Image
              src="/logo.svg"
              alt="PrayCalc"
              width={100}
              height={28}
              unoptimized
            />
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-400">{session?.email}</span>
            <Link
              href="/account"
              className="text-sm text-[#C9F27A] hover:underline"
            >
              Account
            </Link>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar nav */}
          <nav className="hidden w-48 shrink-0 md:block" aria-label="Dashboard">
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-4 py-2 text-sm transition ${
                      item.key === "devices"
                        ? "bg-[#1E5E2F] text-[#C9F27A] font-medium"
                        : "text-gray-400 hover:bg-[#1E5E2F]/50 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile nav */}
          <div className="mb-6 flex gap-2 md:hidden">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  item.key === "devices"
                    ? "bg-[#1E5E2F] text-[#C9F27A]"
                    : "text-gray-400 hover:bg-[#1E5E2F]/50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-2xl font-bold text-[#C9F27A]">Devices</h1>
            <p className="mb-8 text-sm text-gray-400">
              Manage paired devices that display prayer times.
            </p>

            {error && (
              <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl border border-[#1E5E2F] bg-[#1E5E2F]/20"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Device list */}
                {devices.length > 0 && (
                  <div className="mb-6 space-y-3">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="flex items-center gap-4 rounded-xl border border-[#1E5E2F] bg-[#0D2F17]/80 p-4"
                      >
                        <span className="text-2xl">
                          {DEVICE_ICONS[device.type] || DEVICE_ICONS.other}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">
                              {device.name}
                            </p>
                            <span
                              className={`inline-block h-2 w-2 rounded-full ${
                                device.online ? "bg-[#79C24C]" : "bg-gray-600"
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              {device.online ? "Online" : "Offline"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {device.type.charAt(0).toUpperCase() +
                              device.type.slice(1)}{" "}
                            &middot; Last seen: {formatLastSeen(device.lastSeen)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnpair(device.id)}
                          className="rounded-lg border border-red-800/50 px-3 py-1.5 text-xs text-red-400 transition hover:bg-red-900/20"
                        >
                          {confirmUnpair === device.id
                            ? "Confirm unpair"
                            : "Unpair"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {devices.length === 0 && (
                  <div className="mb-6 rounded-xl border border-[#1E5E2F] bg-[#0A2010] p-8 text-center">
                    <p className="text-gray-400">No devices paired yet.</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Generate a pairing code below and enter it on your device.
                    </p>
                  </div>
                )}

                {/* Pair new device */}
                <DevicePairCard onPairComplete={fetchDevices} />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
