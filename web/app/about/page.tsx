import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About PrayCalc',
  description:
    'PrayCalc is a free, accurate prayer time calculator built for the global Muslim community. GPS-accurate times, offline support, and smart home integration.',
  openGraph: {
    title: 'About PrayCalc',
    description:
      'Free, accurate prayer times for every Muslim. Built with care for the global ummah.',
    url: 'https://praycalc.com/about',
    siteName: 'PrayCalc',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="info-page">
      <div className="info-page-inner">
        {/* Header */}
        <div className="info-page-header">
          <Link href="/" className="info-page-back">← Back</Link>
        </div>

        {/* Hero */}
        <section className="info-section text-center">
          <div className="text-6xl mb-4">🕌</div>
          <h1 className="text-3xl font-bold text-[#C9F27A] mb-4">About PrayCalc</h1>
          <p className="text-white/70 text-lg max-w-lg mx-auto leading-relaxed">
            Free, accurate prayer times for every Muslim on Earth.
          </p>
        </section>

        {/* Mission */}
        <section className="info-section">
          <h2 className="info-h2">Our Mission</h2>
          <p className="info-p">
            PrayCalc exists to remove the friction between Muslims and their prayers. Every Muslim
            deserves to know their prayer times accurately, wherever they are in the world —
            whether in a city with a masjid on every block or a remote village with no Islamic
            center in sight.
          </p>
          <p className="info-p">
            We built PrayCalc to be the most accurate, most accessible, and most useful prayer
            time tool available — completely free. No ads. No data selling. No paywalls on the
            core experience. Prayer times, Qibla direction, and offline support are free for
            everyone, always.
          </p>
        </section>

        {/* Principles */}
        <section className="info-section">
          <h2 className="info-h2">How We Build</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: '🎯',
                title: 'Accuracy first',
                body: 'We use the NREL Solar Position Algorithm — the same standard used by NASA. Times are accurate within one minute for any coordinate on Earth.',
              },
              {
                icon: '🌍',
                title: 'Global by design',
                body: 'PrayCalc supports all major calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi) so every Muslim can use the method their community follows.',
              },
              {
                icon: '📵',
                title: 'Works offline',
                body: 'Once you visit a location, prayer times are cached locally. The mobile app runs fully on-device — no internet required after the first load.',
              },
              {
                icon: '🔒',
                title: 'Private by default',
                body: 'Your location is used only to calculate prayer times. We do not track, sell, or share your data. GPS coordinates never leave your device unless you choose to save them.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="info-card">
                <div className="text-2xl mb-2">{icon}</div>
                <h3 className="info-h3">{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open source */}
        <section className="info-section">
          <h2 className="info-h2">Open Source</h2>
          <p className="info-p">
            PrayCalc is built on open-source foundations and gives back to the community.
            The prayer calculation C library at the core of PrayCalc is open source,
            available for any developer building Islamic apps.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href="https://github.com/ummeco/praycalc"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#C9F27A] border border-[#79C24C]/30 rounded-xl px-4 py-2 hover:bg-[#79C24C]/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              View on GitHub
            </a>
            <a
              href="https://praycalc.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-white/50 border border-white/10 rounded-xl px-4 py-2 hover:text-white/70 transition-colors"
            >
              Developer docs ↗
            </a>
          </div>
        </section>

        {/* Built by Ummeco */}
        <section className="info-section">
          <h2 className="info-h2">Built by Ummeco</h2>
          <p className="info-p">
            PrayCalc is a product of{' '}
            <a href="https://ummat.dev" target="_blank" rel="noopener noreferrer" className="text-[#79C24C] hover:underline">
              Ummat.Dev
            </a>
            , a studio focused on building technology for the global Muslim community.
            Our broader platform includes the{' '}
            <a href="https://ummat.app" target="_blank" rel="noopener noreferrer" className="text-[#79C24C] hover:underline">
              Ummat App
            </a>
            {' '}super-app,{' '}
            <a href="https://islam.wiki" target="_blank" rel="noopener noreferrer" className="text-[#79C24C] hover:underline">
              Islam Wiki
            </a>
            , and{' '}
            <a href="https://chatislam.org" target="_blank" rel="noopener noreferrer" className="text-[#79C24C] hover:underline">
              ChatIslam
            </a>
            .
          </p>
        </section>

        {/* Contact */}
        <section className="info-section">
          <h2 className="info-h2">Contact</h2>
          <p className="info-p">
            Found a bug? Have a feature request? We want to hear from you.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <a
              href="https://github.com/ummeco/praycalc/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#C9F27A] border border-[#79C24C]/30 rounded-xl px-4 py-2 hover:bg-[#79C24C]/10 transition-colors"
            >
              Report an issue ↗
            </a>
            <Link
              href="/help"
              className="text-sm text-white/50 border border-white/10 rounded-xl px-4 py-2 hover:text-white/70 transition-colors"
            >
              Help & FAQ
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
