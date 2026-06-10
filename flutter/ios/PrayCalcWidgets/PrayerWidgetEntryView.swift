// PrayCalcWidgets/PrayerWidgetEntryView.swift
// All 6 widget families + 7 UI states per spec §4.2 · S19-C T14
//
// Families:
//   Home screen:  .systemSmall (155×155), .systemMedium (329×155), .systemLarge (329×345)
//   Lock screen:  .accessoryInline (170×16), .accessoryCircular (44×44), .accessoryRectangular (171×44)
//
// UI States (spec §4.2):
//   loading         — shimmer skeleton (placeholder)
//   locationPending — waiting for GPS fix
//   nominal         — normal display
//   imminent        — < 15 min (amber pulsing border)
//   atAdhan         — 0–5 min (deep green bg)
//   stale           — > 24h old (faded, ⚠ Outdated badge)
//   error           — cannot read data

import WidgetKit
import SwiftUI

// MARK: - ProgressArc (for circular countdown)

/// Circular arc drawn from –π/2 clockwise. progress: 0.0–1.0.
struct ProgressArc: View {
    let progress: Double
    var color: Color = kPraycalcGreen
    var strokeWidth: CGFloat = 3

    private var progressValue: Double { progress.clamped(to: 0...1) }

    var body: some View {
        ZStack {
            Circle()
                .stroke(color.opacity(0.2), lineWidth: strokeWidth)
            Circle()
                .trim(from: 0, to: progressValue)
                .stroke(color, style: StrokeStyle(lineWidth: strokeWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 0.5), value: progressValue)
        }
    }
}

// MARK: - State-based background modifier

extension View {
    /// Applies the correct widget background for the current UI state.
    func widgetBackground(for state: WidgetState) -> some View {
        switch state {
        case .atAdhan:
            return AnyView(self.containerBackground(kPraycalcGreenDark, for: .widget))
        case .stale:
            return AnyView(self.containerBackground(Color(.systemBackground).opacity(0.7), for: .widget))
        default:
            return AnyView(self.containerBackground(Color(.systemBackground), for: .widget))
        }
    }
}

// MARK: - Main Entry View (routes by family)

struct PrayerWidgetEntryView: View {
    var entry: PrayerEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            switch family {
            // Home screen
            case .systemSmall:        SystemSmallView(entry: entry)
            case .systemMedium:       SystemMediumView(entry: entry)
            case .systemLarge:        SystemLargeView(entry: entry)
            // Lock screen
            case .accessoryInline:    AccessoryInlineView(entry: entry)
            case .accessoryCircular:  AccessoryCircularView(entry: entry)
            case .accessoryRectangular: AccessoryRectangularView(entry: entry)
            default:                  SystemSmallView(entry: entry)
            }
        }
    }
}

// MARK: - System Small (155×155)
// Shows: location, next prayer name, time, countdown. State-aware background + borders.

private struct SystemSmallView: View {
    let entry: PrayerEntry

    private var progress: Double {
        guard entry.nextPrayerTimestamp > 0 else { return 0 }
        // Progress represents how much of the current prayer interval has elapsed
        let allTs = entry.prayers.map(\.timestamp).sorted()
        guard let idx = allTs.firstIndex(where: { $0 == entry.nextPrayerTimestamp }),
              idx > 0 else { return 0 }
        let prevTs = allTs[idx - 1]
        let span = entry.nextPrayerTimestamp - prevTs
        guard span > 0 else { return 0 }
        let elapsed = Date().timeIntervalSince1970 - prevTs
        return (elapsed / span).clamped(to: 0...1)
    }

    private var countdown: String {
        let secs = entry.nextPrayerTimestamp - Date().timeIntervalSince1970
        if secs <= 0 { return "now" }
        let mins = Int(secs / 60) % 60
        let hrs  = Int(secs / 3600)
        if hrs > 0 { return "in \(hrs)h \(mins)m" }
        return "in \(mins)m"
    }

    var body: some View {
        ZStack {
            stateOverlay
            VStack(alignment: .center, spacing: 3) {
                if !entry.locationName.isEmpty {
                    Text(entry.locationName)
                        .font(.caption2)
                        .foregroundColor(textColor.opacity(0.7))
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                        .accessibilityLabel("Location: \(entry.locationName)")
                }
                Spacer(minLength: 0)
                ZStack {
                    ProgressArc(progress: progress, color: arcColor, strokeWidth: 4)
                        .frame(width: 68, height: 68)
                    VStack(spacing: 2) {
                        Text(entry.nextPrayer)
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(prayerNameColor)
                            .minimumScaleFactor(0.8)
                        Text(entry.nextPrayerTime)
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(textColor)
                            .minimumScaleFactor(0.7)
                    }
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(entry.nextPrayer) at \(entry.nextPrayerTime)")
                Spacer(minLength: 0)
                Text(countdownLabel)
                    .font(.caption2)
                    .foregroundColor(textColor.opacity(0.8))
                    .accessibilityLabel(countdownLabel)
            }
            .padding(10)
        }
        .widgetBackground(for: entry.widgetState)
        .overlay(imminentBorder)
    }

    @ViewBuilder
    private var stateOverlay: some View {
        switch entry.widgetState {
        case .stale:
            VStack {
                HStack {
                    Spacer()
                    Text("⚠ Outdated")
                        .font(.system(size: 9, weight: .semibold))
                        .foregroundColor(kPraycalcAmber)
                        .padding(.horizontal, 4)
                        .padding(.vertical, 2)
                        .background(kPraycalcAmber.opacity(0.15).clipShape(RoundedRectangle(cornerRadius: 4)))
                }
                Spacer()
            }
            .padding(6)
        case .error:
            VStack {
                Spacer()
                Text("Tap to refresh")
                    .font(.caption2)
                    .foregroundColor(.red.opacity(0.8))
                Spacer()
            }
        case .locationPending:
            VStack {
                Spacer()
                Text("Getting location…")
                    .font(.caption2)
                    .foregroundColor(textColor.opacity(0.6))
                Spacer()
            }
        default:
            EmptyView()
        }
    }

    @ViewBuilder
    private var imminentBorder: some View {
        if entry.widgetState == .imminent {
            RoundedRectangle(cornerRadius: 20)
                .stroke(kPraycalcAmber, lineWidth: 2)
        } else {
            EmptyView()
        }
    }

    private var countdownLabel: String {
        switch entry.widgetState {
        case .atAdhan:    return "Prayer time!"
        case .loading:    return "Loading…"
        case .stale:      return "Outdated"
        case .error:      return "Error"
        case .locationPending: return "Locating…"
        default:          return countdown
        }
    }

    private var textColor: Color {
        entry.widgetState == .atAdhan ? .white : .primary
    }

    private var prayerNameColor: Color {
        switch entry.widgetState {
        case .atAdhan:    return kPraycalcGreen
        case .imminent:   return kPraycalcAmber
        default:          return kPraycalcGreenMid
        }
    }

    private var arcColor: Color {
        switch entry.widgetState {
        case .imminent:   return kPraycalcAmber
        case .atAdhan:    return kPraycalcGreen
        default:          return kPraycalcGreenMid
        }
    }
}

// MARK: - System Medium (329×155)
// Shows: location + Hijri date header, all 5 prayers in columns.

private struct SystemMediumView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                if !entry.locationName.isEmpty {
                    Text(entry.locationName)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                        .accessibilityLabel("Location: \(entry.locationName)")
                }
                Spacer()
                if !entry.hijriDate.isEmpty {
                    Text(entry.hijriDate)
                        .font(.caption2)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
                if entry.widgetState == .stale {
                    Text("⚠")
                        .font(.caption2)
                        .foregroundColor(kPraycalcAmber)
                        .accessibilityLabel("Data outdated")
                }
            }

            // Prayer columns
            HStack(spacing: 0) {
                ForEach(entry.prayers) { prayer in
                    let isNext = prayer.name == entry.nextPrayer
                    VStack(spacing: 3) {
                        Text(shortName(prayer.name))
                            .font(.system(size: 10, weight: isNext ? .semibold : .regular))
                            .foregroundColor(isNext ? prayerAccentColor : .secondary)
                            .minimumScaleFactor(0.6)
                        Text(prayer.time)
                            .font(.system(size: 11, weight: isNext ? .bold : .regular))
                            .foregroundColor(isNext ? prayerAccentColor : .primary)
                            .minimumScaleFactor(0.6)
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 5)
                    .background(
                        isNext
                            ? prayerAccentColor.opacity(0.15)
                                .clipShape(RoundedRectangle(cornerRadius: 8))
                            : Color.clear
                    )
                    .accessibilityElement(children: .combine)
                    .accessibilityLabel("\(prayer.name) \(prayer.time)\(isNext ? ", next prayer" : "")")
                }
            }
        }
        .padding(10)
        .opacity(entry.widgetState == .stale ? 0.65 : 1.0)
        .widgetBackground(for: entry.widgetState)
        .overlay(imminentBorder)
    }

    @ViewBuilder
    private var imminentBorder: some View {
        if entry.widgetState == .imminent {
            RoundedRectangle(cornerRadius: 20)
                .stroke(kPraycalcAmber, lineWidth: 2)
        }
    }

    private var prayerAccentColor: Color {
        switch entry.widgetState {
        case .imminent: return kPraycalcAmber
        case .atAdhan:  return kPraycalcGreen
        default:        return kPraycalcGreenMid
        }
    }

    private func shortName(_ name: String) -> String {
        switch name {
        case "Dhuhr":   return "Dhr"
        case "Maghrib": return "Mgh"
        default:        return name
        }
    }
}

// MARK: - System Large (329×345)
// Shows: all 5 prayers with time + progress bar, location + Hijri, countdown to next.

private struct SystemLargeView: View {
    let entry: PrayerEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    if !entry.locationName.isEmpty {
                        Text(entry.locationName)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .lineLimit(1)
                            .accessibilityLabel("Location: \(entry.locationName)")
                    }
                    if !entry.hijriDate.isEmpty {
                        Text(entry.hijriDate)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
                stateLabel
            }

            // Prayer rows
            ForEach(entry.prayers) { prayer in
                let isNext = prayer.name == entry.nextPrayer
                HStack {
                    Text(prayer.name)
                        .font(.body)
                        .fontWeight(isNext ? .semibold : .regular)
                        .foregroundColor(isNext ? accentColor : .primary)
                        .frame(width: 70, alignment: .leading)

                    Text(prayer.time)
                        .font(.body)
                        .fontWeight(isNext ? .bold : .regular)
                        .foregroundColor(isNext ? accentColor : .primary)

                    Spacer()

                    if isNext {
                        Text(countdownText)
                            .font(.caption)
                            .foregroundColor(accentColor)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(accentColor.opacity(0.12).clipShape(Capsule()))
                    }
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(prayer.name) \(prayer.time)\(isNext ? ", next prayer, \(countdownText)" : "")")

                if prayer.name != entry.prayers.last?.name {
                    Divider().opacity(0.4)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(14)
        .opacity(entry.widgetState == .stale ? 0.65 : 1.0)
        .widgetBackground(for: entry.widgetState)
        .overlay(imminentBorder)
    }

    @ViewBuilder
    private var stateLabel: some View {
        switch entry.widgetState {
        case .stale:
            Text("⚠ Outdated")
                .font(.caption2)
                .foregroundColor(kPraycalcAmber)
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(kPraycalcAmber.opacity(0.15).clipShape(Capsule()))
        case .locationPending:
            Text("Locating…")
                .font(.caption2)
                .foregroundColor(.secondary)
        default:
            EmptyView()
        }
    }

    @ViewBuilder
    private var imminentBorder: some View {
        if entry.widgetState == .imminent {
            RoundedRectangle(cornerRadius: 20)
                .stroke(kPraycalcAmber, lineWidth: 2.5)
        }
    }

    private var accentColor: Color {
        switch entry.widgetState {
        case .imminent: return kPraycalcAmber
        case .atAdhan:  return kPraycalcGreen
        default:        return kPraycalcGreenMid
        }
    }

    private var countdownText: String {
        switch entry.widgetState {
        case .atAdhan:  return "Now!"
        case .loading:  return "…"
        default:
            let secs = entry.nextPrayerTimestamp - Date().timeIntervalSince1970
            if secs <= 0 { return "Now!" }
            let mins = Int(secs / 60) % 60
            let hrs  = Int(secs / 3600)
            if hrs > 0 { return "\(hrs)h \(mins)m" }
            return "\(mins)m"
        }
    }
}

// MARK: - Accessory Inline (170×16)
// Lock screen: single line — "Asr · 3:47 PM"

struct AccessoryInlineView: View {
    let entry: PrayerEntry

    var body: some View {
        Text("\(entry.nextPrayer) · \(entry.nextPrayerTime)")
            .accessibilityLabel("Next prayer: \(entry.nextPrayer) at \(entry.nextPrayerTime)")
    }
}

// MARK: - Accessory Circular (44×44)
// Lock screen: ProgressArc background, prayer name + time stacked.

struct AccessoryCircularView: View {
    let entry: PrayerEntry

    private var progress: Double {
        guard entry.nextPrayerTimestamp > 0 else { return 0 }
        let allTs = entry.prayers.map(\.timestamp).sorted()
        guard let idx = allTs.firstIndex(where: { $0 == entry.nextPrayerTimestamp }),
              idx > 0 else { return 0 }
        let prevTs = allTs[idx - 1]
        let span = entry.nextPrayerTimestamp - prevTs
        guard span > 0 else { return 0 }
        return ((Date().timeIntervalSince1970 - prevTs) / span).clamped(to: 0...1)
    }

    var body: some View {
        ZStack {
            ProgressArc(progress: progress, color: .white, strokeWidth: 2)
            VStack(spacing: 0) {
                Text(shortName(entry.nextPrayer))
                    .font(.system(size: 10, weight: .semibold))
                    .minimumScaleFactor(0.7)
                    .lineLimit(1)
                Text(entry.nextPrayerTime)
                    .font(.system(size: 9))
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(entry.nextPrayer) at \(entry.nextPrayerTime)")
    }

    private func shortName(_ name: String) -> String {
        name.count > 4 ? String(name.prefix(3)) : name
    }
}

// MARK: - Accessory Rectangular (171×44)
// Lock screen: all 5 prayers in a horizontal row (abbreviated names).

struct AccessoryRectangularView: View {
    let entry: PrayerEntry

    var body: some View {
        HStack(spacing: 4) {
            ForEach(entry.prayers) { prayer in
                let isNext = prayer.name == entry.nextPrayer
                VStack(spacing: 1) {
                    Text(shortName(prayer.name))
                        .font(.system(size: 8, weight: isNext ? .bold : .regular))
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                    Text(prayer.time)
                        .font(.system(size: 9, weight: isNext ? .semibold : .regular))
                        .minimumScaleFactor(0.5)
                        .lineLimit(1)
                }
                .frame(maxWidth: .infinity)
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(prayer.name) \(prayer.time)")
            }
        }
    }

    private func shortName(_ name: String) -> String {
        switch name {
        case "Dhuhr":   return "Dhr"
        case "Maghrib": return "Mgh"
        default:        return String(name.prefix(3))
        }
    }
}

// MARK: - Double clamping helper

extension Comparable {
    func clamped(to range: ClosedRange<Self>) -> Self {
        min(max(self, range.lowerBound), range.upperBound)
    }
}
