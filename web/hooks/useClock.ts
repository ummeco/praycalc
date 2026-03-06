"use client";

import { useState, useEffect, useRef } from "react";
import { getNextPrayer, type PrayerResult } from "@/lib/prayer-utils";
import { getMoonPhase, type MoonPhaseInfo } from "@/lib/moon";
import { getHijriDate, type HijriDateInfo } from "@/lib/hijri";

export interface ClockState {
  currentTime: string;       // HH:MM:SS in timezone
  countdownStr: string;      // HH:MM:SS countdown to next prayer
  nextPrayer: keyof PrayerResult;
  isAfterMaghrib: boolean;
  weekday: string;
  gregorianDate: string;
  moon: MoonPhaseInfo;
  hijriData: HijriDateInfo;
}

interface UseClockOptions {
  prayers: PrayerResult;
  timezone: string;
  displayList: Array<keyof PrayerResult>;
  /** Called when we detect a prayer has just arrived (clock ticked past it). */
  onPrayerArrival: (arrived: keyof PrayerResult) => void;
}

const SOUND_PRAYERS: Array<keyof PrayerResult> = [
  "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha",
];

export function useClock({
  prayers,
  timezone,
  displayList,
  onPrayerArrival,
}: UseClockOptions): ClockState {
  const [currentTime, setCurrentTime] = useState("");
  const [countdownStr, setCountdownStr] = useState("");
  const [nextPrayer, setNextPrayer] = useState<keyof PrayerResult>("Fajr");
  const [isAfterMaghrib, setIsAfterMaghrib] = useState(false);
  const [weekday, setWeekday] = useState("");
  const [gregorianDate, setGregorianDate] = useState("");
  const [moon, setMoon] = useState<MoonPhaseInfo>(() => getMoonPhase());
  const [hijriData, setHijriData] = useState<HijriDateInfo>(() => getHijriDate());

  const prevNextPrayerRef = useRef<keyof PrayerResult | null>(null);
  const prevDateStrRef = useRef<string>("");
  // Keep a stable ref to displayList so the tick closure always sees the live value
  const displayListRef = useRef<Array<keyof PrayerResult>>(displayList);
  displayListRef.current = displayList;
  // Keep stable ref to callback so the effect doesn't re-run when it changes
  const onPrayerArrivalRef = useRef(onPrayerArrival);
  onPrayerArrivalRef.current = onPrayerArrival;

  // Force date/moon refresh when returning to tab
  useEffect(() => {
    function handleVisibility() {
      if (!document.hidden) prevDateStrRef.current = "";
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Real-time clock — resets on city/prayer change
  useEffect(() => {
    prevNextPrayerRef.current = null;

    // Cache formatters — avoids 86,400 Intl constructions per day
    const timeFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const isoDateFmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const fullDateFmt = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    function tick() {
      const now = new Date();

      const tParts = timeFmt.formatToParts(now);
      const getT = (t: string) =>
        tParts.find((p) => p.type === t)?.value ?? "00";

      let hh = getT("hour");
      if (hh === "24") hh = "00";
      const hStr = hh.padStart(2, "0");
      const mStr = getT("minute").padStart(2, "0");
      const sStr = getT("second").padStart(2, "0");
      const hhmm = `${hStr}:${mStr}`;

      setCurrentTime(`${hStr}:${mStr}:${sStr}`);

      const next = getNextPrayer(prayers, hhmm, displayListRef.current);
      setNextPrayer(next);

      // Countdown to next prayer
      const nextTimeStr = prayers[next];
      if (nextTimeStr) {
        const [pHH, pMM] = nextTimeStr.split(":").map(Number);
        const prayerSecs = (pHH ?? 0) * 3600 + (pMM ?? 0) * 60;
        const currentSecs =
          parseInt(hStr) * 3600 + parseInt(mStr) * 60 + parseInt(sStr);
        let diffSecs = prayerSecs - currentSecs;
        if (diffSecs < 0) diffSecs += 86400;
        const cdH = Math.floor(diffSecs / 3600);
        const cdM = Math.floor((diffSecs % 3600) / 60);
        const cdS = diffSecs % 60;
        setCountdownStr(
          `${String(cdH).padStart(2, "0")}:${String(cdM).padStart(2, "0")}:${String(cdS).padStart(2, "0")}`,
        );
      }

      // Islamic day starts at Maghrib
      setIsAfterMaghrib(prayers.Maghrib ? hhmm >= prayers.Maghrib : false);

      // Date / moon / hijri — only when local date changes
      const isoDate = isoDateFmt.format(now);

      if (isoDate !== prevDateStrRef.current) {
        prevDateStrRef.current = isoDate;

        const dParts = fullDateFmt.formatToParts(now);
        const getD = (t: string) =>
          dParts.find((p) => p.type === t)?.value ?? "";

        setWeekday(getD("weekday"));
        setGregorianDate(`${getD("month")} ${getD("day")}, ${getD("year")}`);

        const localDate = new Date(`${isoDate}T12:00:00`);
        setHijriData(getHijriDate(localDate));
        setMoon(getMoonPhase(localDate));
      }

      // Prayer arrival detection — mirrors original logic exactly
      if (
        prevNextPrayerRef.current !== null &&
        prevNextPrayerRef.current !== next
      ) {
        const arrived = prevNextPrayerRef.current;
        // Only fard prayers trigger the overlay/sound (not Sunrise, Qiyam)
        if (SOUND_PRAYERS.includes(arrived)) {
          onPrayerArrivalRef.current(arrived);
        }
      }
      prevNextPrayerRef.current = next;
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [prayers, timezone]);

  return {
    currentTime,
    countdownStr,
    nextPrayer,
    isAfterMaghrib,
    weekday,
    gregorianDate,
    moon,
    hijriData,
  };
}
