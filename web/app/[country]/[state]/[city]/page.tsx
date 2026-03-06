import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityPageClient from "@/components/CityPageClient";
import { geocodeSlug } from "@/lib/geo-server";
import { getTimezone, getUtcOffset } from "@/lib/geo";
import { getPrayerTimes } from "@/lib/prayers";

interface Params {
  country: string;
  state: string;
  city: string;
}

const BASE_URL = "https://praycalc.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { country, state, city } = await params;
  const geo = geocodeSlug(country, state, city);

  const cityName = city
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const displayName = geo?.displayName ?? `${cityName}, ${country.toUpperCase()}`;
  const pageUrl = `${BASE_URL}/${country}/${state}/${city}`;

  const title = `Prayer Times in ${displayName}`;
  const description = `Today's Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for ${displayName}. GPS-accurate times with Qibla direction, Hijri date, and moon phase.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: "website",
      title: `${title} | PrayCalc`,
      description,
      url: pageUrl,
      siteName: "PrayCalc",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | PrayCalc`,
      description,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { country, state, city } = await params;

  // All pray-calc work happens server-side — nrel-spa uses node:module
  // which can't run in the browser, so we compute here and pass data down.
  const geo = geocodeSlug(country, state, city);
  if (!geo) notFound();

  // Use IANA timezone from geo data when available; fall back to US state map
  const timezone = geo.timezone ?? getTimezone(country, state);
  const now = new Date();
  const tzOffset = getUtcOffset(timezone, now);
  const shafiPrayers = getPrayerTimes(now, geo.lat, geo.lng, tzOffset, false);
  const hanafiPrayers = getPrayerTimes(now, geo.lat, geo.lng, tzOffset, true);

  const pageUrl = `${BASE_URL}/${country}/${state}/${city}`;

  // JSON-LD: LocalBusiness schema for the city's prayer location context.
  // Using WebPage + specialOpeningHoursSpecification is non-standard for prayer
  // times; a plain WebPage with about gives search engines the right entity signal.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Prayer Times in ${geo.displayName}`,
    description: `Today's Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for ${geo.displayName}.`,
    url: pageUrl,
    about: {
      "@type": "City",
      name: geo.displayName,
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.lat,
        longitude: geo.lng,
      },
    },
    provider: {
      "@type": "WebSite",
      name: "PrayCalc",
      url: BASE_URL,
    },
  };

  return (
    <main id="main-content" className="city-page-main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CityPageClient
        shafiPrayers={shafiPrayers}
        hanafiPrayers={hanafiPrayers}
        locationName={geo.displayName}
        timezone={timezone}
        slug={geo.slug}
        lat={geo.lat}
        lng={geo.lng}
      />
    </main>
  );
}
