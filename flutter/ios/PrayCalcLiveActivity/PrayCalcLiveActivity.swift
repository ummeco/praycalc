// PrayCalcLiveActivity/PrayCalcLiveActivity.swift
// Live Activity + Dynamic Island views for PrayCalc.
// Spec §5.2, §4.2 · S19-C T15
//
// Requires: iOS 16.1+ (ActivityKit). On older iOS, LiveActivityService is a no-op.
// StandBy mode (iOS 17+) is served automatically by the Live Activity layout — no extra code.
//
// Dynamic Island layouts:
//   compactLeading  — moon emoji
//   compactTrailing — countdown ("2h 17m")
//   minimal         — progress arc dot
//   expanded        — full prayer info
//
// Lock screen banner: full-width view with next prayer + progress arc + completed list.

import ActivityKit
import SwiftUI
import WidgetKit

// MARK: - Private color palette (mirrors PrayerWidgetEntryView.swift)

private let pc_green     = Color(red: 0.788, green: 0.949, blue: 0.478)  // #C9F27A
private let pc_greenMid  = Color(red: 0.475, green: 0.761, blue: 0.298)  // #79C24C
private let pc_greenDark = Color(red: 0.118, green: 0.369, blue: 0.184)  // #1E5E2F
private let pc_amber     = Color(red: 1.0,   green: 0.7,   blue: 0.0  )

// MARK: - Lock Screen / Notification Banner View

private struct LiveActivityBannerView: View {
    let context: ActivityViewContext<PrayerActivityAttributes>
    private var state: PrayerActivityAttributes.ContentState { context.state }

    var body: some View {
        HStack(spacing: 12) {
            // Progress arc with prayer letter inside
            ZStack {
                ProgressArc(
                    progress: state.progress,
                    color: state.accentColor,
                    strokeWidth: 4
                )
                .frame(width: 52, height: 52)

                Text(prayerInitial)
                    .font(.title3)
                    .fontWeight(.bold)
                    .foregroundColor(state.accentColor)
            }
            .accessibilityHidden(true)

            // Prayer info
            VStack(alignment: .leading, spacing: 3) {
                HStack(alignment: .firstTextBaseline, spacing: 6) {
                    Text(state.nextPrayer)
                        .font(.headline)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text(state.countdownDisplayText)
                        .font(.subheadline)
                        .foregroundColor(state.accentColor)
                        .fontWeight(.semibold)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(state.nextPrayer) in \(state.countdownDisplayText)")

                Text(locationLine)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.65))
                    .lineLimit(1)
                    .accessibilityLabel("Location: \(state.locationName)")
            }

            Spacer()

            // Completed prayer dots
            completedDotsView
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(activityBackground)
    }

    // MARK: Completed prayer dots (small circles ✓ or ○)

    private var completedDotsView: some View {
        let prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        return VStack(alignment: .trailing, spacing: 3) {
            ForEach(prayers, id: \.self) { prayer in
                let done = state.completedPrayers.contains(prayer)
                Circle()
                    .fill(done ? pc_greenMid : Color.white.opacity(0.2))
                    .frame(width: 5, height: 5)
                    .accessibilityLabel(done ? "\(prayer) completed" : "\(prayer) pending")
            }
        }
    }

    private var prayerInitial: String {
        switch state.nextPrayer {
        case "Fajr":    return "F"
        case "Dhuhr":   return "D"
        case "Asr":     return "A"
        case "Maghrib": return "M"
        case "Isha":    return "I"
        default:        return String(state.nextPrayer.prefix(1))
        }
    }

    private var locationLine: String {
        state.locationName.isEmpty ? "Prayer Time" : state.locationName
    }

    private var activityBackground: some View {
        Group {
            if state.isAtAdhan {
                pc_greenDark
            } else {
                Color.black.opacity(0.85)
            }
        }
    }
}

// MARK: - Dynamic Island: Expanded

private struct DynamicIslandExpandedView: View {
    let context: ActivityViewContext<PrayerActivityAttributes>
    private var state: PrayerActivityAttributes.ContentState { context.state }

    var body: some View {
        // The expanded region layout is supplied by DynamicIslandExpandedRegion inside the configuration.
        // This view is used as a shared data source; regions are declared in PrayCalcLiveActivityWidget.
        EmptyView()
    }
}

// MARK: - Widget Bundle Entry Point

@main
struct PrayCalcLiveActivityBundle: WidgetBundle {
    var body: some Widget {
        PrayCalcLiveActivityWidget()
    }
}

// MARK: - Live Activity Widget Configuration

struct PrayCalcLiveActivityWidget: Widget {

    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerActivityAttributes.self) { context in
            // Lock screen / notification banner
            LiveActivityBannerView(context: context)
        } dynamicIsland: { context in
            let state = context.state

            DynamicIsland {
                // MARK: Expanded — shown when island is tapped / long-pressed

                DynamicIslandExpandedRegion(.leading) {
                    VStack(alignment: .leading, spacing: 4) {
                        Label {
                            Text(state.nextPrayer)
                                .font(.headline)
                                .fontWeight(.bold)
                                .foregroundColor(.white)
                        } icon: {
                            Image(systemName: "moon.stars")
                                .foregroundColor(state.accentColor)
                        }
                        .accessibilityLabel("Next prayer: \(state.nextPrayer)")

                        if !state.locationName.isEmpty {
                            Text(state.locationName)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.6))
                                .lineLimit(1)
                                .accessibilityLabel("Location: \(state.locationName)")
                        }
                    }
                }

                DynamicIslandExpandedRegion(.trailing) {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(state.countdownDisplayText)
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(state.accentColor)
                            .accessibilityLabel("In \(state.countdownDisplayText)")

                        // Live countdown timer
                        if state.countdownSeconds > 0 {
                            Text(timerInterval: Date()...state.nextPrayerDate, countsDown: true)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.5))
                                .monospacedDigit()
                                .accessibilityHidden(true)
                        }
                    }
                }

                DynamicIslandExpandedRegion(.bottom) {
                    HStack(spacing: 0) {
                        // Progress arc (small, inline)
                        ProgressArc(progress: state.progress, color: state.accentColor, strokeWidth: 2.5)
                            .frame(width: 24, height: 24)
                            .padding(.trailing, 8)
                            .accessibilityHidden(true)

                        // Completed prayers as dots
                        let allPrayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
                        HStack(spacing: 6) {
                            ForEach(allPrayers, id: \.self) { prayer in
                                let done = state.completedPrayers.contains(prayer)
                                let isNext = prayer == state.nextPrayer
                                VStack(spacing: 2) {
                                    Circle()
                                        .fill(done ? pc_greenMid : (isNext ? state.accentColor : Color.white.opacity(0.2)))
                                        .frame(width: isNext ? 8 : 6, height: isNext ? 8 : 6)
                                    Text(String(prayer.prefix(1)))
                                        .font(.system(size: 8))
                                        .foregroundColor(done ? pc_greenMid : .white.opacity(0.5))
                                }
                                .accessibilityLabel(done ? "\(prayer) done" : (isNext ? "\(prayer) next" : "\(prayer)"))
                            }
                        }

                        Spacer()

                        if !context.attributes.prayerDate.isEmpty {
                            Text(context.attributes.prayerDate)
                                .font(.caption2)
                                .foregroundColor(.white.opacity(0.4))
                                .lineLimit(1)
                                .accessibilityHidden(true)
                        }
                    }
                    .padding(.top, 4)
                }

            } compactLeading: {
                // MARK: Compact Leading — moon icon
                Image(systemName: "moon.stars.fill")
                    .foregroundColor(state.accentColor)
                    .font(.caption)
                    .accessibilityLabel("PrayCalc")

            } compactTrailing: {
                // MARK: Compact Trailing — countdown text
                Text(state.countdownDisplayText)
                    .foregroundColor(state.accentColor)
                    .font(.caption)
                    .fontWeight(.semibold)
                    .monospacedDigit()
                    .accessibilityLabel("Prayer in \(state.countdownDisplayText)")

            } minimal: {
                // MARK: Minimal — small progress arc dot
                ZStack {
                    ProgressArc(progress: state.progress, color: state.accentColor, strokeWidth: 2)
                        .frame(width: 20, height: 20)
                    Circle()
                        .fill(state.accentColor)
                        .frame(width: 6, height: 6)
                }
                .accessibilityLabel("Prayer in \(state.countdownDisplayText)")
            }
        }
    }
}
