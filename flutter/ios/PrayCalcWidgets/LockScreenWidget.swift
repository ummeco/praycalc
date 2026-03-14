import WidgetKit
import SwiftUI

// PrayCalcWidgets — iOS 16+ widgets for prayer times.
// Lock screen: accessoryCircular, accessoryRectangular, accessoryInline.
// Home screen: systemSmall (next prayer + countdown), systemMedium (full schedule).
// Data written by Flutter via home_widget package to AppGroup UserDefaults.

// MARK: - Timeline Entry

struct PrayerEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let nextPrayerTime: String
    let allTimes: [String: String]
    let locationName: String
}

// MARK: - Timeline Provider (Lock Screen)
// Reads individual per-prayer keys written by Flutter's IosWidgetConfig.

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
            ],
            locationName: "Mecca"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let defaults = UserDefaults(suiteName: appGroup)
        let fajr    = defaults?.string(forKey: "widget_fajr")          ?? "--:--"
        let dhuhr   = defaults?.string(forKey: "widget_dhuhr")         ?? "--:--"
        let asr     = defaults?.string(forKey: "widget_asr")           ?? "--:--"
        let maghrib = defaults?.string(forKey: "widget_maghrib")       ?? "--:--"
        let isha    = defaults?.string(forKey: "widget_isha")          ?? "--:--"
        let locationName = defaults?.string(forKey: "widget_location_name") ?? ""

        let allTimes = [
            "Fajr": fajr, "Dhuhr": dhuhr,
            "Asr": asr, "Maghrib": maghrib, "Isha": isha
        ]

        // Determine next prayer by comparing current time to stored times.
        let nextPrayer = _nextPrayer(allTimes: allTimes)

        let entry = PrayerEntry(
            date: Date(),
            nextPrayer: nextPrayer.0,
            nextPrayerTime: nextPrayer.1,
            allTimes: allTimes,
            locationName: locationName
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
        // Supports both "HH:mm" (24h) and "h:mm AM/PM" (12h) formats.
        let parts = s.split(separator: ":").map { String($0) }
        guard parts.count >= 2 else { return nil }
        guard let h = Int(parts[0]) else { return nil }
        let minAndSuffix = parts[1].trimmingCharacters(in: .whitespaces)
        let minStr = minAndSuffix.components(separatedBy: " ").first ?? minAndSuffix
        guard let m = Int(minStr) else { return nil }
        let isPM = s.uppercased().contains("PM")
        let isAM = s.uppercased().contains("AM")
        if isAM || isPM {
            let h24 = isPM ? (h == 12 ? 12 : h + 12) : (h == 12 ? 0 : h)
            return h24 * 60 + m
        }
        return h * 60 + m
    }
}

// MARK: - Timeline Provider (Home Screen)
// Reads the new widget_next_prayer / widget_next_prayer_time / widget_prayers keys
// written by Flutter's IosWidgetConfig.updateAllWidgetData().

struct HomeScreenProvider: TimelineProvider {
    let appGroup = "group.com.praycalc.app"

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            nextPrayer: "Asr",
            nextPrayerTime: "3:47 PM",
            allTimes: [
                "Fajr": "5:23 AM", "Dhuhr": "12:45 PM",
                "Asr": "3:47 PM", "Maghrib": "6:31 PM", "Isha": "7:58 PM"
            ],
            locationName: "Mecca"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let defaults = UserDefaults(suiteName: appGroup)

        let nextPrayer     = defaults?.string(forKey: "widget_next_prayer")      ?? "Fajr"
        let nextPrayerTime = defaults?.string(forKey: "widget_next_prayer_time") ?? "--:--"
        let locationName   = defaults?.string(forKey: "widget_location_name")    ?? ""

        // Parse widget_prayers JSON: [{"name":"Fajr","time":"5:23 AM","isNext":false}, ...]
        var allTimes: [String: String] = [:]
        if let jsonStr = defaults?.string(forKey: "widget_prayers"),
           let jsonData = jsonStr.data(using: .utf8),
           let arr = try? JSONSerialization.jsonObject(with: jsonData) as? [[String: Any]] {
            for item in arr {
                if let name = item["name"] as? String,
                   let time = item["time"] as? String {
                    allTimes[name] = time
                }
            }
        }

        let entry = PrayerEntry(
            date: Date(),
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            allTimes: allTimes,
            locationName: locationName
        )

        // Refresh timeline at midnight.
        let nextUpdate = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Shared helpers

private let praycalcGreen = Color(red: 0.49, green: 0.76, blue: 0.30)

/// Returns "in Xh Ym" or "in Ym" countdown string from now to an HH:mm time string.
/// Returns nil if the time cannot be parsed or is in the past.
private func countdown(to timeStr: String) -> String? {
    let parts = timeStr.split(separator: ":").map { Int($0) }
    guard parts.count == 2, let h = parts[0], let m = parts[1] else { return nil }
    let cal = Calendar.current
    let now = Date()
    let nowHour = cal.component(.hour, from: now)
    let nowMin  = cal.component(.minute, from: now)
    var diff = (h * 60 + m) - (nowHour * 60 + nowMin)
    if diff <= 0 { return nil }
    let hours = diff / 60
    let mins  = diff % 60
    if hours > 0 {
        return "in \(hours)h \(mins)m"
    } else {
        return "in \(mins)m"
    }
}

// MARK: - Lock Screen Widget Views

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

// MARK: - Home Screen Widget Views

struct HomeScreenWidgetEntryView: View {
    var entry: PrayerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            systemSmallView
        case .systemMedium:
            systemMediumView
        default:
            systemSmallView
        }
    }

    // MARK: systemSmall — next prayer + countdown
    private var systemSmallView: some View {
        VStack(alignment: .center, spacing: 4) {
            if !entry.locationName.isEmpty {
                Text(entry.locationName)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            Spacer()
            Text(entry.nextPrayer)
                .font(.title2)
                .fontWeight(.semibold)
                .foregroundColor(praycalcGreen)
                .minimumScaleFactor(0.8)
            Text(entry.nextPrayerTime)
                .font(.headline)
                .minimumScaleFactor(0.8)
            if let cd = countdown(to: entry.nextPrayerTime) {
                Text(cd)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding(10)
        .containerBackground(.background, for: .widget)
    }

    // MARK: systemMedium — full 5-prayer schedule
    private var systemMediumView: some View {
        let prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

        return VStack(alignment: .leading, spacing: 6) {
            // Header row
            HStack {
                if !entry.locationName.isEmpty {
                    Text(entry.locationName)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
                Spacer()
                Text("Prayer Times")
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }

            // Prayer columns
            HStack(spacing: 0) {
                ForEach(prayerOrder, id: \.self) { name in
                    let isNext = name == entry.nextPrayer
                    let timeStr = entry.allTimes[name] ?? "--:--"

                    VStack(spacing: 3) {
                        Text(shortName(name))
                            .font(.system(size: 10, weight: isNext ? .semibold : .regular))
                            .foregroundColor(isNext ? praycalcGreen : .secondary)
                            .lineLimit(1)
                            .minimumScaleFactor(0.6)
                        Text(timeStr)
                            .font(.system(size: 12, weight: isNext ? .bold : .regular))
                            .foregroundColor(isNext ? praycalcGreen : .primary)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 6)
                    .background(
                        isNext
                            ? praycalcGreen.opacity(0.15)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            : Color.clear
                    )
                }
            }
        }
        .padding(10)
        .containerBackground(.background, for: .widget)
    }

    private func shortName(_ name: String) -> String {
        switch name {
        case "Dhuhr":   return "Dhr"
        case "Maghrib": return "Mgh"
        default:        return name
        }
    }
}

// MARK: - Lock Screen Widget

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

// MARK: - Home Screen Widget

struct HomeScreenWidget: Widget {
    let kind = "HomeScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: HomeScreenProvider()) { entry in
            HomeScreenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Prayer Times")
        .description("Prayer schedule on your home screen.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Widget Bundle

@main
struct PrayCalcWidgets: WidgetBundle {
    var body: some Widget {
        LockScreenWidget()
        HomeScreenWidget()
    }
}
