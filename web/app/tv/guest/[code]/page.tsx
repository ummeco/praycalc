import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Prayer Times — PrayCalc',
  description: 'View prayer times shared from a PrayCalc TV screen.',
};

interface GuestLocation {
  lat: number;
  lng: number;
}

async function resolveGuestCode(code: string): Promise<GuestLocation | null> {
  try {
    const res = await fetch(
      `https://smart.praycalc.com/api/v1/tv/guest/${encodeURIComponent(code)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function GuestPage({ params }: { params: { code: string } }) {
  const location = await resolveGuestCode(params.code);

  if (!location) {
    return (
      <div className="min-h-screen bg-[#0D2F17] flex items-center justify-center p-8">
        <div className="bg-[#1E5E2F]/20 border border-[#79C24C]/20 rounded-3xl p-12 max-w-md w-full text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-3">Link Expired</h1>
          <p className="text-white/60 mb-8">
            This prayer times link has expired or is no longer valid. Ask the TV to generate a new QR code.
          </p>
          <Link
            href="/"
            className="block w-full bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-lg transition-colors border border-[#79C24C]/30 text-center"
          >
            Open PrayCalc
          </Link>
        </div>
      </div>
    );
  }

  const { lat, lng } = location;
  const prayCalcUrl = `/?lat=${lat}&lng=${lng}`;

  return (
    <div className="min-h-screen bg-[#0D2F17] flex flex-col items-center justify-center p-6 gap-8">
      {/* Header */}
      <div className="text-center">
        <div className="text-5xl mb-3">🕌</div>
        <h1 className="text-3xl font-bold text-white">Prayer Times</h1>
        <p className="text-white/50 text-sm mt-1">Shared from a nearby PrayCalc TV screen</p>
      </div>

      {/* Embedded prayer times iframe */}
      <div className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#79C24C]/20 shadow-xl">
        <iframe
          src={`https://praycalc.com${prayCalcUrl}&embed=1`}
          className="w-full h-[480px] bg-[#0D2F17]"
          title="Prayer Times"
          loading="eager"
        />
      </div>

      {/* CTA */}
      <div className="text-center max-w-xs">
        <p className="text-white/50 text-sm mb-4">
          Get accurate prayer times, Qibla direction, and adhan reminders on your phone.
        </p>
        <Link
          href={`/?lat=${lat}&lng=${lng}`}
          className="block w-full bg-[#1E5E2F] hover:bg-[#79C24C]/20 text-[#C9F27A] font-bold rounded-2xl py-4 text-lg transition-colors border border-[#79C24C]/30 text-center mb-3"
        >
          Open in PrayCalc
        </Link>
        <div className="flex gap-3 justify-center">
          <a
            href="https://apps.apple.com/app/praycalc/id6449468927"
            className="flex-1 bg-black/30 hover:bg-black/50 text-white/70 rounded-xl py-3 text-sm text-center border border-white/10 transition-colors"
          >
            App Store
          </a>
          <a
            href="https://play.google.com/store/apps/details?id=com.praycalc.app"
            className="flex-1 bg-black/30 hover:bg-black/50 text-white/70 rounded-xl py-3 text-sm text-center border border-white/10 transition-colors"
          >
            Google Play
          </a>
        </div>
      </div>

      <p className="text-white/20 text-xs">praycalc.com</p>
    </div>
  );
}
