'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/hooks/useSession';
import type { TvDevice } from './TvSettingsPanel';

type TvScreenshotModalProps = {
  device: TvDevice;
  onClose: () => void;
};

type ScreenshotData = {
  imageUrl: string | null;
  capturedAt: string | null;
};

export default function TvScreenshotModal({ device, onClose }: TvScreenshotModalProps) {
  const { session } = useSession();
  const token = session?.tokens?.accessToken ?? '';

  const [data, setData] = useState<ScreenshotData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScreenshot = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/tvs/${device.id}/screenshot`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const body = await res.json() as ScreenshotData;
      setData(body);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load screenshot');
    } finally {
      setIsLoading(false);
    }
  }, [device.id, token]);

  useEffect(() => {
    fetchScreenshot();
  }, [fetchScreenshot]);

  async function requestCapture() {
    setIsCapturing(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/tvs/${device.id}/screenshot`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Capture request failed ${res.status}`);
      // Poll after a short delay to give the TV time to capture + upload
      await new Promise(r => setTimeout(r, 4000));
      await fetchScreenshot();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to capture screenshot');
    } finally {
      setIsCapturing(false);
    }
  }

  function minutesAgo(isoStr: string | null): string {
    if (!isoStr) return 'Unknown';
    const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff === 1) return '1 minute ago';
    return `${diff} minutes ago`;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-8"
        onClick={onClose}
      >
        <div
          className="bg-[#0D2F17] border border-[#79C24C]/20 rounded-2xl overflow-hidden max-w-3xl w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#79C24C]/10">
            <div>
              <h2 className="text-white font-bold">Current Screen</h2>
              <p className="text-white/50 text-sm">{device.deviceName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestCapture}
                disabled={isCapturing || isLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#79C24C]/20 hover:bg-[#79C24C]/30 text-[#C9F27A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isCapturing ? 'Capturing…' : 'Capture Now'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="text-white/40 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Screenshot area */}
          <div className="p-6">
            {(isLoading || isCapturing) && (
              <div className="aspect-video bg-black/30 rounded-xl flex items-center justify-center text-white/40">
                <span className="text-sm">{isCapturing ? 'Requesting capture from TV…' : 'Loading screenshot…'}</span>
              </div>
            )}

            {error && !isLoading && !isCapturing && (
              <div className="aspect-video bg-black/30 rounded-xl flex flex-col items-center justify-center text-white/40 gap-3">
                <span className="text-4xl">📺</span>
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {!isLoading && !isCapturing && !error && data && (
              data.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.imageUrl}
                  alt={`Screenshot of ${device.deviceName}`}
                  className="w-full rounded-xl aspect-video object-cover"
                />
              ) : (
                <div className="aspect-video bg-black/30 rounded-xl flex flex-col items-center justify-center text-white/40 gap-3">
                  <span className="text-6xl">📺</span>
                  <span className="text-sm">No screenshot available</span>
                  <span className="text-xs text-white/25">
                    Press &ldquo;Capture Now&rdquo; while the TV is online
                  </span>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          {data?.capturedAt && (
            <div className="px-6 pb-5 text-white/30 text-xs text-center">
              Last updated: {minutesAgo(data.capturedAt)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
