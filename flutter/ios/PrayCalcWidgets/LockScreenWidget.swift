import WidgetKit
import SwiftUI

// LockScreenWidget — iOS 16+ lock screen widget for prayer times.
// Three accessory families: accessoryCircular, accessoryRectangular, accessoryInline.
// Data written by Flutter via home_widget package to AppGroup UserDefaults.

struct PrayerEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let allTimes: [String: String]
}

struct LockScreenProvider: TimelineProvider {
    let appGroup = "group.com.praycalc.app"

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            nextPrayer: "Fajr",
            nextPrayerTime: "05:23",
            allTimes: [
                "Fajr": "05:23", "Dhuhr": "12:45",
                "Asr": "15:52", "Maghrib": "18:31", "Isha": "19:58"
            ]
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let defaults = UserDefaults(suiteName: appGroup)
        let fajr    = defaults?.string(forKey: "widget_fajr")    ?? "--:--"
        let dhuhr   = defaults?.string(forKey: "widget_dhuhr")   ?? "--:--"
        let asr     = defaults?.string(forKey: "widget_asr")     ?? "--:--"
        let maghrib = defaults?.string(forKey: "widget_maghrib") ?? "--:--"
        let isha    = defaults?.string(forKey: "widget_isha")    ?? "--:--"

        let allTimes = [
            "Fajr": fajr, "Dhuhr": dhuhr,
            "Asr": asr, "Maghrib": maghrib, "Isha": isha
        ]

        // Determine next prayer by comparing current time to stored times (HH:mm).
        let nextPrayer = _nextPrayer(allTimes: allTimes)

        let entry = PrayerEntry(
            date: Date(),
            nextPrayer: nextPrayer.0,
            nextPrayerTime: nextPrayer.1,
            allTimes: allTimes
        )

        // Refresh timeline at end of day so times stay accurate.
        let nextUpdate = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func _nextPrayer(allTimes: [String: String]) -> (String, String) {
        let order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        let now = Date()
        let cal = Calendar.current
        let hour = cal.component(.hour, from: now)
        let minute = cal.component(.minute, from: now)
        let nowMinutes = hour * 60 + minute

        for name in order {
            guard let timeStr = allTimes[name],
                  let prayerMinutes = _parseTime(timeStr) else { continue }
            if prayerMinutes > nowMinutes {
                return (name, timeStr)
            }
        }
        // Wrap around to Fajr
        return ("Fajr", allTimes["Fajr"] ?? "--:--")
    }

    private func _parseTime(_ s: String) -> Int? {
        let parts = s.split(separator: ":").map { Int($0) }
        guard parts.count == 2, let h = parts[0], let m = parts[1] else { return nil }
        return h * 60 + m
    }
}

struct LockScreenWidgetEntryView: View {
    var entry: PrayerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            VStack(spacing: 2) {
                Text(entry.nextPrayer)
                    .font(.caption2)
                    .minimumScaleFactor(0.7)
                Text(entry.nextPrayerTime)
                    .font(.headline)
                    .minimumScaleFactor(0.7)
            }
        case .accessoryRectangular:
            HStack(spacing: 6) {
                ForEach(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"], id: \.self) { name in
                    VStack(spacing: 1) {
                        Text(name)
                            .font(.system(size: 8))
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                        Text(entry.allTimes[name] ?? "--:--")
                            .font(.system(size: 9, weight: .semibold))
                            .minimumScaleFactor(0.6)
                    }
                }
            }
        case .accessoryInline:
            Text("\(entry.nextPrayer) \(entry.nextPrayerTime)")
        default:
            Text("\(entry.nextPrayer) \(entry.nextPrayerTime)")
        }
    }
}

@main
struct LockScreenWidget: Widget {
    let kind = "LockScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LockScreenProvider()) { entry in
            LockScreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("Next prayer time on your lock screen.")
        .supportedFamilies([.accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}
