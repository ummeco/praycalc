import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang={locale} dir={locale === 'ar' || locale === 'ur' ? 'rtl' : 'ltr'}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
      </body>
    </html>
  );
}
