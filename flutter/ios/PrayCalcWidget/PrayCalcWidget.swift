// PrayCalcWidget — WidgetKit Extension
import WidgetKit
import SwiftUI

struct PrayCalcEntry: TimelineEntry {
    let date: Date
    let nextPrayer: String
    let countdown: String
    let prayerTime: String
}

struct PrayCalcProvider: TimelineProvider {
    func placeholder(in context: Context) -> PrayCalcEntry {
        PrayCalcEntry(date: Date(), nextPrayer: "Asr", countdown: "2:14", prayerTime: "3:45 PM")
    }
    func getSnapshot(in context: Context, completion: @escaping (PrayCalcEntry) -> ()) {
        completion(readEntry())
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayCalcEntry>) -> ()) {
        let entry = readEntry()
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 5, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
    private func readEntry() -> PrayCalcEntry {
        let defaults = UserDefaults(suiteName: "group.com.praycalc.app")
        return PrayCalcEntry(
            date: Date(),
            nextPrayer: defaults?.string(forKey: "widget_next_prayer") ?? "Prayer",
            countdown: defaults?.string(forKey: "widget_countdown") ?? "--:--",
            prayerTime: defaults?.string(forKey: "widget_prayer_time") ?? ""
        )
    }
}

struct PrayCalcWidgetView: View {
    var entry: PrayCalcEntry
    @Environment(\.widgetFamily) var family
    var body: some View {
        switch family {
        case .systemSmall: SmallWidgetView(entry: entry)
        case .systemMedium: MediumWidgetView(entry: entry)
        default: SmallWidgetView(entry: entry)
        }
    }
}

struct SmallWidgetView: View {
    var entry: PrayCalcEntry
    var body: some View {
        VStack(spacing: 4) {
            Text("🕌").font(.title2)
            Text(entry.nextPrayer).font(.headline).foregroundColor(.white).bold()
            Text("in \(entry.countdown)").font(.subheadline).foregroundColor(.white.opacity(0.8))
            if !entry.prayerTime.isEmpty {
                Text(entry.prayerTime).font(.caption).foregroundColor(.white.opacity(0.6))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(Color(red: 0.118, green: 0.369, blue: 0.184), for: .widget)
    }
}

struct MediumWidgetView: View {
    var entry: PrayCalcEntry
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 6) {
                Text("🕌 PrayCalc").font(.caption).bold().foregroundColor(.white)
                Divider().background(Color.white.opacity(0.3))
                Text("Next: \(entry.nextPrayer)").font(.headline).foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                Text("in \(entry.countdown)").font(.subheadline).foregroundColor(.white)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(Color(red: 0.118, green: 0.369, blue: 0.184), for: .widget)
    }
}

@main
struct PrayCalcWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayCalcWidgetExtension()
    }
}

struct PrayCalcWidgetExtension: Widget {
    let kind: String = "PrayCalcWidget"
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayCalcProvider()) { entry in
            PrayCalcWidgetView(entry: entry)
        }
        .configurationDisplayName("PrayCalc")
        .description("See your next prayer time at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
