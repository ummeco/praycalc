// PrayCalcWatch/Views/PrayerListView.swift
// Main prayer list view for the PrayCalc Watch app.
// Spec §3.2 · S19-D T17
//
// Handles 44mm (396×484) and 45mm (410×502). Font scales down for 41mm/40mm.
// All 7 UI states from spec §4.2 handled.
// Accessibility: .accessibilityLabel on every meaningful element.

import SwiftUI

private let pcGreen     = Color(red: 0.788, green: 0.949, blue: 0.478)  // #C9F27A
private let pcGreenMid  = Color(red: 0.475, green: 0.761, blue: 0.298)  // #79C24C
private let pcGreenDark = Color(red: 0.118, green: 0.369, blue: 0.184)  // #1E5E2F
private let pcAmber     = Color(red: 1.0,   green: 0.7,   blue: 0.0  )

struct PrayerListView: View {
    @EnvironmentObject var service: WatchPrayerService
    @Environment(\.isLuminanceReduced) var reducedLuminance  // always-on display

    var body: some View {
        Group {
            switch service.state {
            case .loading:
                loadingView
            case .locationPending:
                locationPendingView
            case .nominal, .imminent, .atAdhan:
                prayerListContent
            case .stale:
                staleView
            case .error:
                errorView
            }
        }
        .background(reducedLuminance ? Color.black : pcGreenDark)
        .onAppear {
            service.refresh()
        }
    }

    // MARK: - Prayer List Content

    private var prayerListContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                headerView
                    .padding(.bottom, 6)

                Divider()
                    .background(Color.white.opacity(0.2))
                    .padding(.bottom, 4)

                // Prayer rows
                ForEach(service.prayers) { prayer in
                    PrayerRow(prayer: prayer, state: service.state)
                    if prayer.name != service.prayers.last?.name {
                        Divider()
                            .background(Color.white.opacity(0.1))
                    }
                }

                // Bottom padding for Digital Crown
                Spacer(minLength: 16)
            }
            .padding(.horizontal, 8)
            .padding(.top, 6)
        }
    }

    // MARK: - Header

    private var headerView: some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack {
                Image(systemName: "moon.stars")
                    .font(scaledFont(.caption2))
                    .foregroundColor(pcGreen)
                    .accessibilityHidden(true)
                Text("PrayCalc")
                    .font(scaledFont(.caption2))
                    .fontWeight(.semibold)
                    .foregroundColor(pcGreen)
                Spacer()
                if service.state == .stale {
                    Text("⚠")
                        .font(.caption2)
                        .foregroundColor(pcAmber)
                        .accessibilityLabel("Data outdated")
                }
            }

            if !service.nextPrayerName.isEmpty {
                HStack(alignment: .firstTextBaseline, spacing: 4) {
                    Text(service.nextPrayerName)
                        .font(scaledFont(.headline))
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text(countdownText)
                        .font(scaledFont(.subheadline))
                        .foregroundColor(countdownColor)
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("\(service.nextPrayerName) in \(countdownText)")
            }

            if !service.locationName.isEmpty {
                Text(service.locationName)
                    .font(scaledFont(.caption2))
                    .foregroundColor(.white.opacity(0.5))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                    .accessibilityLabel("Location: \(service.locationName)")
            }
        }
    }

    // MARK: - State Views

    private var loadingView: some View {
        VStack(spacing: 6) {
            ProgressView()
                .progressViewStyle(.circular)
                .tint(pcGreen)
            Text("Loading…")
                .font(.caption2)
                .foregroundColor(.gray)
        }
        .accessibilityLabel("Loading prayer times")
    }

    private var locationPendingView: some View {
        VStack(spacing: 6) {
            Image(systemName: "location.circle")
                .font(.title2)
                .foregroundColor(pcGreen)
            Text("Getting location…")
                .font(.caption2)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .accessibilityLabel("Getting location for prayer times")
    }

    private var staleView: some View {
        VStack(spacing: 6) {
            prayerListContent
            HStack {
                Image(systemName: "exclamationmark.triangle")
                    .foregroundColor(pcAmber)
                    .font(.caption2)
                Text("Outdated — open phone app")
                    .font(.caption2)
                    .foregroundColor(pcAmber)
            }
            .accessibilityLabel("Prayer times outdated. Open phone app to refresh.")
        }
    }

    private var errorView: some View {
        VStack(spacing: 8) {
            Image(systemName: "exclamationmark.circle")
                .font(.title2)
                .foregroundColor(.red.opacity(0.7))
            Text("Cannot load\npray times")
                .font(.caption2)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
            Button("Retry") {
                service.refresh()
            }
            .tint(pcGreen)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Error loading prayer times. Tap retry to try again.")
    }

    // MARK: - Helpers

    private func scaledFont(_ style: Font.TextStyle) -> Font {
        // Scale down on 40mm/41mm watches (screen height < 400)
        let screenHeight = WKInterfaceDevice.current().screenBounds.height
        if screenHeight < 200 { // WatchKit uses points; ~180pt for 40mm
            switch style {
            case .headline:   return .system(size: 14, weight: .bold)
            case .subheadline: return .system(size: 12)
            case .caption:    return .system(size: 10)
            case .caption2:   return .system(size: 9)
            case .footnote:   return .footnote
            default:          return Font(style)
            }
        }
        return Font(style)
    }

    private var countdownText: String {
        switch service.state {
        case .atAdhan:  return "Now!"
        default:
            let secs = service.secondsToNextPrayer
            if secs <= 0 { return "Now!" }
            let hrs  = secs / 3600
            let mins = (secs % 3600) / 60
            if hrs > 0 { return "\(hrs)h \(mins)m" }
            return "\(mins)m"
        }
    }

    private var countdownColor: Color {
        switch service.state {
        case .atAdhan:  return pcGreen
        case .imminent: return pcAmber
        default:        return pcGreenMid
        }
    }
}

// MARK: - Prayer Row

private struct PrayerRow: View {
    let prayer: WatchPrayerItem
    let state: WatchWidgetState

    private var pcGreen    = Color(red: 0.788, green: 0.949, blue: 0.478)
    private var pcGreenMid = Color(red: 0.475, green: 0.761, blue: 0.298)
    private var pcAmber    = Color(red: 1.0, green: 0.7, blue: 0.0)

    var body: some View {
        HStack {
            Text(prayer.name)
                .font(.caption)
                .fontWeight(prayer.isNext ? .bold : .regular)
                .foregroundColor(prayer.isNext ? accentColor : .white)

            Spacer()

            if prayer.isCompleted {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 10))
                    .foregroundColor(pcGreenMid.opacity(0.7))
                    .accessibilityLabel("Completed")
            }

            Text(prayer.time)
                .font(.caption)
                .foregroundColor(prayer.isNext ? accentColor : .gray)
        }
        .padding(.vertical, 4)
        .background(
            prayer.isNext
                ? accentColor.opacity(0.1).clipShape(RoundedRectangle(cornerRadius: 6))
                : Color.clear
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel(accessibilityLabel)
    }

    private var accentColor: Color {
        if prayer.isNext {
            switch state {
            case .imminent: return pcAmber
            case .atAdhan:  return pcGreen
            default:        return pcGreenMid
            }
        }
        return .gray
    }

    private var accessibilityLabel: String {
        var label = "\(prayer.name) at \(prayer.time)"
        if prayer.isNext { label += ", next prayer" }
        if prayer.isCompleted { label += ", completed" }
        return label
    }
}
