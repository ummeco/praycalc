"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSettings } from "@/lib/settings";

interface City {
  label: string;
  slug: string;
}

const CITIES: City[] = [
  { label: "Mecca", slug: "sa/makkah/mecca" },
  { label: "Medina", slug: "sa/madinah/medina" },
  { label: "Istanbul", slug: "tr/istanbul/istanbul" },
  { label: "Cairo", slug: "eg/cairo/cairo" },
  { label: "New York", slug: "us/ny/new-york" },
  { label: "London", slug: "gb/england/london" },
];

export default function PopularCities() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Hide if user has a home city set
    const s = getSettings();
    if (s.homeMode === "city" && s.homeCity?.slug) {
      setShow(false);
    } else {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4 px-4">
      {CITIES.map((city) => (
        <button
          key={city.slug}
          type="button"
          onClick={() => router.push(`/${city.slug}`)}
          className="popular-city-chip"
        >
          {city.label}
        </button>
      ))}
    </div>
  );
}
