import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact the PrayCalc team for support, feedback, or account deletion requests. Reach us at support@praycalc.com.',
  openGraph: {
    title: 'Contact Us | PrayCalc',
    description:
      'Get in touch with the PrayCalc team. Support, feedback, and account deletion requests.',
    url: 'https://praycalc.com/contact',
    siteName: 'PrayCalc',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-white/60">
            We&apos;re here to help with any questions, feedback, or account requests.
          </p>
        </div>

        <div className="space-y-8">
          {/* Email Support */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-2 text-xl font-semibold text-[#5A9438]">Email Support</h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              For technical support, bug reports, feature requests, or general inquiries, email us at:
            </p>
            <a
              href="mailto:support@praycalc.com"
              className="text-lg font-medium text-[#C9F27A] hover:underline transition-all"
            >
              support@praycalc.com
            </a>
            <p className="mt-3 text-sm text-white/40">
              We aim to respond within 48 hours.
            </p>
          </section>

          {/* Account Deletion */}
          <section className="rounded-2xl border border-red-500/20 bg-white/5 p-6">
            <h2 className="mb-2 text-xl font-semibold text-red-400">Account &amp; Data Deletion</h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              You have the right to delete your account and all associated data at any time.
            </p>

            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-white/90 uppercase tracking-wide">
                Option 1: Self-service
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                Sign in to PrayCalc and go to your{' '}
                <Link href="/account" className="text-[#C9F27A] hover:underline">
                  Account Settings
                </Link>
                . Select &ldquo;Delete Account&rdquo; to permanently remove your account and all data.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 text-sm font-semibold text-white/90 uppercase tracking-wide">
                Option 2: Email request
              </h3>
              <p className="text-white/70 text-sm leading-relaxed mb-3">
                Send an email to{' '}
                <a
                  href="mailto:support@praycalc.com?subject=Account%20Deletion%20Request"
                  className="text-[#C9F27A] hover:underline"
                >
                  support@praycalc.com
                </a>
                {' '}with the subject &ldquo;Account Deletion Request&rdquo; and the email address
                associated with your account.
              </p>
            </div>

            <div className="mt-4 text-sm text-white/50 space-y-2">
              <p>
                <strong className="text-white/70">What gets deleted:</strong> your account profile,
                saved locations, prayer settings, notification preferences, and any other personal
                data associated with your account.
              </p>
              <p>
                <strong className="text-white/70">Timeline:</strong> deletion requests are processed
                within 7 business days. You will receive a confirmation email once complete.
              </p>
              <p>
                <strong className="text-white/70">Irreversible:</strong> account deletion is permanent.
                Deleted data cannot be recovered.
              </p>
            </div>
          </section>

          {/* Open Source / GitHub */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-2 text-xl font-semibold text-[#5A9438]">Bug Reports &amp; Feature Requests</h2>
            <p className="mb-4 text-white/70 leading-relaxed">
              PrayCalc is open source. You can report bugs or request features on GitHub:
            </p>
            <a
              href="https://github.com/ummeco/praycalc/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#C9F27A] border border-[#79C24C]/30 rounded-xl px-4 py-2 hover:bg-[#79C24C]/10 transition-colors"
            >
              <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Open an issue on GitHub
            </a>
          </section>

          {/* About */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-2 text-xl font-semibold text-[#5A9438]">About PrayCalc</h2>
            <p className="text-white/70 leading-relaxed">
              PrayCalc is a free prayer time calculator built by{' '}
              <a
                href="https://ummat.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C9F27A] hover:underline"
              >
                Ummat.Dev
              </a>
              , a studio focused on building technology for the global Muslim community.
            </p>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-16 flex justify-center gap-6 text-sm text-white/40">
          <Link href="/privacy" className="hover:text-[#C9F27A] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#C9F27A] transition-colors">Terms of Service</Link>
          <Link href="/help" className="hover:text-[#C9F27A] transition-colors">Help & FAQ</Link>
          <Link href="/" className="hover:text-[#C9F27A] transition-colors">Back to PrayCalc</Link>
        </div>
      </div>
    </main>
  );
}
