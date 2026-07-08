// Purpose: iOS WidgetKit home-screen + lock-screen widget for PrayCalc — reads a JSON
//   payload (city + the full day's remaining prayer occurrences) written by the RN app
//   into App Group UserDefaults, and renders the next prayer. The TimelineProvider emits
//   ONE entry per remaining prayer so the widget advances at each prayer time locally
//   (refresh policy .atEnd) without waking the app between refreshes. Supports the two
//   home-screen families (small/medium) PLUS the three lock-screen accessory families
//   (.accessoryCircular/.accessoryRectangular/.accessoryInline), which also power the
//   iOS 17+ StandBy nightstand widget stack.
// Inputs: UserDefaults(suiteName: appGroup)["nextPrayerWidget"] — a JSON string of
//   PrayerPayload (see the RN IosWidgetPayload type in src/widgets/widgetTaskHandler.ts).
// Outputs: NextPrayerWidgetBundle (the @main entry) with home + accessory families and
//   the NextPrayerLiveActivity (see NextPrayerLiveActivity.swift).
// Constraints: appGroup MUST match app.json ios.entitlements + expo-target.config.js.
//   Brand colors are pulled from the generated asset catalog (Color("WidgetBackground"),
//   Color("WidgetAccent")) with hardcoded fallbacks so a missing asset never blanks the
//   widget. No-data / no-location state shows "Open PrayCalc". Accessory families render
//   monochrome (the system tints them) so they stay legible on any lock-screen wallpaper.
// SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets

import WidgetKit
import SwiftUI

// MARK: - App Group

/// Must match app.json `ios.entitlements` and targets/next-prayer-widget/expo-target.config.js.
private let appGroup = "group.com.praycalc.praycalcApp"
/// Key the RN side writes the JSON payload under (HomeWidgetStub.writeWidgetData / iOS branch).
private let payloadKey = "nextPrayerWidget"

// MARK: - Payload model (mirrors IosWidgetPayload in widgetTaskHandler.ts)

private struct PrayerOccurrence: Decodable {
    let name: String
    /// Epoch milliseconds.
    let timestamp: Double
}

private struct PrayerPayload: Decodable {
    let cityName: String?
    let entries: [PrayerOccurrence]
    let generatedAt: Double
}

// MARK: - Timeline entry

struct NextPrayerEntry: TimelineEntry {
    let date: Date
    let prayerName: String?
    let prayerTime: Date?
    let cityName: String?
    /// True when no location/payload exists yet — render the "Open PrayCalc" state.
    let isPlaceholder: Bool
}

// MARK: - Brand colors (fallbacks match src/constants/colors.ts DarkColors)

private extension Color {
    static let widgetBackground = Color("WidgetBackground", bundle: nil, fallback: Color(red: 0.051, green: 0.184, blue: 0.090)) // #0D2F17
    static let widgetAccent = Color("WidgetAccent", bundle: nil, fallback: Color(red: 0.788, green: 0.949, blue: 0.478)) // #C9F27A

    /// Color(named:) that never traps if the asset is missing from the catalog.
    init(_ name: String, bundle: Bundle?, fallback: Color) {
        if UIColor(named: name) != nil {
            self = Color(name)
        } else {
            self = fallback
        }
    }
}

// MARK: - Provider

struct NextPrayerProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextPrayerEntry {
        NextPrayerEntry(date: Date(), prayerName: "Fajr", prayerTime: Date(), cityName: "—", isPlaceholder: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (NextPrayerEntry) -> Void) {
        completion(currentEntry(now: Date()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<NextPrayerEntry>) -> Void) {
        let now = Date()
        guard let payload = loadPayload() else {
            // No location configured — single "Open PrayCalc" entry, refreshed periodically.
            let entry = NextPrayerEntry(date: now, prayerName: nil, prayerTime: nil, cityName: nil, isPlaceholder: true)
            let refresh = Calendar.current.date(byAdding: .hour, value: 6, to: now) ?? now.addingTimeInterval(21600)
            completion(Timeline(entries: [entry], policy: .after(refresh)))
            return
        }

        // Build one timeline entry per remaining prayer. Each entry's `date` is when it
        // becomes current: the first shows immediately (now), and every subsequent entry
        // starts at the PREVIOUS prayer's time (so once a prayer passes, the widget flips
        // to the following one). This lets WidgetKit advance the display locally.
        let occurrences = payload.entries
            .map { (name: $0.name, time: Date(timeIntervalSince1970: $0.timestamp / 1000.0)) }
            .filter { $0.time > now }
            .sorted { $0.time < $1.time }

        guard !occurrences.isEmpty else {
            let entry = NextPrayerEntry(date: now, prayerName: nil, prayerTime: nil, cityName: payload.cityName, isPlaceholder: true)
            completion(Timeline(entries: [entry], policy: .atEnd))
            return
        }

        var entries: [NextPrayerEntry] = []
        for (index, occ) in occurrences.enumerated() {
            // The entry pointing at occ becomes visible either now (first) or the moment
            // the previous prayer arrives.
            let startDate = index == 0 ? now : occurrences[index - 1].time
            entries.append(
                NextPrayerEntry(
                    date: startDate,
                    prayerName: occ.name,
                    prayerTime: occ.time,
                    cityName: payload.cityName,
                    isPlaceholder: false
                )
            )
        }

        // .atEnd: after the last prayer entry's window, WidgetKit asks for a fresh
        // timeline — by then the app (or a background refresh) has usually re-written
        // tomorrow's payload; if not, the terminal tomorrow-Fajr entry still reads right.
        completion(Timeline(entries: entries, policy: .atEnd))
    }

    private func currentEntry(now: Date) -> NextPrayerEntry {
        guard let payload = loadPayload() else {
            return NextPrayerEntry(date: now, prayerName: nil, prayerTime: nil, cityName: nil, isPlaceholder: true)
        }
        let next = payload.entries
            .map { (name: $0.name, time: Date(timeIntervalSince1970: $0.timestamp / 1000.0)) }
            .filter { $0.time > now }
            .sorted { $0.time < $1.time }
            .first
        guard let next else {
            return NextPrayerEntry(date: now, prayerName: nil, prayerTime: nil, cityName: payload.cityName, isPlaceholder: true)
        }
        return NextPrayerEntry(date: now, prayerName: next.name, prayerTime: next.time, cityName: payload.cityName, isPlaceholder: false)
    }

    private func loadPayload() -> PrayerPayload? {
        guard
            let defaults = UserDefaults(suiteName: appGroup),
            let raw = defaults.string(forKey: payloadKey),
            let data = raw.data(using: .utf8),
            let payload = try? JSONDecoder().decode(PrayerPayload.self, from: data)
        else {
            return nil
        }
        return payload
    }
}

// MARK: - View

struct NextPrayerWidgetView: View {
    var entry: NextPrayerEntry
    @Environment(\.widgetFamily) private var family

    private var timeString: String {
        guard let t = entry.prayerTime else { return "" }
        let f = DateFormatter()
        f.dateFormat = "h:mm a"
        return f.string(from: t)
    }

    var body: some View {
        switch family {
        // Lock-screen + StandBy accessory families render monochrome; the system applies
        // its own vibrancy/tint so we must NOT paint a brand background here.
        case .accessoryCircular:
            accessoryCircular
        case .accessoryRectangular:
            accessoryRectangular
        case .accessoryInline:
            accessoryInline
        default:
            ZStack {
                Color.widgetBackground
                content
                    .padding(family == .systemSmall ? 12 : 16)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
            }
            .widgetBackgroundCompat(Color.widgetBackground)
        }
    }

    // MARK: Lock-screen / StandBy accessory presentations

    /// Circular gauge-style: prayer initial + a live relative countdown beneath it.
    @ViewBuilder
    private var accessoryCircular: some View {
        AccessoryWidgetBackgroundCompat {
            VStack(spacing: 0) {
                if let name = entry.prayerName, !entry.isPlaceholder {
                    Text(String(name.prefix(1)))
                        .font(.system(size: 15, weight: .heavy))
                    if let t = entry.prayerTime {
                        Text(t, style: .timer)
                            .font(.system(size: 9, weight: .semibold))
                            .monospacedDigit()
                            .multilineTextAlignment(.center)
                            .minimumScaleFactor(0.5)
                    }
                } else {
                    Image(systemName: "moon.stars.fill").font(.system(size: 15))
                }
            }
        }
    }

    /// Rectangular: prayer name on top, big time, and a relative countdown line — the
    /// richest lock-screen family and the one StandBy shows in its widget stack.
    @ViewBuilder
    private var accessoryRectangular: some View {
        if let name = entry.prayerName, !entry.isPlaceholder {
            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 3) {
                    Image(systemName: "moon.stars.fill").font(.system(size: 11, weight: .bold))
                    Text(name).font(.system(size: 14, weight: .heavy)).lineLimit(1)
                }
                Text(timeString).font(.system(size: 13, weight: .semibold)).lineLimit(1)
                if let t = entry.prayerTime {
                    Text(t, style: .relative)
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .widgetAccentableCompat()
        } else {
            Label("Open PrayCalc", systemImage: "moon.stars.fill")
                .font(.system(size: 13, weight: .semibold))
        }
    }

    /// Inline: a single line above the lock-screen clock ("Fajr in 12m" style).
    @ViewBuilder
    private var accessoryInline: some View {
        if let name = entry.prayerName, !entry.isPlaceholder, let t = entry.prayerTime {
            // The `\(name) \(Text(...))` interpolation keeps the countdown live.
            Text("\(name) \(Text(t, style: .relative))")
        } else if let name = entry.prayerName, !entry.isPlaceholder {
            Text("\(name) \(timeString)")
        } else {
            Label("PrayCalc", systemImage: "moon.stars.fill")
        }
    }

    @ViewBuilder
    private var content: some View {
        if entry.isPlaceholder || entry.prayerName == nil {
            VStack(alignment: .center, spacing: 6) {
                Text("Next Prayer")
                    .font(.caption).bold()
                    .foregroundColor(.widgetAccent)
                Text("Open PrayCalc")
                    .font(.headline)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        } else {
            VStack(alignment: .leading, spacing: 3) {
                Text("NEXT PRAYER")
                    .font(.system(size: 11, weight: .bold))
                    .kerning(1)
                    .foregroundColor(.widgetAccent.opacity(0.9))
                Text(entry.prayerName ?? "")
                    .font(.system(size: family == .systemSmall ? 20 : 24, weight: .heavy))
                    .foregroundColor(.widgetAccent)
                Text(timeString)
                    .font(.system(size: family == .systemSmall ? 26 : 34, weight: .bold))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                if let city = entry.cityName, !city.isEmpty {
                    Text(city)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                        .lineLimit(1)
                }
                if let t = entry.prayerTime {
                    Text(t, style: .relative)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.widgetAccent.opacity(0.8))
                        .lineLimit(1)
                }
            }
        }
    }
}

private extension View {
    /// containerBackground (iOS 17+) with a graceful fallback for the 16.x floor.
    @ViewBuilder
    func widgetBackgroundCompat(_ color: Color) -> some View {
        if #available(iOS 17.0, *) {
            containerBackground(for: .widget) { color }
        } else {
            self
        }
    }

    /// widgetAccentable (iOS 16+) — lets the system tint the accented portion of an
    /// accessory widget while keeping the rest at default vibrancy.
    @ViewBuilder
    func widgetAccentableCompat() -> some View {
        if #available(iOS 16.0, *) {
            widgetAccentable()
        } else {
            self
        }
    }
}

/// The standard translucent capsule behind an `.accessoryCircular` gauge, with a plain
/// fallback if the API is unavailable. Keeps the circular family legible on the lock screen.
private struct AccessoryWidgetBackgroundCompat<Content: View>: View {
    @ViewBuilder let content: () -> Content
    var body: some View {
        if #available(iOS 16.0, *) {
            content().background(AccessoryWidgetBackground())
        } else {
            content()
        }
    }
}

// MARK: - Widget

struct NextPrayerWidget: Widget {
    let kind = "NextPrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: NextPrayerProvider()) { entry in
            NextPrayerWidgetView(entry: entry)
        }
        .configurationDisplayName("Next Prayer")
        .description("Shows the next prayer time and city at a glance.")
        // Home-screen families PLUS the three lock-screen accessory families (iOS 16+),
        // which also surface in the iOS 17+ StandBy nightstand widget stack.
        .supportedFamilies(Self.supportedFamilies)
    }

    /// Home families always; accessory (lock-screen + StandBy) families on iOS 16+.
    private static var supportedFamilies: [WidgetFamily] {
        var families: [WidgetFamily] = [.systemSmall, .systemMedium]
        if #available(iOS 16.0, *) {
            families += [.accessoryCircular, .accessoryRectangular, .accessoryInline]
        }
        return families
    }
}

@main
struct NextPrayerWidgetBundle: WidgetBundle {
    var body: some Widget {
        NextPrayerWidget()
        // ActivityKit Live Activity (Dynamic Island + lock-screen banner). Guarded to
        // iOS 16.1+ where ActivityConfiguration exists.
        if #available(iOS 16.1, *) {
            NextPrayerLiveActivity()
        }
    }
}
