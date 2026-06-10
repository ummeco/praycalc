// PrayCalcWatch/Views/ComplicationView.swift
// SwiftUI complication views for 5 CLKComplicationFamily types.
// Spec §3.2, S19-D T18
//
// Families:
//   .circularSmall        — ProgressArc + prayer initial
//   .modularSmall         — next prayer name + time stacked
//   .modularLarge         — prayer name, time, countdown (3 rows)
//   .graphicCorner        — ProgressArc in corner with prayer abbreviation
//   .graphicRectangular   — prayer name + countdown + all 5 dots
//
// ComplicationController.swift handles the CLKComplicationDataSource wiring
// (timeline, refresh). This file provides the SwiftUI views used by
// CLKComplicationTemplateGraphic* templates (watchOS 5+).
//
// ProgressArc: uses a watchOS-compatible re-implementation (no Flutter dependency).

import SwiftUI
import ClockKit

// MARK: - ProgressArc (watchOS re-implementation)

/// Circular progress arc — watchOS-native (no Flutter dependency).
/// Mirrors the Flutter progress_arc.dart contract.
private struct WatchProgressArc: View {
    let progress: Double
    var color: Color = Color(red: 0.788, green: 0.949, blue: 0.478)
    var strokeWidth: CGFloat = 2.5

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.2), lineWidth: strokeWidth)
            Circle()
                .trim(from: 0, to: CGFloat(progress.clamped(to: 0...1)))
                .stroke(color, style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

// MARK: - Complication data model

struct ComplicationData {
    let nextPrayer: String       // "Asr"
    let nextPrayerTime: String   // "3:47 PM"
    let countdown: String        // "in 2h 17m"
    let progress: Double         // 0.0–1.0
    let completedPrayers: [String]

    static let placeholder = ComplicationData(
        nextPrayer: "Asr",
        nextPrayerTime: "3:47 PM",
        countdown: "in 2h 17m",
        progress: 0.55,
        completedPrayers: ["Fajr", "Dhuhr"]
    )

    static func fromDefaults(_ appGroup: String = "group.com.praycalc.app") -> ComplicationData {
        let defaults = UserDefaults(suiteName: appGroup)
        let nextPrayer = defaults?.string(forKey: "widget_next_prayer")      ?? "Fajr"
        let nextTime   = defaults?.string(forKey: "widget_next_prayer_time") ?? "--:--"
        let nextTs     = defaults?.double(forKey: "widget_next_prayer_ts")   ?? 0
        let now = Date().timeIntervalSince1970
        let secs = Int(nextTs - now)
        let cd: String
        if secs <= 0 { cd = "now" }
        else if secs < 3600 { cd = "in \(secs / 60)m" }
        else { cd = "in \(secs / 3600)h \((secs % 3600) / 60)m" }

        // Approximate progress from stored all-prayers JSON
        var progress = 0.5
        if let json = defaults?.string(forKey: "widget_prayers"),
           let data = json.data(using: .utf8),
           let arr = try? JSONDecoder().decode([[String: String]].self, from: data) {
            let ts = arr.compactMap { Double($0["timestamp"] ?? "") }.sorted()
            if let idx = ts.firstIndex(where: { $0 == nextTs }), idx > 0 {
                let prev = ts[idx - 1]
                let span = nextTs - prev
                if span > 0 { progress = min((now - prev) / span, 1.0) }
            }
        }

        let completedNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].filter {
            (defaults?.double(forKey: "widget_\($0.lowercased())_ts") ?? 0) < now
                && $0 != nextPrayer
        }

        return ComplicationData(
            nextPrayer: nextPrayer,
            nextPrayerTime: nextTime,
            countdown: cd,
            progress: progress,
            completedPrayers: completedNames
        )
    }
}

// MARK: - .circularSmall (44×44 — corner slot on Infograph face)

struct CircularSmallComplicationView: View {
    let data: ComplicationData
    var body: some View {
        ZStack {
            WatchProgressArc(progress: data.progress, strokeWidth: 2)
            Text(String(data.nextPrayer.prefix(1)))
                .font(.system(size: 14, weight: .bold))
                .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
        }
        .accessibilityLabel("\(data.nextPrayer) \(data.nextPrayerTime)")
    }
}

// MARK: - .modularSmall (stacked text — Modular and Utility faces)

struct ModularSmallComplicationView: View {
    let data: ComplicationData
    var body: some View {
        VStack(spacing: 1) {
            Text(data.nextPrayer)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                .minimumScaleFactor(0.7)
                .lineLimit(1)
            Text(data.nextPrayerTime)
                .font(.system(size: 11))
                .foregroundColor(.white)
                .minimumScaleFactor(0.7)
                .lineLimit(1)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(data.nextPrayer) at \(data.nextPrayerTime)")
    }
}

// MARK: - .modularLarge (3-row body — Modular face)

struct ModularLargeComplicationView: View {
    let data: ComplicationData
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            Text("PrayCalc")
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(.gray)
            HStack(spacing: 4) {
                WatchProgressArc(progress: data.progress, strokeWidth: 2)
                    .frame(width: 18, height: 18)
                Text(data.nextPrayer)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
            }
            Text("\(data.nextPrayerTime) · \(data.countdown)")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.8))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(data.nextPrayer) at \(data.nextPrayerTime), \(data.countdown)")
    }
}

// MARK: - .graphicCorner (arc in corner — Infograph face)

@available(watchOS 5.0, *)
struct GraphicCornerComplicationView: View {
    let data: ComplicationData
    var body: some View {
        ZStack {
            WatchProgressArc(progress: data.progress, strokeWidth: 3)
            VStack(spacing: 1) {
                Text(String(data.nextPrayer.prefix(3)))
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                Text(data.nextPrayerTime)
                    .font(.system(size: 9))
                    .foregroundColor(.white.opacity(0.85))
                    .minimumScaleFactor(0.6)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(data.nextPrayer) at \(data.nextPrayerTime)")
    }
}

// MARK: - .graphicRectangular (wide — Infograph Modular face)

@available(watchOS 5.0, *)
struct GraphicRectangularComplicationView: View {
    let data: ComplicationData
    private let prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            // Row 1: prayer name + countdown
            HStack {
                WatchProgressArc(progress: data.progress, strokeWidth: 2)
                    .frame(width: 16, height: 16)
                Text(data.nextPrayer)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundColor(Color(red: 0.788, green: 0.949, blue: 0.478))
                Spacer()
                Text(data.countdown)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.75))
            }

            // Row 2: completed prayer dots
            HStack(spacing: 5) {
                ForEach(prayers, id: \.self) { prayer in
                    let done = data.completedPrayers.contains(prayer)
                    let isNext = prayer == data.nextPrayer
                    VStack(spacing: 2) {
                        Circle()
                            .fill(done ? Color(red: 0.475, green: 0.761, blue: 0.298) :
                                  isNext ? Color(red: 0.788, green: 0.949, blue: 0.478) :
                                  Color.white.opacity(0.2))
                            .frame(width: isNext ? 6 : 5, height: isNext ? 6 : 5)
                        Text(String(prayer.prefix(1)))
                            .font(.system(size: 7))
                            .foregroundColor(done || isNext ? .white.opacity(0.8) : .white.opacity(0.35))
                    }
                    .accessibilityLabel(done ? "\(prayer) done" : isNext ? "\(prayer) next" : prayer)
                }
                Spacer()
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(data.nextPrayer) at \(data.nextPrayerTime), \(data.countdown)")
    }
}

// MARK: - Double clamping

private extension Double {
    func clamped(to range: ClosedRange<Double>) -> Double {
        Swift.min(Swift.max(self, range.lowerBound), range.upperBound)
    }
}
