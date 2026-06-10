// PrayCalcWidgets/PrayCalcWidgets.swift
// WidgetBundle entry point — all widget configurations for PrayCalc.
// Registers all 6 families (3 home screen + 3 lock screen) in one bundle.
// Spec §4.1 · S19-C T14
//
// Deep links: tapping any widget opens the app via URL scheme praycalc://widget
// AppGroup: group.com.praycalc.app (shared with Flutter Runner)

import WidgetKit
import SwiftUI

// MARK: - Home Screen Widget (systemSmall + systemMedium + systemLarge)

struct PrayerHomeWidget: Widget {
    let kind = "PrayerHomeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "praycalc://widget?from=home"))
        }
        .configurationDisplayName("Prayer Times")
        .description("See your full prayer schedule at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
        .contentMarginsDisabled()  // use custom padding inside views
    }
}

// MARK: - Lock Screen Widget (accessoryInline + accessoryCircular + accessoryRectangular)

struct PrayerLockScreenWidget: Widget {
    let kind = "PrayerLockScreenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerWidgetProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
                .widgetURL(URL(string: "praycalc://widget?from=lockscreen"))
        }
        .configurationDisplayName("Prayer Times (Lock Screen)")
        .description("Next prayer on your lock screen.")
        .supportedFamilies([.accessoryInline, .accessoryCircular, .accessoryRectangular])
    }
}

// MARK: - Widget Bundle

@main
struct PrayCalcWidgetBundle: WidgetBundle {
    var body: some Widget {
        PrayerHomeWidget()
        PrayerLockScreenWidget()
        // Legacy widgets (v1.0) — kept for backward compat while users migrate
        LockScreenWidget()
        HomeScreenWidget()
    }
}
