import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CityPageClient from "@/components/CityPageClient";
import { geocodeSlugParts } from "@/lib/geo-server";
import { getUtcOffset } from "@/lib/geo";
import { getPrayerTimes } from "@/lib/prayers";

interface Params {
  slug: string[];
}

const BASE_URL = "https://praycalc.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const geo = geocodeSlugParts(slug);
  if (!geo) return { title: "Not Found" };

  const pageUrl = `${BASE_URL}/${slug.join("/")}`;
  const title = `Prayer Times in ${geo.displayName}`;
  const description = `Today's Fajr, Dhuhr, Asr, Maghrib, and Isha prayer times for ${geo.displayName}. GPS-accurate times with Qibla direction, Hijri date, and moon phase.`;

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
      card: "summary",
      title: `${title} | PrayCalc`,
      description,
    },
  };
}

export default async function SlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const geo = geocodeSlugParts(slug);
  if (!geo) notFound();

  const timezone = geo.timezone ?? "UTC";
  const now = new Date();
  const tzOffset = getUtcOffset(timezone, now);
  const shafiPrayers = getPrayerTimes(now, geo.lat, geo.lng, tzOffset, false);
  const hanafiPrayers = getPrayerTimes(now, geo.lat, geo.lng, tzOffset, true);

  const pageUrl = `${BASE_URL}/${slug.join("/")}`;

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
    <main className="city-page-main">
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
