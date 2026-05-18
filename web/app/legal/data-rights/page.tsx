import type { Metadata } from 'next'
import Link from 'next/link'

// T06-LEGAL-COUNSEL-PACK: PrayCalc GDPR/CCPA Data Subject Rights (DSR) page
// DRAFT — counsel review pending (U-15). Do not publish before review.
// LAST_UPDATED: 2026-05-16

export const metadata: Metadata = {
  title: 'Your Data Rights — PrayCalc',
  description:
    'PrayCalc data subject rights: GDPR access, deletion, portability, correction requests and CCPA opt-out for location data.',
  robots: { index: false }, // U-15 gate
}

export default function DataRightsPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-white">

        {/* Draft gate */}
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <strong>DRAFT — Not yet effective.</strong> Counsel copy pending (U-15). Committed for development review only.
        </div>

        <Link href="/privacy" className="mb-8 inline-block text-sm text-white/40 hover:text-white/70 transition-colors">
          &larr; Back to Privacy Policy
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#C9F27A] sm:text-4xl">Your Data Rights</h1>
        <p className="mt-3 mb-2 text-sm text-white/40">
          PrayCalc (praycalc.com) — Ummeco, LLC · Effective: pending counsel review
        </p>
        <p className="mb-10 text-white/60 max-w-2xl text-sm leading-relaxed">
          PrayCalc handles location data to calculate prayer times. You have rights over that
          data under GDPR, CCPA/CPRA, and other applicable laws.
        </p>

        {/* Location data callout */}
        <div className="mb-10 rounded-xl border border-[#1E5E2F]/40 bg-[#1E5E2F]/10 px-6 py-5">
          <h2 className="text-base font-semibold text-white mb-2">Location Data — Sensitive Category</h2>
          <p className="text-sm text-white/60">
            Under the California Consumer Privacy Rights Act, precise geolocation is classified as
            sensitive personal information. You may limit our use of your location data at any time
            in Settings → Privacy → Location Permissions.
          </p>
          <a
            href="mailto:privacy@ummat.dev?subject=PrayCalc%20Data%20Rights%20Request&body=Name%3A%0AAccount%20email%3A%0ARequest%20type%3A%20Limit%20Location%20Data%20Use%0ADetails%3A"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#79C24C] px-5 py-2.5 text-sm font-medium text-[#0D2F17] hover:bg-[#C9F27A] transition-colors"
          >
            Submit Opt-Out Request
          </a>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-4">Your Rights</h2>
            <div className="grid gap-3">
              {[
                {
                  right: 'Access',
                  desc: 'Request a copy of the personal data we hold about you, including saved locations and settings.',
                },
                {
                  right: 'Deletion',
                  desc: 'Request deletion of your account and all associated data including saved locations, preferences, and usage history.',
                },
                {
                  right: 'Portability',
                  desc: 'Receive your saved locations and preferences in JSON format.',
                },
                {
                  right: 'Correction',
                  desc: 'Correct inaccurate personal data. Most corrections can be made directly in the app.',
                },
                {
                  right: 'Limit Sensitive Data Use (CCPA)',
                  desc: 'Limit how we use your precise location data.',
                },
                {
                  right: 'Withdraw Consent',
                  desc: 'Withdraw consent for optional data processing (e.g., analytics). Withdraw in Settings or by contacting us.',
                },
              ].map(({ right, desc }) => (
                <div key={right} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <p className="font-medium text-white/90">{right}</p>
                  <p className="mt-1 text-white/60">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">How to Submit a Request</h2>
            <p>
              Email{' '}
              <a
                href="mailto:privacy@ummat.dev?subject=PrayCalc%20Data%20Rights%20Request&body=Name%3A%0AAccount%20email%3A%0ARequest%20type%20(Access%2FDeletion%2FPortability%2FCorrection%2FOther)%3A%0ADetails%3A"
                className="text-[#5A9438] hover:text-[#C9F27A]"
              >
                privacy@ummat.dev
              </a>{' '}
              with your name, account email, and request type. We respond within 45 days
              (extendable to 90 days for complex requests, with notice). Verification of your
              identity is required before we act on any request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Complaints</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-white/80">EU/EEA:</strong> Your national data protection authority
              </li>
              <li>
                <strong className="text-white/80">UK:</strong>{' '}
                <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-[#5A9438] hover:text-[#C9F27A]">
                  ico.org.uk
                </a>
              </li>
              <li>
                <strong className="text-white/80">California:</strong>{' '}
                <a href="https://cppa.ca.gov" target="_blank" rel="noopener noreferrer" className="text-[#5A9438] hover:text-[#C9F27A]">
                  cppa.ca.gov
                </a>
              </li>
            </ul>
          </section>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Related</h2>
            <ul className="space-y-1">
              <li>
                <Link href="/privacy" className="text-[#5A9438] hover:text-[#C9F27A]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/california" className="text-[#5A9438] hover:text-[#C9F27A]">
                  California Privacy Rights
                </Link>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
