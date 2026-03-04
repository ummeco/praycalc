'use client';

import { useState } from 'react';
import type { Metadata } from 'next';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: 'Getting Started',
    items: [
      {
        question: 'How do I use PrayCalc?',
        answer:
          'Search for your city or tap the GPS button to detect your location. PrayCalc calculates accurate prayer times based on your coordinates using astronomical algorithms. You can view today\'s times, browse monthly calendars, check the Qibla direction, and more.',
      },
      {
        question: 'Which browsers are supported?',
        answer:
          'PrayCalc works on all modern browsers: Chrome 89+, Firefox 90+, Safari 15+, and Edge 89+. It is a Progressive Web App (PWA), so you can install it on your device for offline access.',
      },
      {
        question: 'How do I install PrayCalc on my phone?',
        answer:
          'On iOS, open praycalc.com in Safari, tap the Share button, then "Add to Home Screen." On Android, open praycalc.com in Chrome, tap the three-dot menu, then "Install app" or "Add to Home Screen." You can also download the native app from the App Store or Google Play.',
      },
      {
        question: 'Is PrayCalc free?',
        answer:
          'PrayCalc is 100% free for prayer times, Qibla direction, calendars, and offline use. Premium features like smart home integration, TV display mode, and advanced widgets are available with an Ummat+ subscription.',
      },
    ],
  },
  {
    title: 'Prayer Times',
    items: [
      {
        question: 'What calculation methods are supported?',
        answer:
          'PrayCalc supports six major calculation methods: ISNA (Islamic Society of North America), MWL (Muslim World League), Egyptian General Authority of Survey, Umm al-Qura (Saudi Arabia), Institute of Geophysics University of Tehran, and University of Islamic Sciences Karachi. Each method uses different angles for Fajr and Isha calculations.',
      },
      {
        question: 'Why do my prayer times differ from my local masjid?',
        answer:
          'Masjids may use different calculation methods, apply manual adjustments, or follow seasonal conventions. PrayCalc uses precise astronomical calculations based on the NREL Solar Position Algorithm. Check your settings to match the calculation method your masjid uses. The most common methods in North America are ISNA, in the Middle East Umm al-Qura, and in South Asia Karachi.',
      },
      {
        question: 'What is the difference between Hanafi and Shafii Asr?',
        answer:
          'The Shafii (standard) method calculates Asr when the shadow of an object equals its length plus the shadow at noon. The Hanafi method uses twice the length, resulting in a later Asr time. If you follow the Hanafi school, enable "Hanafi Asr" in Settings.',
      },
      {
        question: 'How accurate are the prayer times?',
        answer:
          'PrayCalc uses the NREL Solar Position Algorithm (SPA), which provides solar position accuracy within 0.0003 degrees. Times are accurate to within one minute for any location on Earth. The algorithm accounts for atmospheric refraction, observer elevation, and the equation of time.',
      },
      {
        question: 'What is Qiyam time?',
        answer:
          'Qiyam (night prayer) time is the last third of the night, calculated between Isha and the next Fajr. This is the recommended time for Tahajjud prayer.',
      },
    ],
  },
  {
    title: 'Smart Home',
    items: [
      {
        question: 'How do I set up Google Home with PrayCalc?',
        answer:
          'Open the Google Home app, go to Settings, then "Works with Google." Search for "PrayCalc" and link your Ummat+ account. Once linked, you can say "Hey Google, ask PrayCalc for prayer times" or "Hey Google, when is Maghrib?"',
      },
      {
        question: 'How do I set up Amazon Alexa?',
        answer:
          'Open the Alexa app, go to Skills & Games, and search for "PrayCalc." Enable the skill and link your Ummat+ account. Then say "Alexa, ask PrayCalc for today\'s prayer times" or "Alexa, ask PrayCalc when is the next prayer?"',
      },
      {
        question: 'How do I set up Home Assistant?',
        answer:
          'Install the PrayCalc integration from HACS (Home Assistant Community Store). Add the integration in Settings, enter your location coordinates, and configure your preferred calculation method. PrayCalc sensors will appear for each prayer time, and you can use them in automations.',
      },
      {
        question: 'My smart home device is not responding to prayer time queries.',
        answer:
          'First, verify your Ummat+ subscription is active in Account settings. Then check that your account is linked in the device app (Google Home or Alexa). Try unlinking and relinking your account. Make sure your device has an internet connection and try restarting it.',
      },
      {
        question: 'Can I automate my lights to dim at prayer times?',
        answer:
          'Yes. With Home Assistant, create an automation triggered by the PrayCalc prayer time sensor. For example, you can dim lights 5 minutes before Maghrib or turn on a specific light at Fajr. See the Home Assistant blueprints on praycalc.org for ready-made automation recipes.',
      },
    ],
  },
  {
    title: 'Subscription & Billing',
    items: [
      {
        question: 'What features are included in Ummat+?',
        answer:
          'Ummat+ includes smart home integration (Google Home, Alexa, Siri, Home Assistant), TV display mode for masjids and homes, advanced home screen widgets, watch complications (Apple Watch, Wear OS), cross-device sync, and priority support.',
      },
      {
        question: 'How much does Ummat+ cost?',
        answer:
          'Ummat+ pricing is shown on the upgrade page. We offer monthly and yearly plans. The yearly plan includes a discount compared to monthly billing.',
      },
      {
        question: 'How do I cancel my subscription?',
        answer:
          'Go to Account, then "Manage Subscription." This opens your payment provider\'s portal (Stripe, App Store, or Google Play) where you can cancel. Your premium features remain active until the end of your current billing period.',
      },
      {
        question: 'How do I restore a purchase on a new device?',
        answer:
          'Sign in with the same account you used to subscribe. On iOS, go to Account and tap "Restore Purchase." On Android, your subscription is tied to your Google account and restores automatically when you sign in.',
      },
    ],
  },
  {
    title: 'Technical',
    items: [
      {
        question: 'Does PrayCalc work offline?',
        answer:
          'Yes. PrayCalc caches prayer times for your saved cities using a Service Worker and IndexedDB. Once you visit a city page, prayer times are available offline for that month. The mobile app calculates times entirely on-device and works without any internet connection.',
      },
      {
        question: 'How is my location data handled?',
        answer:
          'Your location is used only to calculate prayer times and is never sold or shared with third parties. GPS coordinates are processed locally in your browser or app. If you create an account, your saved cities are synced to our servers (encrypted in transit) so you can access them across devices.',
      },
      {
        question: 'Is there an API for developers?',
        answer:
          'Yes. The PrayCalc Smart API provides prayer times via a REST endpoint. Send a GET request to /api/v1/times with lat, lng, date, method, and madhab parameters. See the API documentation at praycalc.org for full details, including webhook registration for real-time prayer notifications.',
      },
      {
        question: 'How do I subscribe to prayer times via iCal?',
        answer:
          'In the mobile app, go to the Calendar tab and tap the share button. Select "Export iCal" to generate a .ics file with prayer times for the current month or year. You can import this into Apple Calendar, Google Calendar, or any calendar app that supports iCal format.',
      },
    ],
  },
  {
    title: 'Troubleshooting',
    items: [
      {
        question: 'Why are my prayer times wrong?',
        answer:
          'Check these in order: (1) Verify your city is correct by searching again. (2) Confirm the calculation method matches what your masjid uses. (3) Check if Hanafi Asr is enabled when it should be, or vice versa. (4) Clear your browser cache and reload. Prayer times can differ by a few minutes between methods; this is expected.',
      },
      {
        question: 'GPS is not detecting my location.',
        answer:
          'Make sure location services are enabled in your device settings. In your browser, allow location access for praycalc.com. On iOS, go to Settings, Privacy, Location Services. On Android, go to Settings, Location. If GPS still does not work, search for your city manually.',
      },
      {
        question: 'Notifications are not firing on my phone.',
        answer:
          'Check that notifications are enabled for PrayCalc in your device settings. On Android, make sure battery optimization is disabled for PrayCalc (Settings, Battery, Battery optimization, All apps, PrayCalc, Don\'t optimize). On iOS, verify notifications are enabled in Settings, Notifications, PrayCalc. Restart the app after changing permissions.',
      },
      {
        question: 'The app is using too much battery.',
        answer:
          'PrayCalc uses background services for prayer notifications and widget updates. If battery usage is excessive, try reducing widget update frequency in Settings or disabling the persistent notification shade on Android. The foreground service updates every 60 seconds by default.',
      },
      {
        question: 'I forgot my account password.',
        answer:
          'On the sign-in page, tap "Forgot password?" and enter your email address. A password reset link will be sent to your email. If you do not receive it, check your spam folder. Contact support if you still cannot access your account.',
      },
      {
        question: 'How do I report a bug or request a feature?',
        answer:
          'Use the "Send feedback" option in the app menu, or email support at the address listed on praycalc.org. Include your device model, OS version, and a description of the issue. Screenshots are helpful.',
      },
    ],
  },
];

function AccordionItem({ item }: { item: FAQItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-4 text-left text-white hover:text-[#C9F27A] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="pr-4 font-medium">{item.question}</span>
        <svg
          className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="pb-4 text-white/70 leading-relaxed">
          {item.answer}
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">
            Help & FAQ
          </h1>
          <p className="mt-3 text-white/60">
            Answers to common questions about PrayCalc
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-10">
          {faqSections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-semibold text-[#79C24C]">
                {section.title}
              </h2>
              <div className="rounded-xl bg-white/5 px-5">
                {section.items.map((item) => (
                  <AccordionItem key={item.question} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact section */}
        <div className="mt-16 rounded-xl bg-white/5 p-8 text-center">
          <h2 className="text-xl font-semibold text-[#C9F27A]">
            Still need help?
          </h2>
          <p className="mt-2 text-white/60">
            Could not find what you were looking for? Reach out to us.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href="mailto:support@praycalc.com"
              className="inline-flex items-center rounded-lg bg-[#79C24C] px-6 py-3 font-medium text-[#0D2F17] transition-colors hover:bg-[#C9F27A]"
            >
              Email Support
            </a>
            <a
              href="https://praycalc.org"
              className="inline-flex items-center rounded-lg border border-white/20 px-6 py-3 font-medium text-white transition-colors hover:border-[#79C24C] hover:text-[#C9F27A]"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Footer nav */}
        <div className="mt-12 flex justify-center gap-6 text-sm text-white/40">
          <a href="/privacy" className="hover:text-[#C9F27A] transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-[#C9F27A] transition-colors">
            Terms of Service
          </a>
          <a href="/" className="hover:text-[#C9F27A] transition-colors">
            Back to PrayCalc
          </a>
        </div>
      </div>
    </main>
  );
}
