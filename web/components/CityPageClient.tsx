"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import LocationSearch from "./LocationSearch";
import CityInfoHeader from "./CityInfoHeader";
import PrayerGrid from "./PrayerGrid";
import FeatureTiles from "./FeatureTiles";
import PrayerArrivalOverlay from "./PrayerArrivalOverlay";
import AdhanToast from "./AdhanToast";
import OnboardingTooltip from "./OnboardingTooltip";
import SettingsGear from "./SettingsGear";
import { DISPLAY_PRAYERS, type PrayerResult } from "@/lib/prayer-utils";
import { qiblaAngle, compassDir } from "@/lib/qibla";
import { useSettings } from "@/hooks/useSettings";
import { useSession } from "@/hooks/useSession";
import { useAdhan } from "@/hooks/useAdhan";
import { useClock } from "@/hooks/useClock";
import { recordLastCity } from "./LastVisited";

const QiblaModal = dynamic(() => import("./QiblaModal"), { ssr: false });
const PrayerCalendarModal = dynamic(() => import("./PrayerCalendarModal"), { ssr: false });

interface Props {
  shafiPrayers: PrayerResult;
  hanafiPrayers: PrayerResult;
  locationName: string;
  timezone: string;
  slug: string;
  lat: number;
  lng: number;
}

export default function CityPageClient({
  shafiPrayers,
  hanafiPrayers,
  locationName,
  timezone,
  slug,
  lat,
  lng,
}: Props) {
  // ── Router ───────────────────────────────────────────────────────────────
  const router = useRouter();

  // ── Session ───────────────────────────────────────────────────────────────
  const { session, isLoggedIn, logout } = useSession();

  // ── Settings ─────────────────────────────────────────────────────────────
  const settings = useSettings();
  const {
    hanafi,
    use24h,
    soundMode,
    adhanVoice,
    countdown,
    showQiyam,
    homeMode,
    homeCity,
    toggleHanafi,
    toggleUse24h,
    toggleLightMode,
    toggleCountdown,
    toggleShowQiyam,
    setSoundModeAndSave,
    setAdhanVoiceAndSave,
    setHomeModeAndSave,
    clearHome,
    setHomeCityAndSave,
  } = settings;

  // ── Record last-visited city ──────────────────────────────────────────────
  useEffect(() => {
    recordLastCity(slug, locationName);
  }, [slug, locationName]);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [mutedPrayers, setMutedPrayers] = useState<Set<string>>(new Set());
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [monthlyOpen, setMonthlyOpen] = useState(false);
  const [yearlyOpen, setYearlyOpen] = useState(false);
  const [toastPrayer, setToastPrayer] = useState<keyof PrayerResult | null>(null);

  // ── Adhan / arrival overlay ──────────────────────────────────────────────
  const adhan = useAdhan({ soundMode, adhanVoice, mutedPrayers });

  // ── Derived state ─────────────────────────────────────────────────────────
  const prayers = hanafi ? hanafiPrayers : shafiPrayers;

  const displayList: Array<keyof PrayerResult> = showQiyam
    ? ["Qiyam", ...DISPLAY_PRAYERS]
    : DISPLAY_PRAYERS;

  // ── Prayer arrival: trigger overlay + toast ─────────────────────────────
  const triggerRef = useRef(adhan.triggerArrival);
  triggerRef.current = adhan.triggerArrival;

  const handlePrayerArrival = useCallback((arrived: keyof PrayerResult) => {
    triggerRef.current(arrived);
    setToastPrayer(arrived);
  }, []);

  // ── Clock / prayer detection ──────────────────────────────────────────────
  const clock = useClock({
    prayers,
    timezone,
    displayList,
    onPrayerArrival: handlePrayerArrival,
  });

  const {
    currentTime,
    countdownStr,
    nextPrayer,
    isAfterMaghrib,
    weekday,
    gregorianDate,
    moon,
    hijriData,
  } = clock;

  // ── Qibla ─────────────────────────────────────────────────────────────────
  const qiblaBearing = qiblaAngle(lat, lng);
  const qiblaDir = compassDir(qiblaBearing);
  const qiblaBearingRounded = Math.round(qiblaBearing * 10) / 10;

  // ── Derived display values ────────────────────────────────────────────────
  const nextIdx = displayList.indexOf(nextPrayer);
  const currentPrayer =
    displayList[(nextIdx - 1 + displayList.length) % displayList.length];

  const displayClock = (() => {
    if (!currentTime) return "";
    if (use24h) return currentTime;
    const [hh, mm, ss] = currentTime.split(":");
    const h = parseInt(hh, 10);
    const period = h >= 12 ? "pm" : "am";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${mm}:${ss} ${period}`;
  })();

  const notificationsOff = soundMode === "none";

  // ── Home city helpers ─────────────────────────────────────────────────────
  const isActiveHomeCity = homeCity?.slug === slug && homeMode === "city";

  function handleToggleHomeCity() {
    if (isActiveHomeCity) {
      clearHome();
    } else {
      setHomeCityAndSave({ slug, name: locationName });
      setHomeModeAndSave("city");
    }
  }

  // ── Mute helpers ──────────────────────────────────────────────────────────
  function toggleMute(key: string) {
    setMutedPrayers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // ── Settings panel home city callbacks ───────────────────────────────────
  const handleSetHomeCityThisCity = useCallback(() => {
    setHomeCityAndSave({ slug, name: locationName });
    setHomeModeAndSave("city");
  }, [slug, locationName, setHomeCityAndSave, setHomeModeAndSave]);

  const handleSwitchHomeModeToCity = useCallback(() => {
    setHomeModeAndSave("city");
  }, [setHomeModeAndSave]);

  return (
    <>
      {/* Prayer arrival overlay */}
      {adhan.arrivedPrayer && (
        <PrayerArrivalOverlay
          arrivedPrayer={adhan.arrivedPrayer}
          adhanPlaying={adhan.adhanPlaying}
          onStop={adhan.stopAdhan}
          onClose={adhan.handleOverlayClose}
        />
      )}

      {/* Adhan toast — top-right slide-in */}
      {toastPrayer && (
        <AdhanToast
          prayer={toastPrayer}
          time={prayers[toastPrayer] ?? ""}
          onClose={() => setToastPrayer(null)}
        />
      )}

      {/* Top bar: logo + search + gear */}
      <div className="city-page-header">
        <div className="shrink-0">
          {/* ?from=logo tells HomeRedirect to skip auto-redirect */}
          <Link href="/?from=logo" aria-label="PrayCalc home">
            <Image
              src="/logo.svg"
              alt="PrayCalc"
              width={140}
              height={64}
              priority
              unoptimized
              className="city-page-logo"
            />
          </Link>
        </div>

        <div className="city-page-header-right">
          <div className="flex-1 min-w-0">
            <LocationSearch compact />
          </div>

          <OnboardingTooltip
            storageKey="praycalc-tooltip-adhan-seen"
            requireKey="praycalc-tooltip-home-seen"
            delay={10000}
            timeout={8000}
            text="Get adhan reminders at prayer time — tap here to enable."
            arrow="up"
          >
            <SettingsGear
              lightMode={settings.lightMode}
              hanafi={hanafi}
              use24h={use24h}
              countdown={countdown}
              showQiyam={showQiyam}
              onToggleLightMode={toggleLightMode}
              onToggleHanafi={toggleHanafi}
              onToggleUse24h={toggleUse24h}
              onToggleCountdown={toggleCountdown}
              onToggleShowQiyam={toggleShowQiyam}
              soundMode={soundMode}
              adhanVoice={adhanVoice}
              onSetSoundMode={setSoundModeAndSave}
              onSetAdhanVoice={setAdhanVoiceAndSave}
              homeMode={homeMode}
              homeCity={homeCity}
              locationName={locationName}
              onSetHomeMode={setHomeModeAndSave}
              onClearHome={clearHome}
              onSetHomeCityThisCity={handleSetHomeCityThisCity}
              onSwitchHomeModeToCity={handleSwitchHomeModeToCity}
              isLoggedIn={isLoggedIn}
              userName={session?.displayName}
              userInitials={session?.initials}
              userPhotoUrl={session?.photoUrl}
              onLogin={() => router.push("/account")}
              onLogout={logout}
            />
          </OnboardingTooltip>
        </div>
      </div>

      {/* Prayer times content */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <CityInfoHeader
          locationName={locationName}
          isActiveHomeCity={isActiveHomeCity}
          onToggleHomeCity={handleToggleHomeCity}
          displayClock={displayClock}
          weekday={weekday}
          hijriData={hijriData}
          gregorianDate={gregorianDate}
          isAfterMaghrib={isAfterMaghrib}
          moon={moon}
        />

        <PrayerGrid
          prayers={prayers}
          displayList={displayList}
          nextPrayer={nextPrayer}
          currentPrayer={currentPrayer}
          use24h={use24h}
          countdown={countdown}
          countdownStr={countdownStr}
          notificationsOff={notificationsOff}
          mutedPrayers={mutedPrayers}
          onToggleMute={toggleMute}
        />

        <FeatureTiles
          qiblaBearingRounded={qiblaBearingRounded}
          qiblaDir={qiblaDir}
          onMonthlyOpen={() => setMonthlyOpen(true)}
          onYearlyOpen={() => setYearlyOpen(true)}
          onQiblaOpen={() => setQiblaOpen(true)}
        />
      </div>

      {/* Qibla modal */}
      {qiblaOpen && (
        <QiblaModal
          cityLat={lat}
          cityLng={lng}
          cityName={locationName}
          onClose={() => setQiblaOpen(false)}
        />
      )}

      {/* Monthly prayer times modal */}
      {monthlyOpen && (
        <PrayerCalendarModal
          mode="monthly"
          lat={lat}
          lng={lng}
          tz={timezone}
          locationName={locationName}
          hanafi={hanafi}
          use24h={use24h}
          onClose={() => setMonthlyOpen(false)}
        />
      )}

      {/* Yearly prayer calendar modal */}
      {yearlyOpen && (
        <PrayerCalendarModal
          mode="yearly"
          lat={lat}
          lng={lng}
          tz={timezone}
          locationName={locationName}
          hanafi={hanafi}
          use24h={use24h}
          onClose={() => setYearlyOpen(false)}
        />
      )}
    </>
  );
}
