"use client";

import { useState } from "react";
import LocationSearch from "@/components/LocationSearch";
import LastVisited from "@/components/LastVisited";
import GeoPrompt from "@/components/GeoPrompt";
import DPCInfoCard from "@/components/DPCInfoCard";

/**
 * Client shell for the homepage.
 * Owns the ip-detected city state so GeoPrompt can pre-fill LocationSearch.
 */
export default function HomeClient() {
  const [ipCity, setIpCity] = useState<string>("");

  return (
    <>
      <div className="w-full max-w-[480px] mt-[-25px] px-4">
        <LocationSearch autoFocus prefillValue={ipCity} />
        <p className="text-white/25 text-xs text-center mt-2">
          Prayer times for any city, worldwide
        </p>
        <div className="flex justify-center mt-3">
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
