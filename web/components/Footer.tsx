import Link from "next/link";

const PRAYCALC_LINKS = [
  { label: "Home", href: "/" },
  { label: "For Institutions", href: "/institutions" },
  { label: "For Masjids", href: "/masjids" },
];

const EXPLORE_LINKS = [
  { label: "Ummat App", href: "https://ummat.app" },
  { label: "Islam Wiki", href: "https://islam.wiki" },
  { label: "ChatIslam", href: "https://chatislam.org" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-cols">
        {/* Col 1 — half width: brand + description */}
        <div className="site-footer-col site-footer-col--brand">
          <p className="site-footer-brand-name">PrayCalc</p>
          <p className="site-footer-brand-desc">
            Accurate Islamic prayer times for any city worldwide. Multiple
            calculation methods, Hijri calendar, moon phases, and Qibla
            direction. Free, private, and ad-free.
          </p>
        </div>

        {/* Col 2 — quarter width: site links */}
        <div className="site-footer-col">
          <p className="site-footer-col-title">PrayCalc</p>
          {PRAYCALC_LINKS.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </div>

        {/* Col 3 — quarter width: Ummat ecosystem */}
        <div className="site-footer-col">
          <p className="site-footer-col-title">Explore More</p>
          {EXPLORE_LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="site-footer-bottom">
        <p className="text-white/30 text-xs">
          &copy; 2026{" "}
          <a href="https://ummat.dev" target="_blank" rel="noopener noreferrer" className="hover:text-[#C9F27A] transition-colors">
            Ummat.Dev
          </a>
        </p>
        <div className="flex items-center gap-3">
          <Link href="/help" className="site-footer-legal-link">Help</Link>
          <span className="text-white/15 text-xs">&middot;</span>
          <Link href="/privacy" className="site-footer-legal-link">Privacy</Link>
          <span className="text-white/15 text-xs">&middot;</span>
          <Link href="/terms" className="site-footer-legal-link">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
