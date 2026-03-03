import { toHijri, formatHijriDate } from "luxon-hijri";

export interface HijriDateInfo {
  year: number;
  month: number;
  day: number;
  formatted: string;
  monthName: string;
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhira",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qi'da",
  "Dhul Hijja",
];

export function getHijriDate(date: Date = new Date()): HijriDateInfo {
  const h = toHijri(date);
  if (!h) return { day: 0, month: 0, monthName: "", year: 0, formatted: "" };
  const monthName = HIJRI_MONTHS[h.hm - 1] ?? "";
  let formatted = "";
  try {
    formatted = formatHijriDate(h, "iD iMMMM iYYYY ioooo");
  } catch {
    formatted = `${h.hd} ${monthName} ${h.hy} AH`;
  }
  return {
    year: h.hy,
    month: h.hm,
    day: h.hd,
    formatted,
    monthName,
  };
}
