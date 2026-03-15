// PrayCalcTV — Quran data models
// Reciters and sample ayahs for the TV Quran player.

import Foundation

// MARK: - Reciter

struct Reciter: Identifiable {
    let id: String       // everyayah.com folder name
    let name: String
    let arabicName: String
}

let builtInReciters: [Reciter] = [
    Reciter(id: "Alafasy_128kbps",                       name: "Mishary Rashid Alafasy",    arabicName: "مشاري راشد العفاسي"),
    Reciter(id: "AbdulSamad_64kbps_QuranExplorer.com",   name: "Abdul Basit Abdul Samad",   arabicName: "عبد الباسط عبد الصمد"),
    Reciter(id: "Abdurrahmaan_As-Sudais_192kbps",        name: "Abdul Rahman Al-Sudais",    arabicName: "عبد الرحمن السديس"),
    Reciter(id: "Minshawy_Murattal_128kbps",             name: "Mohamed Siddiq Al-Minshawi",arabicName: "محمد صديق المنشاوي"),
    Reciter(id: "Husary_128kbps",                        name: "Mahmoud Khalil Al-Husary",  arabicName: "محمود خليل الحصري"),
]

// MARK: - Ayah

struct Ayah: Identifiable {
    let id = UUID()
    let surahNumber: Int
    let ayahNumber: Int
    let arabic: String
    let surahName: String
    let translation: String
}

let sampleAyahs: [Ayah] = [
    Ayah(surahNumber: 1, ayahNumber: 1,
         arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
         surahName: "Al-Fatihah",
         translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful."),
    Ayah(surahNumber: 1, ayahNumber: 2,
         arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
         surahName: "Al-Fatihah",
         translation: "All praise is due to Allah, Lord of the worlds."),
    Ayah(surahNumber: 1, ayahNumber: 3,
         arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
         surahName: "Al-Fatihah",
         translation: "The Entirely Merciful, the Especially Merciful."),
    Ayah(surahNumber: 1, ayahNumber: 4,
         arabic: "مَالِكِ يَوْمِ الدِّينِ",
         surahName: "Al-Fatihah",
         translation: "Sovereign of the Day of Recompense."),
    Ayah(surahNumber: 1, ayahNumber: 5,
         arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
         surahName: "Al-Fatihah",
         translation: "It is You we worship and You we ask for help."),
    Ayah(surahNumber: 1, ayahNumber: 6,
         arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
         surahName: "Al-Fatihah",
         translation: "Guide us to the straight path."),
    Ayah(surahNumber: 1, ayahNumber: 7,
         arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
         surahName: "Al-Fatihah",
         translation: "The path of those upon whom You have bestowed favor, not of those who have evoked anger or gone astray."),
    Ayah(surahNumber: 2, ayahNumber: 255,
         arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
         surahName: "Al-Baqarah",
         translation: "Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep."),
    Ayah(surahNumber: 112, ayahNumber: 1,
         arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
         surahName: "Al-Ikhlas",
         translation: "Say: He is Allah, the One."),
    Ayah(surahNumber: 112, ayahNumber: 2,
         arabic: "اللَّهُ الصَّمَدُ",
         surahName: "Al-Ikhlas",
         translation: "Allah, the Eternal Refuge."),
    Ayah(surahNumber: 112, ayahNumber: 3,
         arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
         surahName: "Al-Ikhlas",
         translation: "He neither begets nor is born."),
    Ayah(surahNumber: 112, ayahNumber: 4,
         arabic: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
         surahName: "Al-Ikhlas",
         translation: "Nor is there to Him any equivalent."),
]

// MARK: - Audio URL builder

extension Reciter {
    /// Returns the everyayah.com MP3 URL for a given surah + ayah.
    func audioURL(surah: Int, ayah: Int) -> URL? {
        let s = String(format: "%03d", surah)
        let a = String(format: "%03d", ayah)
        return URL(string: "https://everyayah.com/data/\(id)/\(s)\(a).mp3")
    }
}
