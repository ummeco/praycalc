"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "@/hooks/useSession";
import IntegrationCard from "@/components/smart-home/IntegrationCard";

type NavItem = "integrations" | "webhooks" | "devices";

interface Integration {
  platform: string;
  connected: boolean;
  lastSynced: string | null;
}

const NAV_ITEMS: { key: NavItem; label: string; href: string }[] = [
  { key: "integrations", label: "Smart Home", href: "/dashboard/smart-home" },
  { key: "webhooks", label: "Webhooks", href: "/dashboard/smart-home/webhooks" },
  { key: "devices", label: "Devices", href: "/dashboard/smart-home/devices" },
];

export default function SmartHomePage() {
  const { session, hydrated, isLoggedIn, isUmmatPlus } = useSession();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/smart-home/integrations");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to load integrations");
        return;
      }
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch {
      setError("Could not connect to the smart home service.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && isUmmatPlus) {
      fetchIntegrations();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, isUmmatPlus, fetchIntegrations]);

  const handleUnlink = async (platform: string) => {
    try {
      const res = await fetch("/api/smart-home/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlink", platform }),
      });
      if (res.ok) {
        await fetchIntegrations();
      }
    } catch {
      // Silently fail, user can retry
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

  // Auth gate
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#0D2F17] text-white">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mb-6 text-6xl">🔒</div>
          <h1 className="mb-3 text-2xl font-bold text-[#C9F27A]">
            Sign in required
          </h1>
          <p className="mb-8 text-gray-400">
            Sign in to your PrayCalc account to manage smart home integrations.
          </p>
          <Link
            href="/account"
            className="inline-block rounded-xl bg-[#79C24C] px-8 py-3 font-bold text-[#0D2F17] transition hover:bg-[#C9F27A]"
          >
            Sign in
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Subscription gate
  if (!isUmmatPlus) {
    return (
      <main className="min-h-screen bg-[#0D2F17] text-white">
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="mb-6 text-6xl">✨</div>
          <h1 className="mb-3 text-2xl font-bold text-[#C9F27A]">
            Ummat+ required
          </h1>
          <p className="mb-8 text-gray-400">
            Smart home integrations are available with an Ummat+ subscription.
            Connect Google Home, Alexa, Siri, and more.
          </p>
          <Link
            href="/upgrade"
            className="inline-block rounded-xl bg-[#79C24C] px-8 py-3 font-bold text-[#0D2F17] transition hover:bg-[#C9F27A]"
          >
            Upgrade to Ummat+
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Find integration status for each platform
  const getIntegration = (platform: string): Integration | undefined =>
    integrations.find((i) => i.platform === platform);

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
                      item.key === "integrations"
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
                  item.key === "integrations"
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
            <h1 className="mb-2 text-2xl font-bold text-[#C9F27A]">
              Smart Home
            </h1>
            <p className="mb-8 text-sm text-gray-400">
              Connect your smart home platforms to hear prayer times through your
              devices.
            </p>

            {error && (
              <div className="mb-6 rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl border border-[#1E5E2F] bg-[#1E5E2F]/20"
                  />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <IntegrationCard
                  platform="google-home"
                  name="Google Home"
                  icon={<GoogleHomeIcon />}
                  connected={getIntegration("google-home")?.connected ?? false}
                  lastSynced={getIntegration("google-home")?.lastSynced ?? null}
                  linkType="oauth"
                  linkUrl="/oauth/authorize?client_id=google-home&redirect_uri=https://oauth-redirect.googleusercontent.com/r/praycalc&response_type=code"
                  onUnlink={() => handleUnlink("google-home")}
                />
                <IntegrationCard
                  platform="alexa"
                  name="Amazon Alexa"
                  icon={<AlexaIcon />}
                  connected={getIntegration("alexa")?.connected ?? false}
                  lastSynced={getIntegration("alexa")?.lastSynced ?? null}
                  linkType="oauth"
                  linkUrl="/oauth/authorize?client_id=alexa&redirect_uri=https://pitangui.amazon.com/api/skill/link&response_type=code"
                  onUnlink={() => handleUnlink("alexa")}
                />
                <IntegrationCard
                  platform="siri"
                  name="Siri Shortcuts"
                  icon={<SiriIcon />}
                  connected={getIntegration("siri")?.connected ?? false}
                  lastSynced={getIntegration("siri")?.lastSynced ?? null}
                  linkType="instructions"
                  instructions={[
                    "Open the Shortcuts app on your iPhone or iPad.",
                    'Tap the "+" to create a new shortcut.',
                    'Add a "Get Contents of URL" action.',
                    "Set the URL to: https://praycalc.com/api/prayers?lat=YOUR_LAT&lng=YOUR_LNG",
                    'Add a "Speak Text" action for the result.',
                    'Say "Hey Siri, prayer times" to trigger it.',
                  ]}
                  onUnlink={() => handleUnlink("siri")}
                />
                <IntegrationCard
                  platform="home-assistant"
                  name="Home Assistant"
                  icon={<HomeAssistantIcon />}
                  connected={
                    getIntegration("home-assistant")?.connected ?? false
                  }
                  lastSynced={
                    getIntegration("home-assistant")?.lastSynced ?? null
                  }
                  linkType="instructions"
                  instructions={[
                    "Add a REST sensor in your configuration.yaml:",
                    'resource: "https://praycalc.com/api/prayers?lat=YOUR_LAT&lng=YOUR_LNG&tz=YOUR_TZ&from=TODAY&to=TODAY"',
                    "Set scan_interval to 3600 (1 hour).",
                    "Use template sensors to extract individual prayer times.",
                    "Set up automations to trigger at each prayer time.",
                  ]}
                  apiKey="Generate an API key from your account settings."
                  onUnlink={() => handleUnlink("home-assistant")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Platform icons as inline SVGs

function GoogleHomeIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#4285F4" />
      <circle cx="12" cy="10" r="4" fill="white" />
      <rect x="10" y="14" width="4" height="6" rx="1" fill="white" />
    </svg>
  );
}

function AlexaIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#00CAFF" />
      <circle cx="12" cy="12" r="4" fill="white" />
      <circle cx="12" cy="12" r="2" fill="#00CAFF" />
    </svg>
  );
}

function SiriIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="siri-grad" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="50%" stopColor="#C45AFF" />
          <stop offset="100%" stopColor="#6B73FF" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#siri-grad)" />
      <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.9" />
    </svg>
  );
}

function HomeAssistantIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="#41BDF5" />
      <path
        d="M12 4L4 10v8h5v-5h6v5h5v-8L12 4z"
        fill="white"
      />
    </svg>
  );
}
