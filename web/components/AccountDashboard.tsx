"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { PrayCalcSession } from "@/lib/session";
import type { SettingsState, SettingsActions } from "@/hooks/useSettings";

interface Props {
  session: PrayCalcSession;
  settings: SettingsState & SettingsActions;
  onLogout: () => void;
}

// Lock icon for premium features
function LockIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="dashboard-lock-icon"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// Toggle component matching SettingsPanel style
function Toggle({
  on,
  onToggle,
  ariaLabel,
}: {
  on: boolean;
  onToggle: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`hanafi-track${on ? " hanafi-track--on" : ""}`}
    >
      <span className={`hanafi-thumb${on ? " hanafi-thumb--on" : ""}`} />
    </button>
  );
}

// A single premium feature row (locked)
function PremiumItem({
  title,
  description,
  lockLabel,
}: {
  title: string;
  description: string;
  lockLabel: string;
}) {
  return (
    <div className="dashboard-premium-item" aria-disabled="true">
      <div className="dashboard-premium-text">
        <span className="dashboard-premium-title">{title}</span>
        <span className="dashboard-premium-desc">{description}</span>
      </div>
      <span className="dashboard-lock-badge">
        <LockIcon />
        {lockLabel}
      </span>
    </div>
  );
}

export default function AccountDashboard({ session, settings, onLogout }: Props) {
  const t = useTranslations("ui");

  const {
    lightMode,
    hanafi,
    use24h,
    countdown,
    showQiyam,
    toggleLightMode,
    toggleHanafi,
    toggleUse24h,
    toggleCountdown,
    toggleShowQiyam,
  } = settings;

  return (
    <div className="dashboard-page">

      {/* Profile card */}
      <div className="dashboard-profile-card">
        <div className="dashboard-avatar">
          {session.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.photoUrl} alt="" width={48} height={48} />
          ) : (
            <span>{session.initials}</span>
          )}
        </div>
        <div className="dashboard-profile-info">
          <div className="dashboard-display-name">
            {session.displayName}
            {session.isOwner && (
              <span className="dashboard-owner-badge">{t("ownerBadge")}</span>
            )}
          </div>
          <div className="dashboard-email">{session.email}</div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">{t("accountSettings")}</h2>

        <div className="dashboard-settings-row">
          <span className="settings-label">{t("lightMode")}</span>
          <Toggle
            on={lightMode}
            onToggle={toggleLightMode}
            ariaLabel={lightMode ? t("darkMode") : t("lightMode")}
          />
        </div>

        <div className="dashboard-settings-row">
          <span className="settings-label">{t("hanafiAsr")}</span>
          <Toggle on={hanafi} onToggle={toggleHanafi} ariaLabel={t("hanafiAsr")} />
        </div>

        <div className="dashboard-settings-row">
          <span className="settings-label">{t("timeFormat24")}</span>
          <Toggle
            on={use24h}
            onToggle={toggleUse24h}
            ariaLabel={use24h ? t("timeFormat12") : t("timeFormat24")}
          />
        </div>

        <div className="dashboard-settings-row">
          <span className="settings-label">{t("countdown")}</span>
          <Toggle on={countdown} onToggle={toggleCountdown} ariaLabel={t("countdown")} />
        </div>

        <div className="dashboard-settings-row">
          <span className="settings-label">{t("showQiyam")}</span>
          <Toggle on={showQiyam} onToggle={toggleShowQiyam} ariaLabel={t("showQiyam")} />
        </div>
      </div>

      {/* Premium Features */}
      <div className="dashboard-card">
        <h2 className="dashboard-card-title">{t("premiumFeatures")}</h2>

        <PremiumItem
          title={t("tvApp")}
          description={t("tvAppDesc")}
          lockLabel={t("requiresUmmatPlus")}
        />
        <PremiumItem
          title={t("smartHome")}
          description={t("smartHomeDesc")}
          lockLabel={t("requiresUmmatPlus")}
        />
        <PremiumItem
          title={t("widgetEmbed")}
          description={t("widgetEmbedDesc")}
          lockLabel={t("requiresUmmatPlus")}
        />
        <PremiumItem
          title={t("multipleLocations")}
          description={t("multipleLocationsDesc")}
          lockLabel={t("requiresUmmatPlus")}
        />
      </div>

      {/* Ummat+ upsell card */}
      {!session.isUmmatPlus && (
        <div className="dashboard-plus-card">
          <div className="dashboard-plus-header">
            <span className="dashboard-plus-name">{t("ummatPlus")}</span>
            <span className="dashboard-coming-soon-badge">{t("comingSoon")}</span>
          </div>
          <p className="dashboard-plus-tagline">{t("ummatPlusTagline")}</p>
          <div className="dashboard-plus-price">{t("ummatPlusPrice")}</div>
          <button type="button" className="dashboard-plus-btn" disabled>
            {t("comingSoon")}
          </button>
        </div>
      )}

      {/* Sign out */}
      <div className="dashboard-footer">
        <button type="button" className="dashboard-signout-btn" onClick={onLogout}>
          {t("signOut")}
        </button>
        <Link href="/" className="account-back">
          &larr; {t("backHome")}
        </Link>
      </div>

    </div>
  );
}
