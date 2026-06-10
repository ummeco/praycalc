// PrayCalcWidgets/PrayerWidgetProvider.swift
// WidgetKit timeline provider — reads AppGroup UserDefaults written by Flutter.
// Spec §4.2 · S19-C T14
//
// Widget data keys (written by Flutter home_widget package):
//   widget_next_prayer       String  — "Asr"
//   widget_next_prayer_time  String  — "15:47" (locale-formatted)
//   widget_next_prayer_ts    Double  — Unix timestamp of next prayer (seconds)
//   widget_prayers           String  — JSON array of PrayerWidgetItem
//   widget_location_name     String  — "Mecca"
//   widget_hijri_date        String  — "15 Sha'ban 1447"
//   widget_stale             Bool    — true when prayer calc is out-of-date
//   widget_updated_at        Double  — Unix timestamp of last Flutter write
//   widget_location_pending  Bool    — true while awaiting GPS fix

import WidgetKit
import SwiftUI

// MARK: - Constants

let kAppGroup = "group.com.praycalc.app"
let kPraycalcGreen     = Color(red: 0.788, green: 0.949, blue: 0.478) // #C9F27A
let kPraycalcGreenMid  = Color(red: 0.475, green: 0.761, blue: 0.298) // #79C24C
let kPraycalcGreenDark = Color(red: 0.118, green: 0.369, blue: 0.184) // #1E5E2F
let kPraycalcAmber     = Color(red: 1.0, green: 0.7, blue: 0.0)        // imminent state

// MARK: - Entry Models

/// A single prayer in the widget_prayers JSON array.
struct PrayerWidgetItem: Codable, Identifiable {
    let name: String
    let time: String         // locale-formatted display string
    let timestamp: Double    // Unix seconds
    let isNext: Bool
    var id: String { name }
}

/// Timeline entry carrying all state needed to render any widget family.
struct PrayerEntry: TimelineEntry {
    let date: Date
    let widgetState: WidgetState
    let nextPrayer: String
    let nextPrayerTime: String          // display string
    let nextPrayerTimestamp: Double     // unix seconds
    let prayers: [PrayerWidgetItem]
    let locationName: String
    let hijriDate: String
}

// MARK: - Widget UI State (spec §4.2)

enum WidgetState {
    case loading           // placeholder / shimmer
    case locationPending   // GPS not yet available
    case nominal           // normal display
    case imminent          // < 15 minutes until next prayer
    case atAdhan           // 0–5 minutes: prayer time now
    case stale             // data > 24h old, ⚠️ shown
    case error             // unrecoverable read error
}

// MARK: - Timeline Provider

struct PrayerWidgetProvider: TimelineProvider {

    // MARK: Placeholder

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            widgetState: .loading,
            nextPrayer: "Asr",
            nextPrayerTime: "3:47 PM",
            nextPrayerTimestamp: Date().timeIntervalSince1970 + 3600,
            prayers: placeholderPrayers(),
            locationName: "Mecca",
            hijriDate: "15 Sha'ban 1447"
        )
    }

    // MARK: Snapshot

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        if context.isPreview {
            completion(placeholder(in: context))
        } else {
            completion(readEntry() ?? placeholder(in: context))
        }
    }

    // MARK: Timeline

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        let entry = readEntry() ?? placeholder(in: context)

        // Refresh at the next prayer time or in 15 minutes, whichever is sooner.
        let prayerDate = Date(timeIntervalSince1970: entry.nextPrayerTimestamp)
        let refreshIn15 = Date().addingTimeInterval(15 * 60)
        let nextRefresh = min(prayerDate, refreshIn15)

        let timeline = Timeline(
            entries: [entry],
            policy: .after(nextRefresh)
        )
        completion(timeline)
    }

    // MARK: - Data Reading

    private func readEntry() -> PrayerEntry? {
        let defaults = UserDefaults(suiteName: kAppGroup)

        let locationPending = defaults?.bool(forKey: "widget_location_pending") ?? false
        let isStale = defaults?.bool(forKey: "widget_stale") ?? false
        let updatedAt = defaults?.double(forKey: "widget_updated_at") ?? 0
        let dataAge = Date().timeIntervalSince1970 - updatedAt

        // Stale if Flutter hasn't written in > 24 hours
        let effectivelyStale = isStale || (updatedAt > 0 && dataAge > 86400)

        let nextPrayer     = defaults?.string(forKey: "widget_next_prayer")      ?? ""
        let nextPrayerTime = defaults?.string(forKey: "widget_next_prayer_time") ?? "--:--"
        let nextPrayerTs   = defaults?.double(forKey: "widget_next_prayer_ts")   ?? 0
        let locationName   = defaults?.string(forKey: "widget_location_name")    ?? ""
        let hijriDate      = defaults?.string(forKey: "widget_hijri_date")       ?? ""

        guard !nextPrayer.isEmpty else { return nil }

        let prayers = parsePrayers(defaults?.string(forKey: "widget_prayers"))

        // Determine state
        let state: WidgetState
        if locationPending {
            state = .locationPending
        } else if effectivelyStale {
            state = .stale
        } else {
            let secondsToNext = nextPrayerTs - Date().timeIntervalSince1970
            if secondsToNext < 0 && secondsToNext > -300 {
                state = .atAdhan        // 0–5 min window after prayer time
            } else if secondsToNext >= 0 && secondsToNext <= 900 {
                state = .imminent       // < 15 min
            } else {
                state = .nominal
            }
        }

        return PrayerEntry(
            date: Date(),
            widgetState: state,
            nextPrayer: nextPrayer,
            nextPrayerTime: nextPrayerTime,
            nextPrayerTimestamp: nextPrayerTs,
            prayers: prayers,
            locationName: locationName,
            hijriDate: hijriDate
        )
    }

    private func parsePrayers(_ json: String?) -> [PrayerWidgetItem] {
        guard let json, let data = json.data(using: .utf8) else { return placeholderPrayers() }
        let items = try? JSONDecoder().decode([PrayerWidgetItem].self, from: data)
        return items ?? placeholderPrayers()
    }

    private func placeholderPrayers() -> [PrayerWidgetItem] {
        let now = Date().timeIntervalSince1970
        return [
            PrayerWidgetItem(name: "Fajr",    time: "5:23 AM",  timestamp: now - 7200, isNext: false),
            PrayerWidgetItem(name: "Dhuhr",   time: "12:45 PM", timestamp: now - 1200, isNext: false),
            PrayerWidgetItem(name: "Asr",     time: "3:47 PM",  timestamp: now + 3600, isNext: true),
            PrayerWidgetItem(name: "Maghrib", time: "6:31 PM",  timestamp: now + 7200, isNext: false),
            PrayerWidgetItem(name: "Isha",    time: "7:58 PM",  timestamp: now + 9000, isNext: false),
        ]
    }
}
