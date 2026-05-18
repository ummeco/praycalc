import type { Metadata } from 'next'
import Link from 'next/link'

// S05-11: CCPA disclosure page — praycalc.com
// PrayCalc-specific: location data classified as sensitive personal info under CCPA/CPRA.
// TODO(U-15): Replace placeholder copy with counsel-reviewed text before publishing.
// DO NOT publish to prod until U-15 is resolved (TRAP-P6 do-not-publish rule).
// LAST_UPDATED: 2026-05-06

export const metadata: Metadata = {
  title: 'California Privacy Rights — PrayCalc',
  description: 'California Consumer Privacy Act (CCPA/CPRA) disclosure for PrayCalc. Location data rights and opt-out.',
  robots: { index: false }, // U-15: unpublished until counsel review
}

export default function CaliforniaPrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-white">

        {/* Draft — do not publish until U-15 resolved */}
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <strong>DRAFT — Not yet effective.</strong> Counsel copy pending (U-15). Committed for development review only. Do not link from production footers until U-15 is resolved.
        </div>

        <Link href="/privacy" className="mb-8 inline-block text-sm text-white/40 hover:text-white/70 transition-colors">
          &larr; Back to Privacy Policy
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#C9F27A] sm:text-4xl">California Privacy Rights</h1>
        <p className="mt-3 mb-4 text-sm text-white/40">
          California Consumer Privacy Rights Act (CPRA/CCPA) — Last updated: May 6, 2026
        </p>
        <p className="mb-10 text-white/70 max-w-2xl text-sm leading-relaxed">
          PrayCalc uses your location to calculate accurate prayer times and Qibla direction.
          Under the California Consumer Privacy Rights Act, <strong className="text-white/90">precise geolocation is classified as sensitive personal information</strong>.
          You have the right to limit our use of this data.
          {/* TODO(U-15): Insert full legal entity details and confirm geolocation classification with counsel. */}
        </p>

        {/* Do Not Sell — prominent */}
        <div className="mb-10 rounded-xl border border-[#1E5E2F]/40 bg-[#1E5E2F]/10 px-6 py-6">
          <h2 className="text-base font-semibold text-white mb-2">Do Not Sell or Share My Personal Information</h2>
          <p className="text-sm text-white/60 mb-4">
            {/* TODO(U-15): Confirm with counsel. */}
            Ummeco, LLC does not sell personal information, including location data, to third parties.
          </p>
          <a
            href="mailto:privacy@ummat.dev?subject=CPRA%20Opt-Out%20Request&body=Full%20name%3A%0AEmail%3A%0ARequest%3A%20Do%20not%20sell%20or%20share%20my%20personal%20information."
            className="inline-flex items-center gap-2 rounded-lg bg-[#79C24C] px-5 py-2.5 text-sm font-medium text-[#0D2F17] hover:bg-[#C9F27A] transition-colors"
          >
            Submit Opt-Out Request — privacy@ummat.dev
          </a>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Categories of Personal Information We Collect</h2>
            {/* TODO(U-15): Verify location data categories — precise vs coarse — with counsel. */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Category</th>
                    <th className="text-left py-2 pr-4 text-white/50 font-medium">Examples</th>
                    <th className="text-left py-2 text-white/50 font-medium">Collected?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Identifiers', 'Email (account), IP address', 'Yes'],
                    ['Precise geolocation (sensitive)', 'GPS coordinates used for prayer time calculation (browser API, with permission)', 'Yes — session only; not stored'],
                    ['Coarse geolocation', 'Country/region via IP (always used as fallback)', 'Yes'],
                    ['Internet activity', 'Pages viewed (aggregated analytics)', 'Yes — aggregated'],
                    ['Commercial information', 'Subscription status (Ummat+ members only)', 'Yes — members only'],
                    ['Inferences', 'No user profiles drawn from location data', 'No'],
                  ].map(([cat, ex, col]) => (
                    <tr key={cat} className="border-b border-white/5">
                      <td className="py-2 pr-4 text-white/80">{cat}</td>
                      <td className="py-2 pr-4 text-white/40">{ex}</td>
                      <td className={`py-2 font-medium text-xs ${col === 'No' ? 'text-white/30' : 'text-[#C9F27A]'}`}>{col}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Sensitive Personal Information — Location Data</h2>
            <p>
              {/* TODO(U-15): Confirm § 1798.121 right-to-limit language for geolocation with counsel. */}
              Under CPRA § 1798.121, precise geolocation is sensitive personal information. You have the right to
              limit our use of your location data to purposes strictly necessary to provide the prayer time service.
            </p>
            <p className="mt-2">
              PrayCalc accesses precise location only within your browser session (using the Geolocation API), and
              only with your explicit browser permission. Precise coordinates are not persisted to our servers.
              You can revoke location permission at any time in your browser settings.
            </p>
            <p className="mt-2">
              To limit use of your location data beyond prayer time calculation, email{' '}
              <a href="mailto:privacy@ummat.dev" className="text-[#5A9438] hover:underline">privacy@ummat.dev</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Your California Rights</h2>
            <h3 className="text-base font-semibold text-white mt-4">Right to Know</h3>
            <p>You may request disclosure of the categories and specific pieces of personal information we have collected about you.</p>
            <h3 className="text-base font-semibold text-white mt-4">Right to Delete</h3>
            <p>You may request deletion of your account and associated personal information.</p>
            <h3 className="text-base font-semibold text-white mt-4">Right to Correct</h3>
            <p>You may request correction of inaccurate personal information. Account details can be updated in settings.</p>
            <h3 className="text-base font-semibold text-white mt-4">Right to Opt-Out of Sale or Sharing</h3>
            <p>We do not sell personal information, including location data.</p>
            <h3 className="text-base font-semibold text-white mt-4">Right to Limit Use of Sensitive Personal Information</h3>
            <p>You have the right to limit use of your precise geolocation to providing the prayer time service. No additional uses apply.</p>
            <h3 className="text-base font-semibold text-white mt-4">Right to Non-Discrimination</h3>
            <p>We will not discriminate against you for exercising your CPRA rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">How to Submit a Request</h2>
            <p>Email <a href="mailto:privacy@ummat.dev" className="text-[#5A9438] hover:underline">privacy@ummat.dev</a> with subject &quot;CPRA Request&quot;. Include your full name and account email.</p>
            <p className="mt-2">We respond within 45 days (extendable to 90 days with notice).</p>
          </section>

          <section className="border-t border-white/10 pt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Related</h2>
            <ul className="space-y-1">
              <li><Link href="/privacy" className="text-[#5A9438] hover:underline">Privacy Policy</Link></li>
              <li><Link href="/preferences" className="text-[#5A9438] hover:underline">Manage Cookie Preferences</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
