"use client";

import { useState } from "react";

interface IntegrationCardProps {
  platform: string;
  name: string;
  icon: React.ReactNode;
  connected: boolean;
  lastSynced: string | null;
  linkType: "oauth" | "instructions";
  linkUrl?: string;
  instructions?: string[];
  apiKey?: string;
  onUnlink: () => void | Promise<void>;
}

export default function IntegrationCard({
  platform,
  name,
  icon,
  connected,
  lastSynced,
  linkType,
  linkUrl,
  instructions,
  apiKey,
  onUnlink,
}: IntegrationCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const handleUnlink = async () => {
    if (!confirmUnlink) {
      setConfirmUnlink(true);
      return;
    }
    setUnlinking(true);
    try {
      await onUnlink();
    } finally {
      setUnlinking(false);
      setConfirmUnlink(false);
    }
  };

  const formatLastSynced = (ts: string | null): string => {
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

  return (
    <div
      className="rounded-xl border border-[#1E5E2F] bg-[#0D2F17]/80 p-5 transition hover:border-[#1E5E2F]/80"
      data-platform={platform}
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{name}</h3>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                connected ? "bg-[#79C24C]" : "bg-gray-600"
              }`}
            />
            <span className={connected ? "text-[#79C24C]" : "text-gray-500"}>
              {connected ? "Connected" : "Not connected"}
            </span>
          </div>
        </div>
      </div>

      {/* Last synced */}
      {connected && (
        <p className="mb-4 text-xs text-gray-500">
          Last synced: {formatLastSynced(lastSynced)}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!connected && linkType === "oauth" && linkUrl && (
          <a
            href={linkUrl}
            className="rounded-lg bg-[#79C24C] px-4 py-2 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A]"
          >
            Link account
          </a>
        )}
        {!connected && linkType === "instructions" && (
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="rounded-lg bg-[#79C24C] px-4 py-2 text-sm font-medium text-[#0D2F17] transition hover:bg-[#C9F27A]"
          >
            {showInstructions ? "Hide guide" : "Setup guide"}
          </button>
        )}
        {connected && (
          <button
            type="button"
            onClick={handleUnlink}
            disabled={unlinking}
            className="rounded-lg border border-red-800/50 px-4 py-2 text-sm text-red-400 transition hover:bg-red-900/20 disabled:opacity-50"
          >
            {unlinking
              ? "Unlinking..."
              : confirmUnlink
                ? "Confirm unlink"
                : "Unlink"}
          </button>
        )}
      </div>

      {/* Instructions modal */}
      {showInstructions && instructions && (
        <div className="mt-4 rounded-lg border border-[#1E5E2F] bg-[#0A2010] p-4">
          <h4 className="mb-3 text-sm font-medium text-[#C9F27A]">
            Setup instructions
          </h4>
          <ol className="space-y-2 text-sm text-gray-300">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="shrink-0 text-[#79C24C]">{i + 1}.</span>
                <span className="font-mono text-xs leading-relaxed">
                  {step}
                </span>
              </li>
            ))}
          </ol>
          {apiKey && (
            <p className="mt-3 text-xs text-gray-500">
              API key: {apiKey}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
