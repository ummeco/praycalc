"use client";

import { useTranslations } from "next-intl";
import type { AdhanVoice, HomeMode } from "@/lib/settings";
import type { SoundMode } from "@/hooks/useSettings";

interface Props {
  // Display toggles
  lightMode: boolean;
  hanafi: boolean;
  use24h: boolean;
  countdown: boolean;
  showQiyam: boolean;
  onToggleLightMode: () => void;
  onToggleHanafi: () => void;
  onToggleUse24h: () => void;
  onToggleCountdown: () => void;
  onToggleShowQiyam: () => void;

  // Sound
  soundMode: SoundMode;
  adhanVoice: AdhanVoice;
  onSetSoundMode: (mode: SoundMode) => void;
  onSetAdhanVoice: (voice: AdhanVoice) => void;

  // Home city
  homeMode: HomeMode;
  homeCity: { slug: string; name: string } | null;
  locationName: string;
  onSetHomeMode: (mode: HomeMode) => void;
  onClearHome: () => void;
  onSetHomeCityThisCity: () => void;
  onSwitchHomeModeToCity: () => void;

  // Auth
  isLoggedIn?: boolean;
  userName?: string;
  userInitials?: string;
  userPhotoUrl?: string;
  onLogin: () => void;
  onLogout?: () => void;
}

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

export default function SettingsPanel({
  lightMode,
  hanafi,
  use24h,
  countdown,
  showQiyam,
  onToggleLightMode,
  onToggleHanafi,
  onToggleUse24h,
  onToggleCountdown,
  onToggleShowQiyam,
  soundMode,
  adhanVoice,
  onSetSoundMode,
  onSetAdhanVoice,
  homeMode,
  homeCity,
  locationName,
  onSetHomeMode,
  onClearHome,
  onSetHomeCityThisCity,
  onSwitchHomeModeToCity,
  isLoggedIn = false,
  userName,
  userInitials,
  userPhotoUrl,
  onLogin,
  onLogout,
}: Props) {
  const t = useTranslations("ui");

  return (
    <div className="settings-panel">

      {/* Auth — top of panel */}
      {isLoggedIn ? (
        <div className="settings-auth-signed-in">
          <button type="button" className="settings-auth-btn settings-auth-btn--account" onClick={onLogin}>
            <div className="settings-auth-avatar">
              {userPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userPhotoUrl} alt="" width={20} height={20} />
              ) : (
                <span>{userInitials ?? "?"}</span>
              )}
            </div>
            {userName ?? t("myAccount")}
          </button>
          <button type="button" className="settings-signout-link" onClick={onLogout}>
            {t("signOut")}
          </button>
        </div>
      ) : (
        <button type="button" className="settings-auth-btn" onClick={onLogin}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {t("signIn")}
        </button>
      )}

      <div className="settings-divider" />

      {/* Display toggles — hidden when signed in (managed in Account dashboard) */}
      {!isLoggedIn && (
        <>
          <div className="settings-row">
            <span className="settings-label" id="toggle-light-label">{t("lightMode")}</span>
            <Toggle
              on={lightMode}
              onToggle={onToggleLightMode}
              ariaLabel={lightMode ? t("darkMode") : t("lightMode")}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label" id="toggle-hanafi-label">{t("hanafiAsr")}</span>
            <Toggle
              on={hanafi}
              onToggle={onToggleHanafi}
              ariaLabel={t("hanafiAsr")}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label" id="toggle-24h-label">{t("timeFormat24")}</span>
            <Toggle
              on={use24h}
              onToggle={onToggleUse24h}
              ariaLabel={use24h ? t("timeFormat12") : t("timeFormat24")}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label" id="toggle-countdown-label">{t("countdown")}</span>
            <Toggle
              on={countdown}
              onToggle={onToggleCountdown}
              ariaLabel={t("countdown")}
            />
          </div>

          <div className="settings-row">
            <span className="settings-label" id="toggle-qiyam-label">{t("showQiyam")}</span>
            <Toggle
              on={showQiyam}
              onToggle={onToggleShowQiyam}
              ariaLabel={t("showQiyam")}
            />
          </div>
        </>
      )}

      {/* When signed in, link to account instead */}
      {isLoggedIn && (
        <div className="settings-row settings-row--manage">
          <span className="settings-label">{t("accountSettings")}</span>
          <button
            type="button"
            className="settings-manage-link"
            onClick={onLogin}
          >
            {t("manageInAccount")}
          </button>
        </div>
      )}

      {/* Notification */}
      <p className="settings-panel-title settings-panel-section">{t("notification")}</p>
      <div className="settings-sound-opts" role="group" aria-label={t("notification")}>
        {(["none", "beep", "adhan"] as SoundMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSetSoundMode(mode)}
            aria-pressed={soundMode === mode}
            className={`settings-sound-opt${soundMode === mode ? " settings-sound-opt--on" : ""}`}
          >
            {mode === "none" ? t("soundNone") : mode === "beep" ? t("soundBeep") : t("adhan")}
          </button>
        ))}
      </div>

      {/* Adhan voice picker — only when adhan mode is active */}
      {soundMode === "adhan" && (
        <div className="settings-sound-opts" role="group" aria-label={t("adhan")}>
          {(
            [
              { id: "makkah" as AdhanVoice, key: "voiceMakkah" as const },
              { id: "mishari" as AdhanVoice, key: "voiceMishari" as const },
              { id: "pashaii" as AdhanVoice, key: "voicePashaii" as const },
            ] as const
          ).map(({ id, key }) => (
            <button
              key={id}
              type="button"
              onClick={() => onSetAdhanVoice(id)}
              aria-pressed={adhanVoice === id}
              className={`settings-sound-opt${adhanVoice === id ? " settings-sound-opt--on" : ""}`}
            >
              {t(key)}
            </button>
          ))}
        </div>
      )}

      {/* Home City */}
      <p className="settings-panel-title settings-panel-section">{t("homeCity")}</p>
      <div className="settings-nav-opts">
        {homeMode === "none" ? (
          <>
            <button
              type="button"
              className="settings-nav-opt settings-nav-opt--on"
              aria-pressed="true"
            >
              {t("homeNone")}
            </button>
            <button
              type="button"
              className="settings-nav-opt"
              onClick={() => onSetHomeMode("location")}
              aria-pressed="false"
            >
              {t("homeLocation")}
            </button>
          </>
        ) : homeMode === "city" ? (
          <>
            <button
              type="button"
              className="settings-nav-opt settings-nav-opt--on"
              title={homeCity?.name}
              aria-pressed="true"
            >
              {homeCity?.name ?? locationName}
            </button>
            <button
              type="button"
              className="settings-nav-opt"
              onClick={() => onSetHomeMode("location")}
              aria-pressed="false"
            >
              {t("homeLocation")}
            </button>
            <button
              type="button"
              className="settings-nav-clear"
              title={t("homeCity")}
              aria-label={t("homeCity")}
              onClick={onClearHome}
            >
              ×
            </button>
          </>
        ) : (
          /* homeMode === "location" */
          <>
            {homeCity ? (
              <button
                type="button"
                className="settings-nav-opt"
                title={homeCity.name}
                onClick={onSwitchHomeModeToCity}
                aria-pressed="false"
              >
                {homeCity.name}
              </button>
            ) : (
              <button
                type="button"
                className="settings-nav-opt"
                onClick={onSetHomeCityThisCity}
                aria-pressed="false"
              >
                {t("homeThisCity")}
              </button>
            )}
            <button
              type="button"
              className="settings-nav-opt settings-nav-opt--on"
              aria-pressed="true"
            >
              {t("homeLocation")}
            </button>
            <button
              type="button"
              className="settings-nav-clear"
              title={t("homeCity")}
              aria-label={t("homeCity")}
              onClick={onClearHome}
            >
              ×
            </button>
          </>
        )}
      </div>

    </div>
  );
}
