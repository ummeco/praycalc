import type { Metadata } from 'next';
import Link from 'next/link';

// LAST_UPDATED: 2026-04-25
// DRAFT — under legal review. Shipping for development purposes; will be replaced before public launch.

export const metadata: Metadata = {
  title: 'Privacy Policy — PrayCalc',
  description: 'PrayCalc privacy policy. How we collect, use, and protect your data.',
};

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: April 25, 2026</p>
        </div>

        <div className="space-y-8 text-white/70 leading-relaxed">

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">1. Who We Are</h2>
            <p>
              PrayCalc is operated by <strong className="text-white/90">Ummat</strong>, an Islamic technology organization (501(c)(3) application pending). We operate <a href="https://praycalc.com" className="text-[#79C24C] underline">praycalc.com</a> and the PrayCalc mobile app, serving the global Muslim community with accurate prayer times, Qibla direction, and Islamic calendar tools.
            </p>
            <p className="mt-2">
              <strong className="text-white/90">Data controller:</strong> Ummat &mdash; <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] underline">privacy@ummat.dev</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">2. What We Collect</h2>
            <p className="mb-2">Data you provide:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-white/90">Account information:</strong> email address and display name when you create an account.</li>
              <li><strong className="text-white/90">Saved locations:</strong> city names or GPS coordinates you save for prayer time reminders.</li>
              <li><strong className="text-white/90">Prayer preferences:</strong> calculation method (ISNA, MWL, Umm al-Qura, etc.), school of thought, and adhan reminder settings.</li>
            </ul>
            <p className="mb-2 mt-4">Data collected automatically:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-white/90">Location data:</strong> GPS coordinates when you request prayer times or Qibla direction. Location is used only for the calculation and is not stored on our servers unless you explicitly save a location to your profile.</li>
              <li><strong className="text-white/90">Usage data:</strong> pages visited, features used, session duration, and error reports.</li>
              <li><strong className="text-white/90">Device information:</strong> device type, OS version, browser type and version.</li>
              <li><strong className="text-white/90">IP address:</strong> used for rate limiting and approximate geographic routing. Not stored beyond 30 days in server logs.</li>
            </ul>
            <p className="mt-4">
              We do <strong className="text-white/90">not</strong> sell your data. We do <strong className="text-white/90">not</strong> build advertising profiles. Your location is never shared with advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">3. How We Use It</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Calculate accurate prayer times, Qibla direction, moon phases, and Islamic calendar events for your location.</li>
              <li>Send adhan reminders and transactional emails (account verification, password reset).</li>
              <li>Improve calculation accuracy and the app experience.</li>
              <li>Detect and prevent abuse and security incidents.</li>
              <li>Comply with applicable law.</li>
            </ul>
            <p className="mt-3">
              <strong className="text-white/90">GDPR lawful basis:</strong> contract performance (delivering the service you signed up for), legitimate interests (security, service improvement), legal obligation.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">4. Who We Share With</h2>
            <p className="mb-3">We share data only with these service providers, strictly to deliver our service:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 text-white/50">
                    <th className="pb-2 text-left pr-4">Vendor</th>
                    <th className="pb-2 text-left pr-4">Purpose</th>
                    <th className="pb-2 text-left">Country / Safeguard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <tr><td className="py-2 pr-4">Hetzner Online GmbH</td><td className="py-2 pr-4">Server hosting</td><td className="py-2">Germany (EU)</td></tr>
                  <tr><td className="py-2 pr-4">Vercel Inc.</td><td className="py-2 pr-4">Web hosting</td><td className="py-2">USA/EU — SCCs</td></tr>
                  <tr><td className="py-2 pr-4">Cloudflare Inc.</td><td className="py-2 pr-4">CDN, DNS, DDoS protection</td><td className="py-2">USA/EU — SCCs</td></tr>
                  <tr><td className="py-2 pr-4">Elastic Email Inc.</td><td className="py-2 pr-4">Transactional email</td><td className="py-2">USA/EU — SCCs</td></tr>
                  <tr><td className="py-2 pr-4">Google Firebase</td><td className="py-2 pr-4">Push notifications (mobile app)</td><td className="py-2">USA — SCCs</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm">
              Full sub-processor list: <a href="https://ummat.pro/legal/sub-processors" className="text-[#79C24C] underline">ummat.pro/legal/sub-processors</a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">5. Your Rights</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong className="text-white/90">Access</strong> — request a copy of all data we hold about you.</li>
              <li><strong className="text-white/90">Correct</strong> — ask us to fix inaccurate data.</li>
              <li><strong className="text-white/90">Delete</strong> — request deletion of your account and associated data.</li>
              <li><strong className="text-white/90">Port</strong> — receive your data in a machine-readable format.</li>
              <li><strong className="text-white/90">Restrict / Object</strong> — limit or object to certain processing.</li>
            </ul>
            <p className="mt-3">
              GDPR / UK-GDPR: all rights under Articles 15&ndash;22 apply. Response within 30 days. CCPA/CPRA: we do not sell or share your personal information.
            </p>
            <p className="mt-2">
              To exercise any right, email <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] underline">privacy@ummat.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">6. Children</h2>
            <p>
              PrayCalc is not directed at children under 13 (US) or under 16 (EU). We do not knowingly collect personal data from minors below the applicable minimum age without verified parental consent. If you believe a child has provided data, contact <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] underline">privacy@ummat.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">7. Retention</h2>
            <ul className="list-disc space-y-1 pl-6">
              <li>Account data: until deletion + 30-day grace period.</li>
              <li>Server logs (incl. IP): 30 days.</li>
              <li>Crash reports: 90 days.</li>
              <li>Anonymized analytics: up to 24 months.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">8. International Transfers</h2>
            <p>
              Our primary servers are in <strong className="text-white/90">Falkenstein, Germany (EU)</strong> via Hetzner. US users: your data is stored in the EU. Some service providers operate in the USA; transfers are covered by Standard Contractual Clauses (EU 2021/914, Module 2).
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">9. Security</h2>
            <p>
              All data in transit is encrypted with TLS 1.3. Sensitive fields are encrypted at rest. Access is restricted by role. To report a security vulnerability, email <a href="mailto:security@ummat.dev" className="text-[#79C24C] underline">security@ummat.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">10. Contact</h2>
            <p>
              Privacy requests: <a href="mailto:privacy@ummat.dev" className="text-[#79C24C] underline">privacy@ummat.dev</a><br />
              Security reports: <a href="mailto:security@ummat.dev" className="text-[#79C24C] underline">security@ummat.dev</a><br />
              <br />
              <strong className="text-white/90">Ummat</strong> (501(c)(3) application pending) &mdash; United States
            </p>
          </section>

          {/* C-07b: Recent Updates — appended 2026-04-30 */}
          <section className="rounded-lg border border-[#79C24C]/20 bg-[#1E5E2F]/20 px-5 py-4">
            <h2 className="mb-3 text-xl font-semibold text-[#79C24C]">Recent Updates (2026-04-25)</h2>
            <p className="mb-2 text-sm text-white/50">The following changes reflect P3 platform decisions that took effect April 2026:</p>
            <ul className="list-disc space-y-2 pl-6 text-sm">
              <li>
                <strong className="text-white/90">Analytics — PostHog removed:</strong> PostHog is no longer used on any Ummeco product (decision D-P3-21). PrayCalc uses only self-hosted <strong className="text-white/90">Umami</strong> for privacy-preserving, cookieless analytics. Umami does not fingerprint users or share data with third parties.
              </li>
              <li>
                <strong className="text-white/90">AI features:</strong> PrayCalc does not currently use AI processing that sends personal data to external providers. This policy will be updated if AI features are added.
              </li>
            </ul>
          </section>

          <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/40">
            <Link href="/terms" className="mr-4 hover:text-[#C9F27A] transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="mr-4 hover:text-[#C9F27A] transition-colors">Cookie Policy</Link>
            <Link href="/help" className="hover:text-[#C9F27A] transition-colors">Help & FAQ</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
