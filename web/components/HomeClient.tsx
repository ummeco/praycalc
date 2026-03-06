"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import LocationSearch from "@/components/LocationSearch";
import LastVisited from "@/components/LastVisited";
import LocationGpsPill from "@/components/LocationGpsPill";
import GeoPrompt from "@/components/GeoPrompt";
import DPCInfoCard from "@/components/DPCInfoCard";

/**
 * Client shell for the homepage.
 * Owns the ip-detected city state so GeoPrompt can pre-fill LocationSearch.
 */
export default function HomeClient() {
  const [ipCity, setIpCity] = useState<string>("");
  const t = useTranslations("ui");

  return (
    <>
      <div className="w-full max-w-[480px] mt-[-25px] px-4">
        <LocationSearch autoFocus prefillValue={ipCity} />
        <p className="text-white/25 text-xs text-center mt-2">
          {t("homepageSubtitle")}
        </p>
        <div className="flex justify-center items-center gap-2 flex-wrap mt-3">
          <LocationGpsPill />
          <LastVisited />
        </div>
      </div>

      {/* Top-right floating cards — geo prompt stacks above DPC info */}
      <div className="home-top-right-cards">
        <GeoPrompt onIpCity={setIpCity} />
        <DPCInfoCard />
      </div>
    </>
  );
}
