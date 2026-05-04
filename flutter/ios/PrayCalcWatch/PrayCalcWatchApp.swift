// PrayCalcWatch/PrayCalcWatchApp.swift
// watchOS SwiftUI app entry point for PrayCalc Watch extension.
// Spec §3.2 (Watch complications), S19-D T17
//
// NOTE: This file replaces the WKExtensionDelegate approach on watchOS 7+.
//       For watchOS 6 compat, ExtensionDelegate.swift is kept as a delegate adapter.
//       The FF_APPLE_WATCH flag is checked in WatchPrayerService; if false, a
//       locked-feature placeholder is shown instead of prayer times.
//
// Xcode setup required (not automated here):
//   - Add watchOS target: File → New Target → Watch App (choose "Watch App for existing iOS App")
//   - Bundle ID: com.praycalc.app.watchkitapp
//   - App Group: group.com.praycalc.app on both iOS Runner and watchOS targets
//   - WatchConnectivity framework linked to watchOS target
//   - Complication data source: PrayCalcComplicationController (see ComplicationView.swift)

import SwiftUI

@main
struct PrayCalcWatchApp: App {

    @StateObject private var prayerService = WatchPrayerService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(prayerService)
        }
    }
}

// MARK: - Root ContentView

struct ContentView: View {
    @EnvironmentObject var service: WatchPrayerService

    var body: some View {
        Group {
            if !service.featureEnabled {
                LockedFeatureView()
            } else {
                PrayerListView()
                    .environmentObject(service)
            }
        }
    }
}

// MARK: - Locked Feature View (FF_APPLE_WATCH = false)

private struct LockedFeatureView: View {
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: "moon.stars")
                .font(.largeTitle)
                .foregroundColor(Color(red: 0.79, green: 0.95, blue: 0.48))
            Text("PrayCalc")
                .font(.headline)
                .foregroundColor(.white)
            Text("Watch support\ncoming soon")
                .font(.caption2)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("PrayCalc Watch support coming soon")
    }
}
