"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSettings } from "@/lib/settings";

function Redirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // User explicitly came home via the logo — show the home page normally
    if (searchParams.get("from") === "logo") return;

    const s = getSettings();

    if (s.homeMode === "city" && s.homeCity?.slug) {
      router.replace(`/${s.homeCity.slug}`);
    } else if (s.homeMode === "location") {
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `/api/geo?lat=${latitude}&lng=${longitude}`,
            );
            if (!res.ok) throw new Error("geo failed");
            const data = (await res.json()) as { slug?: string };
            if (data?.slug) {
              router.replace(`/${data.slug}`);
              return;
            }
          } catch {
            // fall through to saved city
          }
          // GPS lookup failed — fall back to saved city if available
          if (s.homeCity?.slug) router.replace(`/${s.homeCity.slug}`);
        },
        () => {
          // GPS denied — fall back to saved city
          if (s.homeCity?.slug) router.replace(`/${s.homeCity.slug}`);
        },
      );
    }
  }, [router, searchParams]);

  return null;
}

// useSearchParams() requires a Suspense boundary in Next.js App Router
export default function HomeRedirect() {
  return (
    <Suspense fallback={null}>
      <Redirect />
    </Suspense>
  );
}
