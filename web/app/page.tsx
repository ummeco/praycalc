import LogoSunrise from "@/components/LogoSunrise";
import MoonPhase from "@/components/MoonPhase";
import Footer from "@/components/Footer";
import HomeRedirect from "@/components/HomeRedirect";
import HomeClient from "@/components/HomeClient";

export default function HomePage() {
  return (
    <main id="main-content" className="home-main">
      <HomeRedirect />
      {/*
        The logo container (.logo-sunrise) has overflow:hidden — its bottom
        edge is the horizon. The search box sits directly below with no gap,
        so the logo's clipped bottom appears to be "behind" the search box.
        .home-main has no horizontal padding so LogoSunrise is edge-to-edge.
      */}
      <LogoSunrise />

      <HomeClient />

      <div className="home-divider" />

      <div className="home-moon-card mx-4">
        <MoonPhase />
      </div>

      <div className="flex-1" />

      <Footer />
    </main>
  );
}
