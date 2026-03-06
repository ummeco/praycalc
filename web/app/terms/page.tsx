import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'PrayCalc terms of service. Rules and guidelines for using our platform.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: March 6, 2026</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the PrayCalc website (praycalc.com) and mobile application operated by PrayCalc (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). By using our services, you agree to these terms.
          </p>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">1. Acceptance of Terms</h2>
            <p>By accessing or using PrayCalc, you agree to be bound by these Terms. If you do not agree, do not use our services.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">2. Accounts</h2>
            <p>To use certain features, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and keep it up to date.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">3. Acceptable Use</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Use the service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to our systems or other users&rsquo; accounts.</li>
              <li>Use automated tools to scrape or collect data from our services without permission.</li>
              <li>Interfere with the proper operation of the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">4. Prayer Times</h2>
            <p>Prayer times are calculated algorithmically based on your location and selected calculation method. While highly accurate, minor variations may exist compared to your local masjid. Always confirm with your local masjid for communal prayer times.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">5. Third-Party Services</h2>
            <p>PrayCalc integrates with third-party services (Google Sign-In, Apple Sign-In, smart home platforms). Your use of those services is governed by their respective terms. We are not responsible for third-party service availability or practices.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">6. Subscriptions and Payments</h2>
            <p>Some features require a paid subscription (Ummat+). Subscription terms, pricing, and cancellation policies are presented at the time of purchase. Subscriptions auto-renew unless cancelled before the renewal date.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">7. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these terms. You may delete your account at any time through the app settings. Upon deletion, your personal data will be removed in accordance with our{' '}
              <Link href="/privacy" className="text-[#79C24C] hover:text-[#C9F27A] transition-colors">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">8. Disclaimers</h2>
            <p>Our services are provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not guarantee uninterrupted or error-free operation.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">9. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, PrayCalc shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">10. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify you of significant changes.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">11. Governing Law</h2>
            <p>These terms are governed by the laws of the United States. Any disputes shall be resolved in the courts of the State of Ohio.</p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">12. Contact</h2>
            <p>
              Questions about these terms? Contact us at{' '}
              <a href="mailto:legal@praycalc.com" className="text-[#79C24C] hover:text-[#C9F27A] transition-colors">
                legal@praycalc.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-12 flex justify-center gap-6 text-sm text-white/40">
          <Link href="/privacy" className="hover:text-[#C9F27A] transition-colors">Privacy Policy</Link>
          <Link href="/help" className="hover:text-[#C9F27A] transition-colors">Help & FAQ</Link>
          <Link href="/" className="hover:text-[#C9F27A] transition-colors">Back to PrayCalc</Link>
        </div>
      </div>
    </main>
  );
}
