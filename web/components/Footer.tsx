import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="site-footer">
      <div className="site-footer-cols">
        {/* Col 1 — half width: brand + description */}
        <div className="site-footer-col site-footer-col--brand">
          <p className="site-footer-brand-name">PrayCalc</p>
          <p className="site-footer-brand-desc">
            {t("description")}
          </p>
        </div>

        {/* Col 2 — quarter width: site links */}
        <div className="site-footer-col">
          <p className="site-footer-col-title">PrayCalc</p>
          <Link href="/">{t("home")}</Link>
          <Link href="/duas">Duas &amp; Adhkar</Link>
          <Link href="/tasbeeh">Tasbeeh</Link>
          <Link href="/institutions">{t("institutions")}</Link>
          <Link href="/masjids">{t("masjids")}</Link>
        </div>

        {/* Col 3 — quarter width: Ummat ecosystem */}
        <div className="site-footer-col">
          <p className="site-footer-col-title">{t("exploreMore")}</p>
          <a href="https://ummat.app" target="_blank" rel="noopener noreferrer">Ummat App</a>
          <a href="https://islam.wiki" target="_blank" rel="noopener noreferrer">Islam Wiki</a>
          <a href="https://chatislam.org" target="_blank" rel="noopener noreferrer">ChatIslam</a>
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
          <LanguageSwitcher variant="footer" />
          <span className="text-white/15 text-xs">&middot;</span>
          <Link href="/help" className="site-footer-legal-link">{t("help")}</Link>
          <span className="text-white/15 text-xs">&middot;</span>
          <Link href="/privacy" className="site-footer-legal-link">{t("privacy")}</Link>
          <span className="text-white/15 text-xs">&middot;</span>
          <Link href="/terms" className="site-footer-legal-link">{t("terms")}</Link>
        </div>
      </div>
    </footer>
  );
}
