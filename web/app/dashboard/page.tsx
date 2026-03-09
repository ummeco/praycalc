'use client';

import Link from 'next/link';
import { useSession } from '@/hooks/useSession';

export default function DashboardPage() {
  const { session, hydrated, isLoggedIn } = useSession();

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Sign in to view your dashboard.</p>
          <Link href="/account" className="text-green-400 hover:underline text-sm">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    {
      title: 'TV Command Center',
      href: '/dashboard/tvs',
      description: 'Manage your prayer time displays. Control layout, adhan audio, and schedule announcements.',
      icon: '📺',
      cta: 'Manage TVs',
    },
    {
      title: 'Smart Home',
      href: '/dashboard/smart-home',
      description: 'Connect Google Home, Alexa, and other platforms to automate prayer time actions.',
      icon: '🏠',
      cta: 'Manage integrations',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-400 text-sm mb-8">
          Welcome back{session?.email ? `, ${session.email.split('@')[0]}` : ''}.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-700 transition-colors group"
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <h2 className="text-base font-semibold mb-1 group-hover:text-green-400 transition-colors">
                {s.title}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {s.description}
              </p>
              <span className="text-green-400 text-sm font-medium">{s.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
