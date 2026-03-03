"use client";

import Image from "next/image";
import { getMoonPhase } from "@/lib/moon";
import { getHijriDate } from "@/lib/hijri";

export default function MoonPhase() {
  const moon = getMoonPhase();
  const hijri = getHijriDate();

  const gregorian = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-5">
      <div className="moon-circle">
        <Image
          src={moon.imageUrl}
          alt={moon.phaseName}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      <div>
        <p className="text-white/90 text-sm font-medium">
          {hijri.monthName} {hijri.day}, {hijri.year}{" "}
          <span className="date-era">AH</span>
        </p>
        <p className="text-white/30 text-xs mt-0.5">
          {gregorian} <span className="date-era">CE</span>
        </p>
      </div>
    </div>
  );
}
