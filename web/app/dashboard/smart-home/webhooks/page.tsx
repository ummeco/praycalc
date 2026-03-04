"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import WebhookForm, {
  type WebhookFormData,
} from "@/components/smart-home/WebhookForm";

interface Webhook {
  id: string;
  callbackUrl: string;
  events: string[];
  lat: number;
  lng: number;
  active: boolean;
  createdAt: string;
}

const MAX_WEBHOOKS = 5;

const NAV_ITEMS = [
  { key: "integrations", label: "Smart Home", href: "/dashboard/smart-home" },
  { key: "webhooks", label: "Webhooks", href: "/dashboard/smart-home/webhooks" },
  { key: "devices", label: "Devices", href: "/dashboard/smart-home/devices" },
] as const;

export default function WebhooksPage() {
  const { session, hydrated, isLoggedIn, isUmmatPlus } = useSession();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    ok: boolean;
    message: string;
  } | null>(null);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smart-home/webhooks");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load webhooks");
        return;
      }
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch {
      setError("Could not connect to the smart home service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isUmmatPlus) {
      fetchWebhooks();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, isUmmatPlus, fetchWebhooks]);

  const handleAddWebhook = async (data: WebhookFormData) => {
    const res = await fetch("/api/smart-home/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Failed to add webhook");
    }
    setShowForm(false);
    await fetchWebhooks();
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/smart-home/webhooks?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        await fetchWebhooks();
      }
    } catch {
      // User can retry
    }
  };

  const handleTest = async (webhook: Webhook) => {
    setTesting(webhook.id);
    setTestResult(null);
    try {
      const res = await fetch("/api/smart-home/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", id: webhook.id }),
      });
      const data = await res.json().catch(() => ({}));
      setTestResult({
        id: webhook.id,
        ok: res.ok,
        message: data.message || (res.ok ? "Test sent" : "Test failed"),
      });
    } catch {
      setTestResult({
        id: webhook.id,
        ok: false,
        message: "Could not reach the service.",
      });
    } finally {
      setTesting(null);
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
            Webhook integrations require an Ummat+ subscription.
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
                      item.key === "webhooks"
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
                  item.key === "webhooks"
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
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#C9F27A]">Webhooks</h1>
                <p className="mt-1 text-sm text-gray-400">
                  Receive HTTP callbacks when prayer times occur.{" "}
                  <span className="text-gray-500">
                    {webhooks.length}/{MAX_WEBHOOKS} used
                  </span>
                </p>
              </div>
              {!showForm && webhooks.length < MAX_WEBHOOKS && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="rounded-lg bg-[#79C24C] px-4 py-2 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A]"
                >
                  Add webhook
                </button>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Add form */}
            {showForm && (
              <div className="mb-6">
                <WebhookForm
                  onSubmit={handleAddWebhook}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Webhook list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl border border-[#1E5E2F] bg-[#1E5E2F]/20"
                  />
                ))}
              </div>
            ) : webhooks.length === 0 ? (
              <div className="rounded-xl border border-[#1E5E2F] bg-[#0A2010] p-8 text-center">
                <p className="text-gray-400">No webhooks registered.</p>
                <p className="mt-1 text-sm text-gray-600">
                  Add a webhook to receive HTTP callbacks at prayer times.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((wh) => (
                  <div
                    key={wh.id}
                    className="rounded-xl border border-[#1E5E2F] bg-[#0D2F17]/80 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-sm text-white">
                          {wh.callbackUrl}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {wh.events.map((evt) => (
                            <span
                              key={evt}
                              className="rounded-full bg-[#1E5E2F] px-2 py-0.5 text-xs text-gray-300"
                            >
                              {evt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            wh.active ? "bg-[#79C24C]" : "bg-gray-600"
                          }`}
                        />
                        <span className="text-xs text-gray-500">
                          {wh.active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        {wh.lat.toFixed(4)}, {wh.lng.toFixed(4)}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleTest(wh)}
                          disabled={testing === wh.id}
                          className="rounded px-3 py-1 text-xs text-[#79C24C] transition hover:bg-[#1E5E2F] disabled:opacity-50"
                        >
                          {testing === wh.id ? "Sending..." : "Test"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(wh.id)}
                          className="rounded px-3 py-1 text-xs text-red-400 transition hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {testResult?.id === wh.id && (
                      <p
                        className={`mt-2 text-xs ${
                          testResult.ok ? "text-[#79C24C]" : "text-red-400"
                        }`}
                      >
                        {testResult.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {webhooks.length >= MAX_WEBHOOKS && !showForm && (
              <p className="mt-4 text-center text-xs text-gray-500">
                Maximum {MAX_WEBHOOKS} webhooks reached. Delete one to add
                another.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
