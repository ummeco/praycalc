// Dynamic OG image for each city prayer times page
// Uses @vercel/og ImageResponse — edge runtime

import { ImageResponse } from 'next/og';
import { TOP_CITIES } from '@/lib/top-cities';

export const runtime = 'edge';
export const alt = 'Prayer Times';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { city: string } }) {
  const city = TOP_CITIES.find(c => c.slug === params.city);
  const cityName = city?.name ?? 'City';
  const country = city?.country ?? '';

  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #0D2F17 0%, #1E5E2F 100%)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'serif',
      }}>
        <div style={{ color: '#C9F27A', fontSize: 28, marginBottom: 16 }}>PrayCalc</div>
        <div style={{ color: 'white', fontSize: 64, fontWeight: 'bold', textAlign: 'center' }}>
          Prayer Times
        </div>
        <div style={{ color: '#C9F27A', fontSize: 48, fontWeight: 'bold', marginTop: 8 }}>
          {cityName}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 28, marginTop: 8 }}>
          {country}
        </div>
        <div style={{
          display: 'flex', gap: 32, marginTop: 40,
          color: 'rgba(255,255,255,0.9)', fontSize: 22,
        }}>
          {['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map(p => (
            <span key={p} style={{ textAlign: 'center' }}>{p}</span>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 18, marginTop: 32 }}>
          praycalc.com
        </div>
      </div>
    ),
    { ...size }
  );
}
