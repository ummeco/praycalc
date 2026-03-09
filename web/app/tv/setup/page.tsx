import type { Metadata } from 'next';
import TvSetupClient from './TvSetupClient';

export const metadata: Metadata = {
  title: 'Set Up PrayCalc on Your TV',
  description: 'Install PrayCalc on your Android TV or Fire TV, pair it with your account, and control it from your phone or dashboard.',
};

export default function TvSetupPage() {
  return <TvSetupClient />;
}
