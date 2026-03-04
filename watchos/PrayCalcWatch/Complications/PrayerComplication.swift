import SwiftUI
import WidgetKit

// MARK: - Timeline Entry

struct PrayerTimelineEntry: TimelineEntry {
    let date: Date
    let prayerName: String
    let prayerTime: String
    let timeRemaining: TimeInterval
    let progress: Double
    let allPrayers: [(name: String, time: String)]
    let isPlaceholder: Bool

    static var placeholder: PrayerTimelineEntry {
        PrayerTimelineEntry(
            date: Date(),
            prayerName: "Dhuhr",
            prayerTime: "12:30 PM",
            timeRemaining: 3600,
            progress: 0.5,
            allPrayers: [
                ("Fajr", "5:42 AM"),
                ("Dhuhr", "12:30 PM"),
                ("Asr", "3:45 PM"),
                ("Maghrib", "6:15 PM"),
                ("Isha", "7:45 PM"),
            ],
            isPlaceholder: true
        )
    }
}

// MARK: - Brand Colors

private let brandGreen = Color(red: 0x79 / 255.0, green: 0xC2 / 255.0, blue: 0x4C / 255.0)
private let accentGreen = Color(red: 0xC9 / 255.0, green: 0xF2 / 255.0, blue: 0x7A / 255.0)
private let deepGreen = Color(red: 0x0D / 255.0, green: 0x2F / 255.0, blue: 0x17 / 255.0)

// MARK: - Countdown Helpers

private func formatCountdown(_ interval: TimeInterval) -> String {
    if interval <= 0 { return "Now" }
    let hours = Int(interval) / 3600
    let minutes = (Int(interval) % 3600) / 60
    if hours > 0 {
        return "\(hours)h \(minutes)m"
    }
    return "\(minutes)m"
}

private func abbreviatePrayer(_ name: String) -> String {
    switch name.lowercased() {
    case "fajr": return "FJR"
    case "dhuhr": return "DHR"
    case "asr": return "ASR"
    case "maghrib": return "MGH"
    case "isha": return "ISH"
    default: return String(name.prefix(3)).uppercased()
    }
}

// MARK: - Circular Small

struct CircularSmallView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            Text(abbreviatePrayer(entry.prayerName))
                .font(.system(.body, design: .rounded))
                .fontWeight(.bold)
                .foregroundColor(brandGreen)
        }
    }
}

// MARK: - Graphic Circular (Countdown Ring)

struct GraphicCircularView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()

            ProgressView(value: entry.progress)
                .progressViewStyle(.circular)
                .tint(brandGreen)

            VStack(spacing: 0) {
                Text(abbreviatePrayer(entry.prayerName))
                    .font(.system(size: 10, weight: .bold, design: .rounded))
                Text(formatCountdown(entry.timeRemaining))
                    .font(.system(size: 9, weight: .medium, design: .monospaced))
            }
        }
    }
}

// MARK: - Graphic Rectangular

struct GraphicRectangularView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.prayerName)
                    .font(.system(.headline, design: .rounded))
                    .foregroundColor(brandGreen)

                Text(entry.prayerTime)
                    .font(.system(.body, design: .monospaced))

                Text(formatCountdown(entry.timeRemaining))
                    .font(.system(.caption, design: .rounded))
                    .foregroundColor(.gray)
            }

            Spacer()

            ZStack {
                Circle()
                    .stroke(deepGreen, lineWidth: 3)
                    .frame(width: 36, height: 36)

                Circle()
                    .trim(from: 0, to: entry.progress)
                    .stroke(brandGreen, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .frame(width: 36, height: 36)
                    .rotationEffect(.degrees(-90))
            }
        }
        .padding(.horizontal, 4)
    }
}

// MARK: - Graphic Corner

struct GraphicCornerView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        VStack(alignment: .trailing, spacing: 0) {
            Text(entry.prayerName)
                .font(.system(.caption2, design: .rounded))
                .foregroundColor(brandGreen)
            Text(entry.prayerTime)
                .font(.system(.caption, design: .monospaced))
                .fontWeight(.medium)
        }
    }
}

// MARK: - Modular Small

struct ModularSmallView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        VStack(spacing: 2) {
            Text(abbreviatePrayer(entry.prayerName))
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundColor(brandGreen)
            Text(entry.prayerTime)
                .font(.system(size: 12, weight: .medium, design: .monospaced))
                .minimumScaleFactor(0.7)
        }
    }
}

// MARK: - Modular Large (All 5 Prayers)

struct ModularLargeView: View {
    let entry: PrayerTimelineEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            ForEach(Array(entry.allPrayers.enumerated()), id: \.offset) { _, prayer in
                HStack {
                    Text(prayer.name)
                        .font(.system(.caption2, design: .rounded))
                        .fontWeight(prayer.name == entry.prayerName ? .bold : .regular)
                        .foregroundColor(prayer.name == entry.prayerName ? brandGreen : .white)

                    Spacer()

                    Text(prayer.time)
                        .font(.system(.caption2, design: .monospaced))
                        .foregroundColor(prayer.name == entry.prayerName ? brandGreen : .gray)
                }
            }
        }
        .padding(.horizontal, 4)
    }
}

// MARK: - Widget

struct PrayerComplicationWidget: Widget {
    let kind: String = "PrayerComplication"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimelineProvider()) { entry in
            PrayerComplicationEntryView(entry: entry)
        }
        .configurationDisplayName("PrayCalc")
        .description("Prayer times and countdown.")
        .supportedFamilies([
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryCorner,
            .accessoryInline,
        ])
    }
}

// MARK: - Entry View (routes to correct family)

struct PrayerComplicationEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: PrayerTimelineEntry

    var body: some View {
        switch family {
        case .accessoryCircular:
            GraphicCircularView(entry: entry)
        case .accessoryRectangular:
            GraphicRectangularView(entry: entry)
        case .accessoryCorner:
            GraphicCornerView(entry: entry)
        case .accessoryInline:
            Text("\(entry.prayerName) \(entry.prayerTime)")
        default:
            GraphicCircularView(entry: entry)
        }
    }
}

// MARK: - Widget Bundle

@main
struct PrayCalcWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerComplicationWidget()
    }
}
