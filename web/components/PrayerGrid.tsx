"use client";

import { useTranslations } from "next-intl";
import { fmtTime, PRAYER_META, type PrayerResult } from "@/lib/prayer-utils";

interface Props {
  prayers: PrayerResult;
  displayList: Array<keyof PrayerResult>;
  nextPrayer: keyof PrayerResult;
  currentPrayer: keyof PrayerResult;
  use24h: boolean;
  countdown: boolean;
  countdownStr: string;
  notificationsOff: boolean;
  mutedPrayers: Set<string>;
  onToggleMute: (key: string) => void;
}

export default function PrayerGrid({
  prayers,
  displayList,
  nextPrayer,
  currentPrayer,
  use24h,
  countdown,
  countdownStr,
  notificationsOff,
  mutedPrayers,
  onToggleMute,
}: Props) {
  const tPrayers = useTranslations("prayers");
  const tUi = useTranslations("ui");

  return (
    <div
      className="prayer-grid"
      role="table"
      aria-label="Prayer times"
    >
      <div role="rowgroup">
      {displayList.map((key) => {
        const { time, period } = fmtTime(prayers[key], use24h);
        const meta = PRAYER_META[key];
        const isNext = key === nextPrayer;
        const isCurrent = key === currentPrayer;
        // Sunrise is a marker; Qiyam is optional — both non-Fard
        const isSecondary = key === "Sunrise" || key === "Qiyam";
        const canMute = !isSecondary; // no sound → no mute button
        const isMuted = mutedPrayers.has(key);

        return (
          <div
            key={key}
            role="row"
            aria-label={`${tPrayers(key)}${isCurrent ? ", current prayer" : ""}${isNext ? ", next prayer" : ""}`}
            className={`prayer-row${isCurrent ? " prayer-row--current" : ""}${isSecondary ? " prayer-row--secondary" : ""}`}
          >
            <p role="cell" className={`prayer-name${isCurrent ? " prayer-name--current" : ""}`}>
              {tPrayers(key)}
              <span className="prayer-arabic-inline arabic"> ({meta.ar})</span>
            </p>

            <div role="cell" className="flex items-center gap-2">
              {isNext && (
                countdown ? (
                  <span className="next-badge next-badge--countdown" aria-label={`${tUi("nextBadge")} ${countdownStr}`}>{countdownStr}</span>
                ) : (
                  <span className="next-badge" aria-label={tUi("nextBadge")}>{tUi("nextBadge")}</span>
                )
              )}
              <div className="text-right">
                <span
                  className={`prayer-time${isCurrent ? " prayer-time--current" : ""}`}
                  aria-label={`${tPrayers(key)} time: ${time}${period ? " " + period : ""}`}
                >
                  {time}
                </span>
                {period && <span className="prayer-period" aria-hidden="true">{period}</span>}
              </div>
              {canMute ? (
                notificationsOff ? (
                  <span
                    className="prayer-mute-btn prayer-mute-btn--disabled"
                    title={tUi("enableNotif")}
                    aria-label={tUi("disabledNotif")}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth={1.75} />
                      <line
                        x1="5.636"
                        y1="5.636"
                        x2="18.364"
                        y2="18.364"
                        strokeWidth={1.75}
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={isMuted ? tUi("unmuteThisPrayer") : tUi("muteThisPrayer")}
                    onClick={() => onToggleMute(key)}
                    className={`prayer-mute-btn${isMuted ? " prayer-mute-btn--muted" : ""}`}
                  >
                    {isMuted ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072M12 6v12M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    )}
                  </button>
                )
              ) : (
                <span className="prayer-mute-spacer" aria-hidden="true" />
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
