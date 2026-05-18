import type { Metadata } from 'next';
import Link from 'next/link';

// LAST_UPDATED: 2026-04-25
// DRAFT — under legal review. Shipping for development purposes; will be replaced before public launch.

export const metadata: Metadata = {
  title: 'Terms of Service — PrayCalc',
  description: 'PrayCalc terms of service. Rules and guidelines for using our platform.',
};

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: April 25, 2026</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">1. Acceptance</h2>
            <p>
              By accessing or using PrayCalc (&ldquo;Service&rdquo;), you agree to these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Service. These Terms form a binding agreement between you and <strong className="text-white/90">Ummat</strong> (501(c)(3) application pending).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">2. Service Description</h2>
            <p>
              PrayCalc provides GPS-accurate Islamic prayer times, Qibla direction, adhan reminders, moon phase tracking, and Islamic calendar tools for Muslims worldwide. The Service is free. Ummat+ subscribers unlock premium features (smart home integration, TV displays, widgets, advanced reminders).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">3. Account Requirements</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>You must be at least 13 years old (US) or 16 years old (EU) to create an account.</li>
              <li>You must provide accurate information when registering.</li>
              <li>You are responsible for the security of your account credentials.</li>
              <li>One account per person. Multiple accounts for abuse purposes are prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">4. Islamic Content Guidelines</h2>
            <p className="mb-2">
              PrayCalc is an Islamic service. If you submit content (reviews, feedback, community features), it must reflect Islamic values:
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Do not post content that disrespects Allah, the Prophets (peace be upon them), the Quran, or the Sunnah.</li>
              <li>Do not spread misinformation about prayer times, Qibla, or Islamic practices.</li>
              <li>Do not use the platform to promote haram activities.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">5. Prohibited Use</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Do not use the Service for any unlawful purpose.</li>
              <li>Do not attempt unauthorized access to any system or data.</li>
              <li>Do not scrape or bulk-harvest data without written permission.</li>
              <li>Do not circumvent rate limits or access controls.</li>
              <li>Do not impersonate another person or organization.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">6. Subscriptions and Payments</h2>
            <p>
              Ummat+ subscriptions are processed by <strong className="text-white/90">Stripe Inc.</strong> Subscriptions auto-renew unless cancelled before the renewal date. Refund policy: <a href="https://ummat.pro/refund" className="text-[#5A9438] underline">ummat.pro/refund</a> (14-day window for digital goods).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">7. Disclaimers</h2>
            <p className="mb-2">
              <strong className="text-white/90">Prayer times:</strong> Calculations are based on mathematical algorithms and public astronomical data. They are provided as a convenience. Your local masjid&rsquo;s announcement takes precedence for congregation prayer.
            </p>
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">8. Termination</h2>
            <p>
              We may suspend or terminate your account for Terms violations. You may delete your account at any time via Settings. Upon deletion, your data is removed per our <Link href="/privacy" className="text-[#5A9438] underline">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Ummat is not liable for indirect, incidental, or consequential damages. Our total liability to you shall not exceed the greater of the amount you paid us in the 12 months before the claim or $100 USD.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of <strong className="text-white/90">Delaware, USA</strong> (upon incorporation; Michigan law applies until then). EU/UK users: mandatory consumer protection laws in your country of residence apply.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">11. Changes to Terms</h2>
            <p>
              We will provide at least 14 days&rsquo; notice before material changes take effect, via email or in-app notice. Continued use after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#5A9438]">12. Contact</h2>
            <p>
              Legal: <a href="mailto:legal@ummat.dev" className="text-[#5A9438] underline">legal@ummat.dev</a><br />
              Abuse: <a href="mailto:abuse@ummat.dev" className="text-[#5A9438] underline">abuse@ummat.dev</a><br />
              <br />
              <strong className="text-white/90">Ummat</strong> (501(c)(3) application pending) &mdash; United States
            </p>
          </section>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/40">
            <Link href="/privacy" className="mr-4 hover:text-[#C9F27A] transition-colors">Privacy Policy</Link>
            <Link href="/cookies" className="mr-4 hover:text-[#C9F27A] transition-colors">Cookie Policy</Link>
            <Link href="/help" className="hover:text-[#C9F27A] transition-colors">Help & FAQ</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
