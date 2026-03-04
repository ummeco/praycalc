import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel & Prayer Rulings",
  description:
    "Islamic rulings on prayer while traveling: shortening (Qasr), combining (Jam'), distance thresholds by madhab, and scholarly references from the Quran and Hadith.",
  keywords: [
    "travel prayer",
    "Qasr",
    "shortening prayer",
    "combining prayers",
    "Jam Taqdim",
    "Jam Takhir",
    "Islamic travel",
    "Salah travel",
    "PrayCalc",
  ],
  openGraph: {
    title: "Travel & Prayer Rulings | PrayCalc",
    description:
      "Islamic rulings on prayer while traveling, with Quran and Hadith references.",
    url: "https://praycalc.com/travel",
  },
  alternates: {
    canonical: "https://praycalc.com/travel",
  },
};

interface Citation {
  source: string;
  number?: string;
  text: string;
  type: "quran" | "hadith";
}

interface Section {
  title: string;
  content: string[];
  bullets?: string[];
  footnote?: string;
  citations?: Citation[];
}

const sections: Section[] = [
  {
    title: "When Does Travel Apply?",
    content: [
      "The concessions for travelers begin once you depart your city and travel beyond the minimum distance threshold. Scholars differ on the exact distance:",
    ],
    bullets: [
      "Hanafi: approximately 77 km (48 miles)",
      "Shafi'i and Hanbali: approximately 80 km (50 miles)",
      "Maliki: any distance considered customary travel",
    ],
    footnote:
      "PrayCalc uses the Hanafi threshold of 77 km by default. All four schools agree that air travel, road travel, and sea travel qualify equally.",
  },
  {
    title: "Shortening Prayers (Qasr)",
    content: [
      "When traveling, the four-rakat prayers are reduced to two:",
    ],
    bullets: [
      "Dhuhr: 4 rakat shortened to 2",
      "Asr: 4 rakat shortened to 2",
      "Isha: 4 rakat shortened to 2",
    ],
    footnote:
      "Fajr (2 rakat) and Maghrib (3 rakat) remain unchanged during travel. The Sunnah prayers (nawafil) before and after the obligatory prayers may be omitted while traveling, except for the Fajr Sunnah and Witr.",
    citations: [
      {
        source: "Quran",
        number: "An-Nisa' 4:101",
        text: '"And when you travel in the land, there is no sin on you if you shorten the prayer, if you fear that those who disbelieve may put you in trial."',
        type: "quran",
      },
      {
        source: "Sahih Bukhari",
        number: "1102",
        text: "The Prophet \uFDFA would shorten the prayer while traveling, praying two rakat for Dhuhr, Asr, and Isha.",
        type: "hadith",
      },
    ],
  },
  {
    title: "Combining Prayers (Jam')",
    content: ["During travel, prayers may be combined in two ways:"],
    bullets: [
      "Jam' Taqdim (combining early): pray Dhuhr and Asr together at Dhuhr time, or Maghrib and Isha together at Maghrib time.",
      "Jam' Ta'khir (combining late): delay Dhuhr to Asr time and pray them together, or delay Maghrib to Isha time and pray them together.",
    ],
    footnote:
      "Fajr is never combined with another prayer. The Hanafi school permits combining only at Arafat and Muzdalifah during Hajj, while the other three schools permit it for any qualifying travel.",
    citations: [
      {
        source: "Sahih Muslim",
        number: "705",
        text: "Ibn 'Abbas reported that the Messenger of Allah \uFDFA combined Dhuhr and Asr, and Maghrib and Isha, while traveling.",
        type: "hadith",
      },
      {
        source: "Sahih Muslim",
        number: "686",
        text: "The Prophet \uFDFA used to combine Dhuhr and Asr, and Maghrib and Isha while traveling.",
        type: "hadith",
      },
    ],
  },
  {
    title: "Duration of Travel",
    content: [
      "The travel concession ends when you return home or settle in a location with the intention to stay. Scholars differ on when a traveler must resume full prayers:",
    ],
    bullets: [
      "Hanafi: 15 days or more of intended stay",
      "Shafi'i and Maliki: 4 days of intended stay (excluding arrival and departure days)",
      "Hanbali: more than 4 days of intended stay",
    ],
    footnote:
      "If you are unsure how long you will stay, you may continue shortening prayers until you make a firm decision to settle. Most scholars recommend resuming full prayers after 15 days as a precaution.",
    citations: [
      {
        source: "Sahih Bukhari",
        number: "1107",
        text: "The Prophet \uFDFA stayed in Makkah for 19 days, shortening his prayers. When we stay 19 days, we shorten; if longer, we pray in full.",
        type: "hadith",
      },
    ],
  },
];

const allReferences = [
  {
    source: "Quran, An-Nisa' 4:101",
    description: "Permission to shorten prayer during travel",
  },
  {
    source: "Sahih Muslim 686",
    description: "Combining prayers during travel",
  },
  {
    source: "Sahih Muslim 705",
    description:
      "Ibn 'Abbas on combining Dhuhr+Asr and Maghrib+Isha",
  },
  {
    source: "Sahih Bukhari 1102",
    description: "Shortening prayer during travel",
  },
  {
    source: "Sahih Bukhari 1107",
    description: "Duration of travel concession",
  },
];

function CitationCard({ citation }: { citation: Citation }) {
  const isQuran = citation.type === "quran";

  return (
    <div
      className={`rounded-xl border p-4 ${
        isQuran
          ? "border-[#79C24C]/30 bg-[#1E5E2F]/30"
          : "border-white/10 bg-white/5"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">
          {isQuran ? "\uD83D\uDCD6" : "\uD83D\uDCDD"}
        </span>
        <span
          className={`text-sm font-semibold ${
            isQuran ? "text-[#C9F27A]" : "text-[#79C24C]"
          }`}
        >
          {citation.source} {citation.number}
        </span>
      </div>
      <p
        className={`text-sm italic leading-relaxed ${
          isQuran ? "text-[#C9F27A]/85" : "text-white/70"
        }`}
      >
        {citation.text}
      </p>
    </div>
  );
}

export default function TravelPage() {
  return (
    <main className="min-h-screen bg-[#0D2F17]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-[#C9F27A] sm:text-4xl">
            Travel &amp; Prayer
          </h1>
          <p className="mt-3 text-white/60">
            Islamic rulings on prayer while traveling, with scholarly references
            from the Quran and authentic Hadith collections.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 text-xl font-semibold text-[#79C24C]">
                {section.title}
              </h2>

              {/* Main content card */}
              <div className="rounded-xl bg-white/5 p-5">
                {section.content.map((paragraph, i) => (
                  <p key={i} className="text-white leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && (
                  <ul className="mt-3 space-y-2">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-white">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#79C24C]" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.footnote && (
                  <p className="mt-4 text-sm text-white/50 leading-relaxed">
                    {section.footnote}
                  </p>
                )}
              </div>

              {/* Citations */}
              {section.citations && section.citations.length > 0 && (
                <div className="mt-3 space-y-3">
                  {section.citations.map((citation) => (
                    <CitationCard
                      key={`${citation.source}-${citation.number}`}
                      citation={citation}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Scholarly References Summary */}
          <section>
            <h2 className="mb-4 text-xl font-semibold text-[#79C24C]">
              Scholarly References
            </h2>
            <div className="rounded-xl bg-white/5 p-5">
              <div className="divide-y divide-white/10">
                {allReferences.map((ref) => (
                  <div key={ref.source} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium text-white">{ref.source}</p>
                    <p className="mt-0.5 text-sm text-white/50">
                      {ref.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 flex justify-center gap-6 text-sm text-white/40">
          <a href="/help" className="transition-colors hover:text-[#C9F27A]">
            Help &amp; FAQ
          </a>
          <a href="/" className="transition-colors hover:text-[#C9F27A]">
            Back to PrayCalc
          </a>
        </div>
      </div>
    </main>
  );
}
