"use client";

import { useTranslations } from "next-intl";
import { PRAYER_META, type PrayerResult } from "@/lib/prayer-utils";

interface Props {
  arrivedPrayer: keyof PrayerResult;
  adhanPlaying: boolean;
  onStop: () => void;
  onClose: () => void;
}

export default function PrayerArrivalOverlay({
  arrivedPrayer,
  adhanPlaying,
  onStop,
  onClose,
}: Props) {
  const t = useTranslations("ui");
  return (
    <div className="prayer-arrival-overlay" onClick={onClose}>
      <div
        className="prayer-arrival-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="prayer-arrival-glow" />
        <p className="prayer-arrival-label">{t("prayerTime")}</p>
        <p className="prayer-arrival-arabic arabic">
          {PRAYER_META[arrivedPrayer].ar}
        </p>
        <p className="prayer-arrival-name">{PRAYER_META[arrivedPrayer].en}</p>
        <div className="prayer-arrival-divider" />
        <div className="prayer-arrival-actions">
          {adhanPlaying && (
            <button
              type="button"
              className="prayer-arrival-stop-btn"
              onClick={onStop}
            >
              {t("stopAdhan")}
            </button>
          )}
          <button
            type="button"
            className="prayer-arrival-close-btn"
            onClick={onClose}
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
