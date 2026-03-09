import type { Metadata } from "next";
import Footer from "@/components/Footer";
import MasjidScheduleBuilder from "@/components/MasjidScheduleBuilder";
import MosquesNearby from "@/components/MosquesNearby";

export const metadata: Metadata = {
  title: "Masjid Tools | PrayCalc",
  description:
    "Find mosques near you, generate a Ramadan schedule for your masjid, and access Islamic community tools. Accurate prayer times for every masjid.",
  openGraph: {
    title: "Masjid Tools | PrayCalc",
    description:
      "Find nearby mosques and generate Ramadan schedules with accurate prayer times.",
    url: "https://praycalc.com/masjids",
    siteName: "PrayCalc",
    type: "website",
  },
};

export default function MasjidsPage() {
  return (
    <main className="info-page">
      <div className="info-page-inner">
        <MosquesNearby />
        <MasjidScheduleBuilder />
      </div>
      <Footer />
    </main>
  );
}
