"use client";

/**
 * PlusUpgradeBanner — shown when a user tries to access a Plus-only feature.
 *
 * Rules:
 * - Non-blocking: never prevents free-tier features from rendering.
 * - Dismissable: user can close it; dismissed state stored in sessionStorage
 *   so it does not reappear during the same visit.
 * - No hardcoded upgrade URL: uses the /account/activate route which handles
 *   both anonymous sign-up and signed-in subscribe flows.
 * - Anonymous-friendly: shown to anonymous users too (they can sign up + subscribe).
 */

import { useState, useEffect } from "react";

interface Props {
  /** Human-readable name of the feature the user tried to access. */
  featureLabel: string;
  /** Called when the user explicitly dismisses the banner. */
  onDismiss?: () => void;
  /** Override the upgrade CTA URL. Defaults to /account/activate. */
  upgradeHref?: string;
}

const DISMISS_KEY_PREFIX = "pc-plus-banner-dismissed-";

export default function PlusUpgradeBanner({
  featureLabel,
  onDismiss,
  upgradeHref = "/account/activate",
}: Props) {
  const dismissKey = `${DISMISS_KEY_PREFIX}${featureLabel.replace(/\s+/g, "-").toLowerCase()}`;
  const [visible, setVisible] = useState(false);

  // Read dismiss state from sessionStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem(dismissKey);
      if (!dismissed) setVisible(true);
    } catch {
      // sessionStorage unavailable (private mode) — show banner anyway.
      setVisible(true);
    }
  }, [dismissKey]);

  function handleDismiss() {
    try {
      sessionStorage.setItem(dismissKey, "1");
    } catch {
      // ignore
    }
    setVisible(false);
    onDismiss?.();
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Ummat+ upgrade prompt"
      className="plus-banner"
      data-testid="plus-upgrade-banner"
    >
      <div className="plus-banner__body">
        <span className="plus-banner__icon" aria-hidden="true">
          {/* Simple star icon — no external dependency */}
          <svg viewBox="0 0 20 20" fill="currentColor" width={18} height={18}>
            <path d="M10 1.5l2.3 4.7 5.2.75-3.75 3.65.89 5.17L10 13.35l-4.66 2.44.89-5.17L2.5 6.95l5.2-.75L10 1.5z" />
          </svg>
        </span>
        <p className="plus-banner__text">
          <strong>{featureLabel}</strong> is an Ummat+ feature.{" "}
          Upgrade to unlock it — core prayer times are always free.
        </p>
      </div>
      <div className="plus-banner__actions">
        <a
          href={upgradeHref}
          className="plus-banner__cta"
          aria-label={`Upgrade to Ummat+ to unlock ${featureLabel}`}
        >
          Upgrade
        </a>
        <button
          type="button"
          className="plus-banner__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss upgrade prompt"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
