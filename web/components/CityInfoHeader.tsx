"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { MoonPhaseInfo } from "@/lib/moon";
import type { HijriDateInfo } from "@/lib/hijri";

interface Props {
  locationName: string;
  isActiveHomeCity: boolean;
  onToggleHomeCity: () => void;
  displayClock: string;
  weekday: string;
  hijriData: HijriDateInfo;
  gregorianDate: string;
  isAfterMaghrib: boolean;
  moon: MoonPhaseInfo;
}

export default function CityInfoHeader({
  locationName,
  isActiveHomeCity,
  onToggleHomeCity,
  displayClock,
  weekday,
  hijriData,
  gregorianDate,
  isAfterMaghrib,
  moon,
}: Props) {
  const t = useTranslations("ui");
  return (
    <div className="city-info-header">
      <div>
        <div className="city-name-row">
          <h1 className="city-name">{locationName}</h1>
          <button
            type="button"
            className={`city-home-btn${isActiveHomeCity ? " city-home-btn--active" : ""}`}
            onClick={onToggleHomeCity}
            title={isActiveHomeCity ? t("removeHome") : t("setAsHome")}
            aria-label={isActiveHomeCity ? t("removeHome") : t("setAsHome")}
          >
            {isActiveHomeCity ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            )}
          </button>
        </div>
        {displayClock && (
          <p className="city-clock-inline">
            {weekday}
            <span className="city-clock-bullet">•</span>
            <span className="font-mono city-clock-time">{displayClock}</span>
          </p>
        )}
      </div>

      <div className="city-moon-hijri">
        <div className="text-right">
          <p className="city-hijri-date">
            {hijriData.monthName} {hijriData.day}, {hijriData.year}{" "}
            {isAfterMaghrib ? (
              <span
                className="hijri-next-day"
                title="The Islamic day has already advanced at Maghrib"
              >
                +1
              </span>
            ) : (
              <span className="date-era">AH</span>
            )}
          </p>
          <p className="city-gregorian-date">
            {gregorianDate}{" \u00A0"}<span className="date-era">CE</span>
          </p>
        </div>
        <div className="city-moon-circle">
          <Image
            src={moon.imageUrl}
            alt={moon.phaseName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      </div>
    </div>
  );
}
