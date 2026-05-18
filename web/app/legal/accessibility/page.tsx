import type { Metadata } from 'next'
import Link from 'next/link'

// A11Y-T05: VPAT 2.5 accessibility statement + issue reporting form
// LAST_UPDATED: 2026-05-18

export const metadata: Metadata = {
  title: 'Accessibility — PrayCalc',
  description: 'PrayCalc accessibility conformance report and how to report accessibility issues.',
}

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="min-h-screen" style={{ backgroundColor: '#0D2F17' }}>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <Link href="/" className="mb-6 inline-block text-sm text-white/40 hover:text-white/70 transition-colors">
            ← Back to PrayCalc
          </Link>
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Accessibility</h1>
          <p className="mt-3 text-sm text-white/40">Last updated: May 18, 2026</p>
        </div>

        <div className="space-y-10 text-white/70 leading-relaxed">

          <section aria-labelledby="commitment-heading">
            <h2 id="commitment-heading" className="mb-3 text-xl font-semibold text-[#5A9438]">Our Commitment</h2>
            <p>
              PrayCalc is committed to ensuring digital accessibility for people with disabilities.
              We continually improve the user experience for everyone and apply relevant
              accessibility standards.
            </p>
          </section>

          <section aria-labelledby="conformance-heading">
            <h2 id="conformance-heading" className="mb-3 text-xl font-semibold text-[#5A9438]">Conformance Status</h2>
            <p className="mb-3">
              PrayCalc (<a href="https://praycalc.com" className="text-[#5A9438] underline">praycalc.com</a>) aims
              to conform to <strong className="text-white/90">WCAG 2.2 Level AA</strong>.
            </p>
            <p>
              <strong className="text-white/90">Current status:</strong> Partially conformant. Some areas
              are being improved as part of our ongoing accessibility programme (P9 sprint, May 2026).
            </p>
          </section>

          <section aria-labelledby="known-issues-heading">
            <h2 id="known-issues-heading" className="mb-3 text-xl font-semibold text-[#5A9438]">Known Issues</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Some icon-only buttons may lack visible accessible names</li>
              <li>Keyboard navigation improvements are in progress for complex widgets</li>
              <li>Some interactive components may not announce state changes to screen readers</li>
            </ul>
          </section>

          <section aria-labelledby="report-heading">
            <h2 id="report-heading" className="mb-3 text-xl font-semibold text-[#5A9438]">Report an Accessibility Issue</h2>
            <p className="mb-6">
              We welcome feedback on the accessibility of PrayCalc. Please let us know if you encounter
              accessibility barriers.
            </p>

            <form
              action="https://formspree.io/f/accessibility-ummat"
              method="POST"
              className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-6"
              aria-label="Accessibility issue report form"
            >
              <input type="hidden" name="_subject" value="Accessibility issue — PrayCalc" />

              <div>
                <label htmlFor="a11y-name" className="mb-1.5 block text-sm font-medium text-white/80">
                  Name <span className="text-white/40">(optional)</span>
                </label>
                <input
                  id="a11y-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/30 focus:border-[#5A9438] focus:outline-none focus:ring-2 focus:ring-[#5A9438]/40"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="a11y-email" className="mb-1.5 block text-sm font-medium text-white/80">
                  Email <span className="text-white/40">(so we can follow up)</span>
                </label>
                <input
                  id="a11y-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/30 focus:border-[#5A9438] focus:outline-none focus:ring-2 focus:ring-[#5A9438]/40"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="a11y-url" className="mb-1.5 block text-sm font-medium text-white/80">
                  Page URL where the issue occurs
                </label>
                <input
                  id="a11y-url"
                  name="url"
                  type="url"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/30 focus:border-[#5A9438] focus:outline-none focus:ring-2 focus:ring-[#5A9438]/40"
                  placeholder="https://praycalc.com/..."
                />
              </div>

              <div>
                <label htmlFor="a11y-assistive-tech" className="mb-1.5 block text-sm font-medium text-white/80">
                  Assistive technology used <span className="text-white/40">(optional)</span>
                </label>
                <input
                  id="a11y-assistive-tech"
                  name="assistive_tech"
                  type="text"
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/30 focus:border-[#5A9438] focus:outline-none focus:ring-2 focus:ring-[#5A9438]/40"
                  placeholder="e.g. NVDA, VoiceOver, JAWS, keyboard only"
                />
              </div>

              <div>
                <label htmlFor="a11y-description" className="mb-1.5 block text-sm font-medium text-white/80">
                  Describe the accessibility barrier <span aria-hidden="true" className="text-red-400">*</span>
                  <span className="sr-only">(required)</span>
                </label>
                <textarea
                  id="a11y-description"
                  name="description"
                  required
                  rows={5}
                  className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-white placeholder-white/30 focus:border-[#5A9438] focus:outline-none focus:ring-2 focus:ring-[#5A9438]/40"
                  placeholder="What were you trying to do? What happened? What did you expect?"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#1E5E2F] px-4 py-2.5 font-medium text-white hover:bg-[#267a3e] focus:outline-none focus:ring-2 focus:ring-[#5A9438] focus:ring-offset-2 focus:ring-offset-[#07180d] transition-colors"
              >
                Submit report
              </button>

              <p className="text-xs text-white/40">
                You can also email us directly at{' '}
                <a href="mailto:accessibility@ummat.dev" className="text-[#5A9438] underline">
                  accessibility@ummat.dev
                </a>
                . We aim to respond within 2 business days.
              </p>
            </form>
          </section>

          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="mb-3 text-xl font-semibold text-[#5A9438]">Contact</h2>
            <p>Accessibility team: <a href="mailto:accessibility@ummat.dev" className="text-[#5A9438] underline">accessibility@ummat.dev</a></p>
          </section>

        </div>
      </div>
    </main>
  )
}
