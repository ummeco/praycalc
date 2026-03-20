import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us - PrayCalc',
  description: 'Get in touch with the PrayCalc team. Support, feedback, and account deletion requests.',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">Contact Us</h1>
          <p className="mt-3 text-white/60">We&apos;re here to help with any questions or feedback.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact Methods */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-xl font-semibold text-[#79C24C]">Email Support</h2>
              <p className="mb-4 text-white/70 leading-relaxed">
                For technical support, bug reports, or general inquiries, please email us at:
              </p>
              <a 
                href="mailto:support@praycalc.com" 
                className="text-lg font-medium text-[#C9F27A] hover:underline transition-all"
              >
                support@praycalc.com
              </a>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 border-red-500/20">
              <h2 className="mb-2 text-xl font-semibold text-red-400">Account Deletion</h2>
              <p className="mb-4 text-white/70 leading-relaxed">
                If you would like to delete your account and all associated data, you can do so in your 
                <Link href="/account" className="text-[#C9F27A] hover:underline mx-1">Account Settings</Link> 
                while logged in.
              </p>
              <p className="text-white/70 leading-relaxed mb-4">
                Alternatively, you can request account deletion by emailing our privacy team:
              </p>
              <a 
                href="mailto:privacy@praycalc.com?subject=Account Deletion Request" 
                className="text-lg font-medium text-[#C9F27A] hover:underline transition-all"
              >
                privacy@praycalc.com
              </a>
            </section>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-xl font-semibold text-[#79C24C]">Ummat Ecosystem</h2>
              <p className="text-white/70 leading-relaxed">
                PrayCalc is part of the <a href="https://ummat.dev" target="_blank" rel="noopener noreferrer" className="text-[#C9F27A] hover:underline">Ummat</a> project, 
                a suite of tools for the modern Muslim.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="mb-2 text-xl font-semibold text-[#79C24C]">Mailing Address</h2>
              <p className="text-white/70 leading-relaxed">
                Unity Development<br />
                1600 Amphitheatre Parkway<br />
                Mountain View, CA 94043
              </p>
            </section>
          </div>
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
