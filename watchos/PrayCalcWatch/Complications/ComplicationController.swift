import Foundation
import WidgetKit

// MARK: - Timeline Provider

struct PrayerTimelineProvider: TimelineProvider {
    typealias Entry = PrayerTimelineEntry

    func placeholder(in context: Context) -> PrayerTimelineEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerTimelineEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder)
            return
        }

        let entry = buildEntryFromCache() ?? .placeholder
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerTimelineEntry>) -> Void) {
        fetchAndBuildTimeline { timeline in
            completion(timeline)
        }
    }

    // MARK: - Build Timeline from API

    private func fetchAndBuildTimeline(completion: @escaping (Timeline<PrayerTimelineEntry>) -> Void) {
        let latitude = UserDefaults.standard.double(forKey: "lastLatitude")
        let longitude = UserDefaults.standard.double(forKey: "lastLongitude")
        let method = UserDefaults.standard.string(forKey: "calculationMethod") ?? "isna"
        let madhab = UserDefaults.standard.string(forKey: "madhab") ?? "shafii"

        guard latitude != 0.0 && longitude != 0.0 else {
            let timeline = Timeline(
                entries: [PrayerTimelineEntry.placeholder],
                policy: .after(Date().addingTimeInterval(900))
            )
            completion(timeline)
            return
        }

        let today = todayDateString()
        let urlString =
            "https://api.praycalc.com/api/v1/times?lat=\(latitude)&lng=\(longitude)&date=\(today)&method=\(method)&madhab=\(madhab)"

        guard let url = URL(string: urlString) else {
            let timeline = Timeline(
                entries: [PrayerTimelineEntry.placeholder],
                policy: .after(Date().addingTimeInterval(900))
            )
            completion(timeline)
            return
        }

        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data, error == nil,
                let response = try? JSONDecoder().decode(PrayerResponse.self, from: data)
            else {
                if let cached = buildEntryFromCache() {
                    let timeline = Timeline(
                        entries: [cached],
                        policy: .after(Date().addingTimeInterval(900))
                    )
                    completion(timeline)
                } else {
                    let timeline = Timeline(
                        entries: [PrayerTimelineEntry.placeholder],
                        policy: .after(Date().addingTimeInterval(900))
                    )
                    completion(timeline)
                }
                return
            }

            // Cache for widget use
            UserDefaults.standard.set(data, forKey: "cachedResponse")
            UserDefaults.standard.set(today, forKey: "cachedDate")

            let entries = buildTimelineEntries(from: response)

            // Refresh at midnight
            let calendar = Calendar.current
            let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()) ?? Date()
            let midnight = calendar.startOfDay(for: tomorrow)

            let timeline = Timeline(entries: entries, policy: .after(midnight))
            completion(timeline)
        }.resume()
    }

    // MARK: - Build Entries for Each Prayer Transition

    private static func buildTimelineEntries(from response: PrayerResponse) -> [PrayerTimelineEntry] {
        buildTimelineEntries(from: response)
    }
}

// MARK: - Free Functions

private func buildTimelineEntries(from response: PrayerResponse) -> [PrayerTimelineEntry] {
    let formatter = DateFormatter()
    formatter.dateFormat = "h:mm a"

    let prayers: [(name: String, time: String)] = [
        ("Fajr", response.prayers.fajr),
        ("Dhuhr", response.prayers.dhuhr),
        ("Asr", response.prayers.asr),
        ("Maghrib", response.prayers.maghrib),
        ("Isha", response.prayers.isha),
    ]

    let allPrayers = prayers.map { ($0.name, $0.time) }
    let calendar = Calendar.current
    let now = Date()
    let todayComponents = calendar.dateComponents([.year, .month, .day], from: now)

    func makeDate(from timeString: String) -> Date? {
        guard let parsed = formatter.date(from: timeString) else { return nil }
        let tc = calendar.dateComponents([.hour, .minute], from: parsed)
        var c = DateComponents()
        c.year = todayComponents.year
        c.month = todayComponents.month
        c.day = todayComponents.day
        c.hour = tc.hour
        c.minute = tc.minute
        return calendar.date(from: c)
    }

    var entries: [PrayerTimelineEntry] = []

    // Create an entry for each prayer transition
    for i in 0..<prayers.count {
        let currentPrayer = prayers[i]
        guard let prayerDate = makeDate(from: currentPrayer.time) else { continue }

        let nextPrayer: (name: String, time: String)
        let nextDate: Date

        if i + 1 < prayers.count {
            nextPrayer = prayers[i + 1]
            nextDate = makeDate(from: nextPrayer.time) ?? prayerDate.addingTimeInterval(3600)
        } else {
            // After Isha, next is tomorrow's Fajr (approximate 10h ahead)
            nextPrayer = ("Fajr", prayers[0].time)
            nextDate = prayerDate.addingTimeInterval(36000)
        }

        let totalInterval = nextDate.timeIntervalSince(prayerDate)
        let remaining = nextDate.timeIntervalSince(prayerDate)
        let progress = 0.0  // Just starting this prayer period

        let entry = PrayerTimelineEntry(
            date: prayerDate,
            prayerName: nextPrayer.name,
            prayerTime: nextPrayer.time,
            timeRemaining: remaining,
            progress: progress,
            allPrayers: allPrayers,
            isPlaceholder: false
        )
        entries.append(entry)

        // Add a mid-point entry for smoother updates
        let midDate = prayerDate.addingTimeInterval(totalInterval / 2)
        let midRemaining = nextDate.timeIntervalSince(midDate)
        let midProgress = 0.5

        let midEntry = PrayerTimelineEntry(
            date: midDate,
            prayerName: nextPrayer.name,
            prayerTime: nextPrayer.time,
            timeRemaining: midRemaining,
            progress: midProgress,
            allPrayers: allPrayers,
            isPlaceholder: false
        )
        entries.append(midEntry)
    }

    // Add a "now" entry if we're between prayers
    let currentEntry = PrayerTimelineEntry(
        date: now,
        prayerName: response.nextPrayer.name,
        prayerTime: response.nextPrayer.time,
        timeRemaining: response.timeUntilNextPrayer() ?? 0,
        progress: {
            let total = response.totalIntervalBetweenPrayers() ?? 1
            let remaining = response.timeUntilNextPrayer() ?? 0
            return total > 0 ? (total - remaining) / total : 0
        }(),
        allPrayers: allPrayers,
        isPlaceholder: false
    )
    entries.append(currentEntry)

    return entries.sorted { $0.date < $1.date }
}

private func buildEntryFromCache() -> PrayerTimelineEntry? {
    guard let data = UserDefaults.standard.data(forKey: "cachedResponse"),
        let response = try? JSONDecoder().decode(PrayerResponse.self, from: data),
        UserDefaults.standard.string(forKey: "cachedDate") == todayDateString()
    else { return nil }

    let prayers = [
        (response.prayers.fajr, "Fajr"),
        (response.prayers.dhuhr, "Dhuhr"),
        (response.prayers.asr, "Asr"),
        (response.prayers.maghrib, "Maghrib"),
        (response.prayers.isha, "Isha"),
    ]

    let allPrayers = prayers.map { ($0.1, $0.0) }

    return PrayerTimelineEntry(
        date: Date(),
        prayerName: response.nextPrayer.name,
        prayerTime: response.nextPrayer.time,
        timeRemaining: response.timeUntilNextPrayer() ?? 0,
        progress: {
            let total = response.totalIntervalBetweenPrayers() ?? 1
            let remaining = response.timeUntilNextPrayer() ?? 0
            return total > 0 ? (total - remaining) / total : 0
        }(),
        allPrayers: allPrayers,
        isPlaceholder: false
    )
}

private func todayDateString() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: Date())
}
