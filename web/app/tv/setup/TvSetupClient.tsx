'use client';

import { useState } from 'react';
import Link from 'next/link';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.praycalc.app';
const APK_URL = 'https://praycalc.com/apk/praycalc-tv-latest.apk';

type Tab = 'Install' | 'Sign In' | 'Control';

export default function TvSetupClient() {
  const [activeTab, setActiveTab] = useState<Tab>('Install');

  return (
    <div className="min-h-screen bg-[#0D2F17] text-white">
      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-8">
        <div className="text-[#C9F27A] text-sm font-medium mb-3 tracking-wide uppercase">PrayCalc for TV</div>
        <h1 className="text-4xl font-bold mb-4">Set up your TV display</h1>
        <p className="text-white/60 text-lg leading-relaxed">
          Turn any Android TV or Fire TV into a full-featured prayer time display for your home or masjid.
          Takes about 5 minutes.
        </p>
      </div>

      {/* Tab bar */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex gap-1 bg-white/5 rounded-2xl p-1 w-fit">
          {(['Install', 'Sign In', 'Control'] as Tab[]).map((tab, i) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab
                  ? 'bg-[#1E5E2F] text-[#C9F27A] shadow'
                  : 'text-white/50 hover:text-white/80'}
              `}
            >
              <span className="text-base">{['1', '2', '3'][i]}</span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        {activeTab === 'Install' && <InstallTab />}
        {activeTab === 'Sign In' && <SignInTab />}
        {activeTab === 'Control' && <ControlTab />}
      </div>

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="bg-[#1E5E2F]/30 border border-[#79C24C]/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-white mb-1">Already set up?</div>
            <div className="text-white/50 text-sm">Manage your TVs and push settings from the dashboard.</div>
          </div>
          <Link
            href="/dashboard/tvs"
            className="flex-shrink-0 bg-[#79C24C] hover:bg-[#C9F27A] text-[#0D2F17] font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            Open TV Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Install tab ──────────────────────────────────────────────────────────────

function InstallTab() {
  return (
    <div className="space-y-8">
      <Section title="Option A — Google Play Store" badge="Recommended">
        <Steps steps={[
          {
            icon: '📺',
            title: 'Open the Play Store on your TV',
            body: 'On your Android TV or Google TV, navigate to the Play Store using your remote.',
          },
          {
            icon: '🔍',
            title: 'Search for PrayCalc',
            body: 'Type "PrayCalc" in the search bar and select the app with the green crescent icon.',
          },
          {
            icon: '⬇️',
            title: 'Install',
            body: 'Press Install and wait for the download. The app is free.',
            action: { label: 'View on Play Store', href: PLAY_STORE_URL },
          },
        ]} />
      </Section>

      <Section title="Option B — Amazon Fire TV">
        <Steps steps={[
          {
            icon: '🔍',
            title: 'Search on your Fire TV',
            body: 'From the Fire TV home screen, use the search icon and type "PrayCalc".',
          },
          {
            icon: '⬇️',
            title: 'Install from Appstore',
            body: 'Select PrayCalc from results and press Get to install.',
          },
        ]} />
      </Section>

      <Section title="Option C — Sideload APK" badge="Advanced">
        <Steps steps={[
          {
            icon: '⚙️',
            title: 'Enable Unknown Sources',
            body: 'On your TV, go to Settings → Security → Unknown Sources and enable it.',
          },
          {
            icon: '📱',
            title: 'Download on your phone',
            body: 'Download the APK to your phone, then transfer to your TV via USB or a file sharing app.',
            action: { label: 'Download APK', href: APK_URL },
          },
          {
            icon: '📂',
            title: 'Install with a file manager',
            body: 'Open the APK file on your TV using a file manager app (e.g., ES File Explorer) and select Install.',
          },
        ]} />
      </Section>
    </div>
  );
}

// ── Sign In tab ──────────────────────────────────────────────────────────────

function SignInTab() {
  return (
    <div className="space-y-8">
      <Section title="Option A — Pair from your phone" badge="Easiest">
        <Steps steps={[
          {
            icon: '📱',
            title: 'Open PrayCalc on your phone',
            body: 'Go to Settings → TV Management → Pair a New TV.',
          },
          {
            icon: '📺',
            title: 'Open PrayCalc on your TV',
            body: 'Launch the app and select "Pair with Phone" from the setup screen.',
          },
          {
            icon: '📷',
            title: 'Scan the QR code',
            body: 'Point your phone camera at the QR code shown on the TV screen. The pairing completes automatically.',
          },
        ]} />
      </Section>

      <Section title="Option B — Enter code at praycalc.com">
        <Steps steps={[
          {
            icon: '📺',
            title: 'Note the 6-character code',
            body: 'On the TV setup screen, select "Sign in with a Code". A 6-character code appears.',
          },
          {
            icon: '💻',
            title: 'Visit praycalc.com/tv/activate',
            body: 'On any browser, go to praycalc.com/tv/activate and sign in if prompted.',
            action: { label: 'Open Activate Page', href: '/tv/activate' },
          },
          {
            icon: '✅',
            title: 'Enter the code',
            body: 'Type the 6-character code and click Activate. Your TV links to your account instantly.',
          },
        ]} />
      </Section>

      <Section title="Option C — Sign in with Google on TV" badge="For masjid setup">
        <Steps steps={[
          {
            icon: '📺',
            title: 'Choose Google Sign-In on TV',
            body: 'From the TV setup screen, select "Sign in with Google". Your TV\'s Google account picker opens.',
          },
          {
            icon: '✅',
            title: 'Select your account',
            body: 'Pick the Google account linked to your PrayCalc subscription. The TV links automatically — no phone needed.',
          },
        ]} />
      </Section>
    </div>
  );
}

// ── Control tab ──────────────────────────────────────────────────────────────

function ControlTab() {
  return (
    <div className="space-y-8">
      <Section title="D-pad remote">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: '← →', action: 'Navigate menus' },
            { key: '↑ ↓', action: 'Scroll / change surah' },
            { key: 'OK', action: 'Select / pause' },
            { key: 'Back', action: 'Return / stop playback' },
            { key: 'Home', action: 'Go to prayer times screen' },
            { key: 'Long OK', action: 'Open reciter selector' },
          ].map(item => (
            <div key={item.key} className="bg-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <code className="bg-white/10 text-[#C9F27A] text-sm font-mono px-2 py-0.5 rounded flex-shrink-0">{item.key}</code>
              <span className="text-white/70 text-sm">{item.action}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Phone app remote">
        <Steps steps={[
          {
            icon: '📱',
            title: 'Open TV Management',
            body: 'In the PrayCalc mobile app, tap Settings → TV Management.',
          },
          {
            icon: '📺',
            title: 'Select your TV',
            body: 'Your paired TVs appear in a list. Tap one to open its remote control panel.',
          },
          {
            icon: '🎛️',
            title: 'Control from your phone',
            body: 'Change prayer calculation method, start Quran recitation, switch modes, and push settings — all from your phone.',
          },
        ]} />
      </Section>

      <Section title="Web dashboard">
        <Steps steps={[
          {
            icon: '💻',
            title: 'Sign in at praycalc.com',
            body: 'Visit praycalc.com and sign in with your account.',
          },
          {
            icon: '📺',
            title: 'Open TV Dashboard',
            body: 'Go to Dashboard → Paired TVs to see all your connected displays.',
            action: { label: 'Open TV Dashboard', href: '/dashboard/tvs' },
          },
          {
            icon: '⚙️',
            title: 'Push settings',
            body: 'Click Settings on any TV card to change layout, audio mode, city, and more. Changes apply instantly.',
          },
        ]} />
      </Section>

      <Section title="macOS menu bar">
        <p className="text-white/60 text-sm leading-relaxed">
          The PrayCalc macOS menu bar app shows your paired TVs and lets you push settings from your Mac.
          Download from the <Link href="/download" className="text-[#C9F27A] hover:underline">downloads page</Link>.
        </p>
      </Section>
    </div>
  );
}

// ── Shared components ────────────────────────────────────────────────────────

function Section({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {badge && (
          <span className="text-xs bg-[#1E5E2F]/60 text-[#C9F27A] border border-[#79C24C]/30 rounded-full px-2.5 py-0.5">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

interface StepItem {
  icon: string;
  title: string;
  body: string;
  action?: { label: string; href: string };
}

function Steps({ steps }: { steps: StepItem[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#1E5E2F]/50 flex items-center justify-center text-lg border border-[#79C24C]/20">
            {step.icon}
          </div>
          <div className="pt-1 min-w-0">
            <div className="font-medium text-white mb-1">{step.title}</div>
            <div className="text-white/60 text-sm leading-relaxed">{step.body}</div>
            {step.action && (
              <a
                href={step.action.href}
                className="inline-block mt-2 text-[#C9F27A] text-sm hover:underline"
                target={step.action.href.startsWith('http') ? '_blank' : undefined}
                rel={step.action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {step.action.label} →
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
