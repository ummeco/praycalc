import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MasjidScheduleBuilder from "@/components/MasjidScheduleBuilder";

export const metadata: Metadata = {
  title: "Masjid Ramadan Schedule Builder | PrayCalc",
  description:
    "Generate a complete Ramadan schedule for your masjid with accurate prayer times, Eid Salat, Taraweeh, and Iftar times. FCNA or Umm al-Qura calendar.",
  openGraph: {
    title: "Masjid Ramadan Schedule Builder | PrayCalc",
    description:
      "Generate a complete Ramadan schedule for your masjid with accurate prayer times.",
    url: "https://praycalc.com/masjids",
    siteName: "PrayCalc",
    type: "website",
  },
};

export default function MasjidsPage() {
  return (
    <main className="info-page">
      <div className="info-page-inner">
        <MasjidScheduleBuilder />
      </div>
      <Footer />
    </main>
  );
}
