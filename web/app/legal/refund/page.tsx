import type { Metadata } from 'next'
import Link from 'next/link'

// T05-LEGAL-COUNSEL-PACK: PrayCalc Refund and Cancellation Policy
// DRAFT — counsel review pending (U-15). Do not publish before review.
// LAST_UPDATED: 2026-05-16

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — PrayCalc',
  description: 'PrayCalc refund and cancellation policy for Ummat+ premium subscriptions.',
  robots: { index: false }, // U-15 gate
}

export default function RefundPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 text-white">

        {/* Draft gate */}
        <div className="mb-8 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <strong>DRAFT — Not yet effective.</strong> Counsel copy pending (U-15). Committed for development review only.
        </div>

        <Link
          href="/legal"
          className="mb-8 inline-block text-sm text-white/40 hover:text-white/70 transition-colors"
        >
          &larr; Legal
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-[#C9F27A] sm:text-4xl">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="mt-3 mb-10 text-sm text-white/40">
          PrayCalc (praycalc.com) — Ummeco, LLC · Effective: pending counsel review
        </p>

        <div className="space-y-10 text-white/70 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">PrayCalc is Free</h2>
            <p>
              PrayCalc is <strong className="text-white/90">100% free</strong>. Prayer times,
              Qibla direction, adhan reminders, and all core features are available without
              payment or account registration.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Ummat+ Premium Features</h2>
            <p>
              Some advanced PrayCalc features (smart home integrations, TV displays, home screen
              widgets, and others) require an active <strong className="text-white/90">Ummat+</strong>{' '}
              subscription ($9.99/yr). Ummat+ is a shared subscription across the Ummat ecosystem;
              cancellation and refund terms are managed at the Ummat App level.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Cancellation</h2>
            <p>
              You may cancel your Ummat+ subscription at any time:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-white/90">iOS:</strong> Manage in Settings → Apple ID →
                Subscriptions
              </li>
              <li>
                <strong className="text-white/90">Android:</strong> Manage in Google Play →
                Subscriptions
              </li>
              <li>
                <strong className="text-white/90">Web:</strong> Account Settings → Subscription →
                Cancel Plan
              </li>
            </ul>
            <p className="mt-3">
              Cancellation takes effect at the end of your current billing period. Premium features
              remain active until then.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Refunds</h2>
            <p>
              Subscription fees are generally non-refundable. Exceptions:
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-3">
              <li>
                <strong className="text-white/90">Within 14 days of first purchase:</strong> If you
                have not used any premium features, you may request a full refund by contacting{' '}
                <a
                  href="mailto:support@ummat.dev"
                  className="text-[#5A9438] hover:text-[#C9F27A]"
                >
                  support@ummat.dev
                </a>.
              </li>
              <li>
                <strong className="text-white/90">App Store / Google Play purchases:</strong> Refund
                requests for in-app purchases are governed by Apple&apos;s or Google&apos;s refund
                policy. Contact the respective platform&apos;s support directly.
              </li>
              <li>
                <strong className="text-white/90">Billing errors:</strong> Contact us within 30 days
                of an incorrect charge.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#5A9438] mb-3">Contact</h2>
            <p>
              For billing questions or refund requests:{' '}
              <a
                href="mailto:support@ummat.dev"
                className="text-[#5A9438] hover:text-[#C9F27A]"
              >
                support@ummat.dev
              </a>
            </p>
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
                <Link href="/terms" className="text-[#5A9438] hover:text-[#C9F27A]">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </section>

        </div>
      </div>
    </main>
  )
}
