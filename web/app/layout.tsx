import type { Metadata, Viewport } from "next";
// B1-03: Self-hosted via next/font/google — Next.js downloads Inter at build
// time and serves it from the same origin. No Google CDN calls at runtime.
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const BASE_URL = "https://praycalc.com";

// Viewport export — Next.js 15/16 requires themeColor and appleWebApp here,
// not in metadata. Controls browser chrome color and iOS PWA behavior.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1E5E2F" },
    { media: "(prefers-color-scheme: light)", color: "#1E5E2F" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PrayCalc — Islamic Prayer Times",
    template: "%s | PrayCalc",
  },
  description:
    "Accurate Islamic prayer times for any location on Earth. GPS-based, multiple calculation methods, Qibla direction, moon phases, and Hijri calendar.",
  keywords: [
    "prayer times",
    "Islamic",
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
    "Salah",
    "Muslim",
    "Qibla",
    "PrayCalc",
  ],
  // PWA: manifest is auto-linked by Next.js when app/manifest.ts exists.
  // appleWebApp enables "Add to Home Screen" on iOS Safari.
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PrayCalc",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "PrayCalc",
    title: "PrayCalc — Islamic Prayer Times",
    description:
      "Accurate Islamic prayer times for any location on Earth. GPS-based, multiple calculation methods, Qibla direction, and Hijri calendar.",
    url: BASE_URL,
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "PrayCalc — Islamic Prayer Times",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrayCalc — Islamic Prayer Times",
    description:
      "Accurate Islamic prayer times for any location on Earth. GPS-based, multiple calculation methods, Qibla direction, and Hijri calendar.",
    images: ["/logo.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={['ar', 'ur', 'fa', 'ps', 'ku'].includes(locale) ? 'rtl' : 'ltr'}>
      <body
        className={`${inter.variable} antialiased`}
      >
        {/* Skip-to-content link — keyboard/screen reader users jump past nav */}
        <a
          href="#main-content"
          className="skip-to-content"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        {/* Vercel Analytics — privacy-compliant, no cookies, no PII */}
        <Analytics />
        {/* Vercel Speed Insights — Core Web Vitals monitoring */}
        <SpeedInsights />
        {/* Umami Analytics — privacy-first, no cookies, no PII, self-hosted.
            NEXT_PUBLIC_UMAMI_WEBSITE_ID and NEXT_PUBLIC_UMAMI_HOST_URL are set
            in Vercel env vars (vault keys: UMAMI_PRAYCALC_WEBSITE_ID, UMAMI_HOST_URL).
            Script is loaded only when both vars are present (no-op in local dev). */}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_HOST_URL && (
          <Script
            src={`${process.env.NEXT_PUBLIC_UMAMI_HOST_URL}/script.js`}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
            defer
          />
        )}
      </body>
    </html>
  );
}
