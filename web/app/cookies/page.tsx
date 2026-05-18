import type { Metadata } from 'next';
import Link from 'next/link';

// LAST_UPDATED: 2026-04-25
// DRAFT — under legal review. Shipping for development purposes; will be replaced before public launch.

export const metadata: Metadata = {
  title: 'Cookie Policy — PrayCalc',
  description: 'PrayCalc cookie policy. What cookies we use and how to control them.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Draft banner */}
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <strong>DRAFT</strong> — This policy is under legal review (2026-04-25). Published for development purposes; will be replaced before public launch.
        </div>

        <div className="mb-12">
          <Link href="/" className="mb-6 inline-block text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to PrayCalc
          </Link>
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Cookie Policy</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: April 25, 2026</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. They help us keep you signed in, remember your preferences, and understand how the site is used.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">Cookies We Use</h2>

            <h3 className="mb-2 mt-4 font-semibold text-white/80">Essential cookies (always active)</h3>
            <p className="mb-3 text-sm">Required for PrayCalc to function. You cannot opt out of these.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-white/50">
                    <th className="pb-2 text-left pr-4">Name</th>
                    <th className="pb-2 text-left pr-4">Purpose</th>
                    <th className="pb-2 text-left">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr><td className="py-2 pr-4 font-mono text-xs">um_session</td><td className="py-2 pr-4">Keeps you signed in</td><td className="py-2">Session / 30 days</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">um_csrf</td><td className="py-2 pr-4">Cross-site request forgery protection</td><td className="py-2">Session</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">um_consent</td><td className="py-2 pr-4">Stores your cookie preference</td><td className="py-2">1 year</td></tr>
                  <tr><td className="py-2 pr-4 font-mono text-xs">pc_prefs</td><td className="py-2 pr-4">Prayer time preferences (calculation method, school)</td><td className="py-2">1 year</td></tr>
                </tbody>
              </table>
            </div>

            <h3 className="mb-2 mt-6 font-semibold text-white/80">Analytics cookies (opt-in only)</h3>
            <p className="mb-3 text-sm">
              Privacy-respecting analytics to understand how visitors use PrayCalc. These only fire after you give explicit consent. We do not use Google Analytics or advertising-network trackers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">Third-Party Cookies</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-white/90">Cloudflare</strong> may set <code className="text-xs bg-white/10 px-1 rounded">__cf_bm</code> for bot detection (strictly necessary).</li>
              <li><strong className="text-white/90">Stripe</strong> sets cookies on payment pages for fraud detection (strictly necessary for payments).</li>
            </ul>
            <p className="mt-3">We do not allow any advertising networks to set cookies on PrayCalc.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">Your Choices</h2>
            <p>
              On your first visit we show a consent banner. You can choose &ldquo;Accept all&rdquo; (essential + analytics) or &ldquo;Essential only&rdquo; (analytics will not fire). You can change your preference at any time via the cookie settings link in the footer.
            </p>
            <p className="mt-2">
              Your preference is stored in <code className="text-xs bg-white/10 px-1 rounded">um_consent</code>. Clearing your browser cookies will reset your choice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">Contact</h2>
            <p>
              Questions about cookies: <a href="mailto:privacy@ummat.dev" className="text-[#5A9438] underline">privacy@ummat.dev</a>
            </p>
          </section>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/40">
            <Link href="/privacy" className="mr-4 hover:text-[#C9F27A] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#C9F27A] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
