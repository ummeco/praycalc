'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSession } from '../../lib/session';

// ── Quran data ────────────────────────────────────────────────────────────────

// IDs match everyayah.com reciter identifiers used by the TV app (kTvReciters).
const RECITERS = [
  { id: 'Sudais_192kbps', name: 'Abdul Rahman Al-Sudais', flag: '🇸🇦' },
  { id: 'Yasser_Ad-Dussary_128kbps', name: 'Yasser Al-Dosari', flag: '🇸🇦' },
  { id: 'Muhammad_Jibreel_128kbps', name: 'Muhammad Jibreel', flag: '🇸🇦' },
  { id: 'Husary_64kbps', name: 'Mahmoud Khalil Al-Hussary', flag: '🇪🇬' },
  { id: 'Minshawi_Murattal_128kbps', name: 'Mohamed Siddiq Al-Minshawi', flag: '🇪🇬' },
] as const;

// 114 surahs with names and ayah counts
const SURAHS: { number: number; nameArabic: string; nameEnglish: string; totalAyahs: number }[] = [
  { number: 1, nameArabic: 'الفاتحة', nameEnglish: 'Al-Fatihah', totalAyahs: 7 },
  { number: 2, nameArabic: 'البقرة', nameEnglish: 'Al-Baqarah', totalAyahs: 286 },
  { number: 3, nameArabic: 'آل عمران', nameEnglish: 'Ali Imran', totalAyahs: 200 },
  { number: 4, nameArabic: 'النساء', nameEnglish: 'An-Nisa', totalAyahs: 176 },
  { number: 5, nameArabic: 'المائدة', nameEnglish: 'Al-Maidah', totalAyahs: 120 },
  { number: 6, nameArabic: 'الأنعام', nameEnglish: 'Al-Anam', totalAyahs: 165 },
  { number: 7, nameArabic: 'الأعراف', nameEnglish: 'Al-Araf', totalAyahs: 206 },
  { number: 8, nameArabic: 'الأنفال', nameEnglish: 'Al-Anfal', totalAyahs: 75 },
  { number: 9, nameArabic: 'التوبة', nameEnglish: 'At-Tawbah', totalAyahs: 129 },
  { number: 10, nameArabic: 'يونس', nameEnglish: 'Yunus', totalAyahs: 109 },
  { number: 11, nameArabic: 'هود', nameEnglish: 'Hud', totalAyahs: 123 },
  { number: 12, nameArabic: 'يوسف', nameEnglish: 'Yusuf', totalAyahs: 111 },
  { number: 13, nameArabic: 'الرعد', nameEnglish: 'Ar-Rad', totalAyahs: 43 },
  { number: 14, nameArabic: 'إبراهيم', nameEnglish: 'Ibrahim', totalAyahs: 52 },
  { number: 15, nameArabic: 'الحجر', nameEnglish: 'Al-Hijr', totalAyahs: 99 },
  { number: 16, nameArabic: 'النحل', nameEnglish: 'An-Nahl', totalAyahs: 128 },
  { number: 17, nameArabic: 'الإسراء', nameEnglish: 'Al-Isra', totalAyahs: 111 },
  { number: 18, nameArabic: 'الكهف', nameEnglish: 'Al-Kahf', totalAyahs: 110 },
  { number: 19, nameArabic: 'مريم', nameEnglish: 'Maryam', totalAyahs: 98 },
  { number: 20, nameArabic: 'طه', nameEnglish: 'Ta-Ha', totalAyahs: 135 },
  { number: 21, nameArabic: 'الأنبياء', nameEnglish: 'Al-Anbiya', totalAyahs: 112 },
  { number: 22, nameArabic: 'الحج', nameEnglish: 'Al-Hajj', totalAyahs: 78 },
  { number: 23, nameArabic: 'المؤمنون', nameEnglish: 'Al-Muminun', totalAyahs: 118 },
  { number: 24, nameArabic: 'النور', nameEnglish: 'An-Nur', totalAyahs: 64 },
  { number: 25, nameArabic: 'الفرقان', nameEnglish: 'Al-Furqan', totalAyahs: 77 },
  { number: 26, nameArabic: 'الشعراء', nameEnglish: 'Ash-Shuara', totalAyahs: 227 },
  { number: 27, nameArabic: 'النمل', nameEnglish: 'An-Naml', totalAyahs: 93 },
  { number: 28, nameArabic: 'القصص', nameEnglish: 'Al-Qasas', totalAyahs: 88 },
  { number: 29, nameArabic: 'العنكبوت', nameEnglish: 'Al-Ankabut', totalAyahs: 69 },
  { number: 30, nameArabic: 'الروم', nameEnglish: 'Ar-Rum', totalAyahs: 60 },
  { number: 31, nameArabic: 'لقمان', nameEnglish: 'Luqman', totalAyahs: 34 },
  { number: 32, nameArabic: 'السجدة', nameEnglish: 'As-Sajdah', totalAyahs: 30 },
  { number: 33, nameArabic: 'الأحزاب', nameEnglish: 'Al-Ahzab', totalAyahs: 73 },
  { number: 34, nameArabic: 'سبإ', nameEnglish: 'Saba', totalAyahs: 54 },
  { number: 35, nameArabic: 'فاطر', nameEnglish: 'Fatir', totalAyahs: 45 },
  { number: 36, nameArabic: 'يس', nameEnglish: 'Ya-Sin', totalAyahs: 83 },
  { number: 37, nameArabic: 'الصافات', nameEnglish: 'As-Saffat', totalAyahs: 182 },
  { number: 38, nameArabic: 'ص', nameEnglish: 'Sad', totalAyahs: 88 },
  { number: 39, nameArabic: 'الزمر', nameEnglish: 'Az-Zumar', totalAyahs: 75 },
  { number: 40, nameArabic: 'غافر', nameEnglish: 'Ghafir', totalAyahs: 85 },
  { number: 41, nameArabic: 'فصلت', nameEnglish: 'Fussilat', totalAyahs: 54 },
  { number: 42, nameArabic: 'الشورى', nameEnglish: 'Ash-Shura', totalAyahs: 53 },
  { number: 43, nameArabic: 'الزخرف', nameEnglish: 'Az-Zukhruf', totalAyahs: 89 },
  { number: 44, nameArabic: 'الدخان', nameEnglish: 'Ad-Dukhan', totalAyahs: 59 },
  { number: 45, nameArabic: 'الجاثية', nameEnglish: 'Al-Jathiyah', totalAyahs: 37 },
  { number: 46, nameArabic: 'الأحقاف', nameEnglish: 'Al-Ahqaf', totalAyahs: 35 },
  { number: 47, nameArabic: 'محمد', nameEnglish: 'Muhammad', totalAyahs: 38 },
  { number: 48, nameArabic: 'الفتح', nameEnglish: 'Al-Fath', totalAyahs: 29 },
  { number: 49, nameArabic: 'الحجرات', nameEnglish: 'Al-Hujurat', totalAyahs: 18 },
  { number: 50, nameArabic: 'ق', nameEnglish: 'Qaf', totalAyahs: 45 },
  { number: 51, nameArabic: 'الذاريات', nameEnglish: 'Adh-Dhariyat', totalAyahs: 60 },
  { number: 52, nameArabic: 'الطور', nameEnglish: 'At-Tur', totalAyahs: 49 },
  { number: 53, nameArabic: 'النجم', nameEnglish: 'An-Najm', totalAyahs: 62 },
  { number: 54, nameArabic: 'القمر', nameEnglish: 'Al-Qamar', totalAyahs: 55 },
  { number: 55, nameArabic: 'الرحمن', nameEnglish: 'Ar-Rahman', totalAyahs: 78 },
  { number: 56, nameArabic: 'الواقعة', nameEnglish: 'Al-Waqi\'ah', totalAyahs: 96 },
  { number: 57, nameArabic: 'الحديد', nameEnglish: 'Al-Hadid', totalAyahs: 29 },
  { number: 58, nameArabic: 'المجادلة', nameEnglish: 'Al-Mujadila', totalAyahs: 22 },
  { number: 59, nameArabic: 'الحشر', nameEnglish: 'Al-Hashr', totalAyahs: 24 },
  { number: 60, nameArabic: 'الممتحنة', nameEnglish: 'Al-Mumtahanah', totalAyahs: 13 },
  { number: 61, nameArabic: 'الصف', nameEnglish: 'As-Saf', totalAyahs: 14 },
  { number: 62, nameArabic: 'الجمعة', nameEnglish: 'Al-Jumuah', totalAyahs: 11 },
  { number: 63, nameArabic: 'المنافقون', nameEnglish: 'Al-Munafiqun', totalAyahs: 11 },
  { number: 64, nameArabic: 'التغابن', nameEnglish: 'At-Taghabun', totalAyahs: 18 },
  { number: 65, nameArabic: 'الطلاق', nameEnglish: 'At-Talaq', totalAyahs: 12 },
  { number: 66, nameArabic: 'التحريم', nameEnglish: 'At-Tahrim', totalAyahs: 12 },
  { number: 67, nameArabic: 'الملك', nameEnglish: 'Al-Mulk', totalAyahs: 30 },
  { number: 68, nameArabic: 'القلم', nameEnglish: 'Al-Qalam', totalAyahs: 52 },
  { number: 69, nameArabic: 'الحاقة', nameEnglish: 'Al-Haqqah', totalAyahs: 52 },
  { number: 70, nameArabic: 'المعارج', nameEnglish: 'Al-Maarij', totalAyahs: 44 },
  { number: 71, nameArabic: 'نوح', nameEnglish: 'Nuh', totalAyahs: 28 },
  { number: 72, nameArabic: 'الجن', nameEnglish: 'Al-Jinn', totalAyahs: 28 },
  { number: 73, nameArabic: 'المزمل', nameEnglish: 'Al-Muzzammil', totalAyahs: 20 },
  { number: 74, nameArabic: 'المدثر', nameEnglish: 'Al-Muddaththir', totalAyahs: 56 },
  { number: 75, nameArabic: 'القيامة', nameEnglish: 'Al-Qiyamah', totalAyahs: 40 },
  { number: 76, nameArabic: 'الإنسان', nameEnglish: 'Al-Insan', totalAyahs: 31 },
  { number: 77, nameArabic: 'المرسلات', nameEnglish: 'Al-Mursalat', totalAyahs: 50 },
  { number: 78, nameArabic: 'النبأ', nameEnglish: 'An-Naba', totalAyahs: 40 },
  { number: 79, nameArabic: 'النازعات', nameEnglish: 'An-Naziat', totalAyahs: 46 },
  { number: 80, nameArabic: 'عبس', nameEnglish: 'Abasa', totalAyahs: 42 },
  { number: 81, nameArabic: 'التكوير', nameEnglish: 'At-Takwir', totalAyahs: 29 },
  { number: 82, nameArabic: 'الانفطار', nameEnglish: 'Al-Infitar', totalAyahs: 19 },
  { number: 83, nameArabic: 'المطففين', nameEnglish: 'Al-Mutaffifin', totalAyahs: 36 },
  { number: 84, nameArabic: 'الانشقاق', nameEnglish: 'Al-Inshiqaq', totalAyahs: 25 },
  { number: 85, nameArabic: 'البروج', nameEnglish: 'Al-Buruj', totalAyahs: 22 },
  { number: 86, nameArabic: 'الطارق', nameEnglish: 'At-Tariq', totalAyahs: 17 },
  { number: 87, nameArabic: 'الأعلى', nameEnglish: 'Al-Ala', totalAyahs: 19 },
  { number: 88, nameArabic: 'الغاشية', nameEnglish: 'Al-Ghashiyah', totalAyahs: 26 },
  { number: 89, nameArabic: 'الفجر', nameEnglish: 'Al-Fajr', totalAyahs: 30 },
  { number: 90, nameArabic: 'البلد', nameEnglish: 'Al-Balad', totalAyahs: 20 },
  { number: 91, nameArabic: 'الشمس', nameEnglish: 'Ash-Shams', totalAyahs: 15 },
  { number: 92, nameArabic: 'الليل', nameEnglish: 'Al-Layl', totalAyahs: 21 },
  { number: 93, nameArabic: 'الضحى', nameEnglish: 'Ad-Duhaa', totalAyahs: 11 },
  { number: 94, nameArabic: 'الشرح', nameEnglish: 'Ash-Sharh', totalAyahs: 8 },
  { number: 95, nameArabic: 'التين', nameEnglish: 'At-Tin', totalAyahs: 8 },
  { number: 96, nameArabic: 'العلق', nameEnglish: 'Al-Alaq', totalAyahs: 19 },
  { number: 97, nameArabic: 'القدر', nameEnglish: 'Al-Qadr', totalAyahs: 5 },
  { number: 98, nameArabic: 'البينة', nameEnglish: 'Al-Bayyinah', totalAyahs: 8 },
  { number: 99, nameArabic: 'الزلزلة', nameEnglish: 'Az-Zalzalah', totalAyahs: 8 },
  { number: 100, nameArabic: 'العاديات', nameEnglish: 'Al-Adiyat', totalAyahs: 11 },
  { number: 101, nameArabic: 'القارعة', nameEnglish: 'Al-Qariah', totalAyahs: 11 },
  { number: 102, nameArabic: 'التكاثر', nameEnglish: 'At-Takathur', totalAyahs: 8 },
  { number: 103, nameArabic: 'العصر', nameEnglish: 'Al-Asr', totalAyahs: 3 },
  { number: 104, nameArabic: 'الهمزة', nameEnglish: 'Al-Humazah', totalAyahs: 9 },
  { number: 105, nameArabic: 'الفيل', nameEnglish: 'Al-Fil', totalAyahs: 5 },
  { number: 106, nameArabic: 'قريش', nameEnglish: 'Quraysh', totalAyahs: 4 },
  { number: 107, nameArabic: 'الماعون', nameEnglish: 'Al-Maun', totalAyahs: 7 },
  { number: 108, nameArabic: 'الكوثر', nameEnglish: 'Al-Kawthar', totalAyahs: 3 },
  { number: 109, nameArabic: 'الكافرون', nameEnglish: 'Al-Kafirun', totalAyahs: 6 },
  { number: 110, nameArabic: 'النصر', nameEnglish: 'An-Nasr', totalAyahs: 3 },
  { number: 111, nameArabic: 'المسد', nameEnglish: 'Al-Masad', totalAyahs: 5 },
  { number: 112, nameArabic: 'الإخلاص', nameEnglish: 'Al-Ikhlas', totalAyahs: 4 },
  { number: 113, nameArabic: 'الفلق', nameEnglish: 'Al-Falaq', totalAyahs: 5 },
  { number: 114, nameArabic: 'الناس', nameEnglish: 'An-Nas', totalAyahs: 6 },
];

const AFTER_SURAH_OPTIONS = [
  { id: 'stop', label: 'Stop after this surah' },
  { id: 'loop', label: 'Loop this surah' },
  { id: 'continue', label: 'Continue to next surah' },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

interface NowPlaying {
  surah: number;
  ayah: number;
  isPlaying: boolean;
  reciterId?: string;
}

interface TvQuranPanelProps {
  deviceId: string;
  isOnline: boolean;
  quranVideoMode?: 'keep-video' | 'quran-display';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TvQuranPanel({ deviceId, isOnline, quranVideoMode }: TvQuranPanelProps) {
  const [reciterId, setReciterId] = useState(RECITERS[0].id as string);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayahNumber, setAyahNumber] = useState(1);
  const [afterSurah, setAfterSurah] = useState<'stop' | 'loop' | 'continue'>('continue');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const selectedSurah = SURAHS.find(s => s.number === surahNumber) ?? SURAHS[0];
  const maxAyah = selectedSurah.totalAyahs;

  // Poll now-playing state every 6 seconds when online
  const pollNowPlaying = useCallback(async () => {
    if (!isOnline) return;
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) return;
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json() as { settings?: { quranCommand?: NowPlaying } };
      const cmd = data.settings?.quranCommand;
      if (cmd && typeof cmd.surah === 'number') {
        setNowPlaying(cmd);
      }
    } catch {
      // ignore poll errors
    }
  }, [deviceId, isOnline]);

  useEffect(() => {
    void pollNowPlaying();
    const timer = setInterval(() => { void pollNowPlaying(); }, 6000);
    return () => clearInterval(timer);
  }, [pollNowPlaying]);

  async function sendCommand(action: string, extra?: Record<string, unknown>) {
    setSending(true);
    setError(null);
    const session = getSession();
    const token = session?.tokens?.accessToken;
    if (!token) { setError('Not signed in'); setSending(false); return; }
    try {
      const res = await fetch(`/api/dashboard/tvs/${deviceId}/quran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...extra }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      void pollNowPlaying();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send command');
    } finally {
      setSending(false);
    }
  }

  function handlePlay() {
    void sendCommand('play', {
      surah: surahNumber,
      ayah: ayahNumber,
      reciterId,
      afterSurah,
      backgroundMode: quranVideoMode ?? 'keep-video',
    });
  }
  function handlePause() { void sendCommand('pause'); }
  function handleResume() { void sendCommand('resume'); }
  function handleStop() { void sendCommand('stop', { restore: true }); }

  return (
    <div className="space-y-5">
      {/* Now playing bar */}
      {nowPlaying && (
        <div className="bg-[#1E5E2F]/30 border border-[#79C24C]/20 rounded-xl px-4 py-3">
          <div className="text-[#C9F27A] text-xs font-medium uppercase tracking-wide mb-1">
            {nowPlaying.isPlaying ? '▶ Now Playing' : '⏸ Paused'}
          </div>
          <div className="text-white text-sm">
            {SURAHS.find(s => s.number === nowPlaying.surah)?.nameEnglish ?? `Surah ${nowPlaying.surah}`}
            {' '}<span className="text-white/50">verse {nowPlaying.ayah}</span>
          </div>
          <div className="flex gap-2 mt-3">
            {nowPlaying.isPlaying ? (
              <button
                type="button"
                onClick={handlePause}
                disabled={sending || !isOnline}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white/70 rounded-lg text-xs transition-colors disabled:opacity-40"
              >
                ⏸ Pause
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                disabled={sending || !isOnline}
                className="px-3 py-1.5 bg-[#1E5E2F]/60 hover:bg-[#1E5E2F] text-[#C9F27A] rounded-lg text-xs transition-colors disabled:opacity-40"
              >
                ▶ Resume
              </button>
            )}
            <button
              type="button"
              onClick={handleStop}
              disabled={sending || !isOnline}
              className="px-3 py-1.5 bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 rounded-lg text-xs transition-colors disabled:opacity-40"
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      )}

      {/* Reciter */}
      <div>
        <label className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide block mb-2">Reciter</label>
        <select
          value={reciterId}
          onChange={e => setReciterId(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
        >
          {RECITERS.map(r => (
            <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
          ))}
        </select>
      </div>

      {/* Surah */}
      <div>
        <label className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide block mb-2">Surah</label>
        <select
          value={surahNumber}
          onChange={e => { setSurahNumber(Number(e.target.value)); setAyahNumber(1); }}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
        >
          {SURAHS.map(s => (
            <option key={s.number} value={s.number}>
              {s.number}. {s.nameArabic} — {s.nameEnglish} ({s.totalAyahs} verses)
            </option>
          ))}
        </select>
      </div>

      {/* Starting verse */}
      <div>
        <label className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide block mb-2">
          Starting Verse <span className="text-white/30 font-normal normal-case">(1–{maxAyah})</span>
        </label>
        <input
          type="number"
          min={1}
          max={maxAyah}
          value={ayahNumber}
          onChange={e => setAyahNumber(Math.min(maxAyah, Math.max(1, Number(e.target.value))))}
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:border-[#79C24C]/50 outline-none focus-visible:ring-2 focus-visible:ring-[#79C24C]/60"
        />
      </div>

      {/* After surah */}
      <div>
        <label className="text-[#C9F27A] text-xs font-semibold uppercase tracking-wide block mb-2">After Surah</label>
        <div className="space-y-1.5">
          {AFTER_SURAH_OPTIONS.map(opt => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer py-1">
              <input
                type="radio"
                name={`after-surah-${deviceId}`}
                value={opt.id}
                checked={afterSurah === opt.id}
                onChange={() => setAfterSurah(opt.id)}
                className="accent-[#79C24C]"
              />
              <span className="text-white/70 text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-xs">{error}</p>}

      {/* Play button */}
      <button
        type="button"
        onClick={handlePlay}
        disabled={sending || !isOnline}
        className="w-full bg-[#79C24C] hover:bg-[#C9F27A] disabled:opacity-40 text-[#0D2F17] font-semibold rounded-xl py-3 text-sm transition-colors"
      >
        {sending ? 'Sending...' : isOnline ? '▶ Play on TV' : 'TV is Offline'}
      </button>
    </div>
  );
}
