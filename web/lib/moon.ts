import { cycleMonth, cdnUrl } from "moon-cycle";

export interface MoonPhaseInfo {
  imageUrl: string;
  phaseName: string;
  illumination: number;
}

const PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
];

export function getMoonPhase(date: Date = new Date()): MoonPhaseInfo {
  const filename = cycleMonth(date);
  const imageUrl = cdnUrl(filename, "mm", 256, 75);

  // Frame 001 = new moon, 354 ≈ full moon, 708 = back to new
  const frame = parseInt(filename.replace(".webp", ""), 10);
  const progress = frame / 708; // 0–1 through lunar cycle

  const phaseIndex = Math.floor(progress * 8) % 8;

  // Illumination: peaks at 50% (full moon), zero at 0% and 100% (new moon)
  const illumination = Math.round(
    Math.abs(Math.sin(progress * Math.PI)) * 100,
  );

  return {
    imageUrl,
    phaseName: PHASE_NAMES[phaseIndex],
    illumination,
  };
}
