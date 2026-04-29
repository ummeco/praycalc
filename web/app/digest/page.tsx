'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DigestPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/v1/digest/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Check your email to confirm your subscription!');
      } else {
        setStatus('error');
        setMessage(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">📬</div>
      <h1 className="text-3xl font-bold text-green-900 mb-2">Weekly Prayer Times Digest</h1>
      <p className="text-gray-600 mb-8">
        Every Monday: next week&apos;s prayer times for your location, Hijri calendar, and an inspirational ayah.
        Free. Unsubscribe anytime.
      </p>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-green-900 font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="border border-green-200 rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus-visible:ring-2 focus-visible:ring-green-600"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-green-800 text-white py-3 rounded-xl font-semibold hover:bg-green-900 disabled:opacity-50 transition-colors">
            {status === 'loading' ? 'Subscribing...' : 'Subscribe for Free'}
          </button>
          {status === 'error' && (
            <p className="text-red-600 text-sm">{message}</p>
          )}
        </form>
      )}

      <p className="text-xs text-gray-400 mt-6">
        No spam. One email per week.{' '}
        <Link href="/digest/unsubscribe" className="underline">Unsubscribe</Link> anytime.
      </p>
    </main>
  );
}
