// PrayCalcLiveActivity/PrayerActivityAttributes.swift
// ActivityKit attributes contract for PrayCalc Live Activity + Dynamic Island.
// Spec §5.2 · S19-C T15
//
// ContentState fields must match LiveActivityService.dart (LiveActivityState.toMap()).
// Flutter sends updates via platform channel com.praycalc/live_activity.

import ActivityKit
import SwiftUI

// MARK: - PrayerActivityAttributes

public struct PrayerActivityAttributes: ActivityAttributes {
    // Static data — set at activity start, does NOT change
    public struct ContentState: Codable, Hashable {
        /// Display name of the next prayer (e.g. "Asr")
        var nextPrayer: String

        /// Unix timestamp (ms) of the next prayer time. Used for Live Countdown timer.
        var nextTimeMs: Int64

        /// Seconds remaining until next prayer (for the initial countdown snapshot).
        var countdownSeconds: Int

        /// Progress 0.0–1.0 through the current prayer interval (for arc/ring displays).
        var progress: Double

        /// Prayer names that have passed today, e.g. ["Fajr", "Dhuhr"].
        var completedPrayers: [String]

        /// Location display name, e.g. "Mecca".
        var locationName: String
    }

    // Static attributes set at creation (not part of ContentState — never updated)
    public var prayerDate: String  // "Monday, 15 Sha'ban 1447" — shown in expanded island
}

// MARK: - Computed helpers

extension PrayerActivityAttributes.ContentState {

    /// Next prayer as a Date for Live Activity Timer.
    var nextPrayerDate: Date {
        Date(timeIntervalSince1970: Double(nextTimeMs) / 1000.0)
    }

    /// Returns true if less than 15 minutes remain.
    var isImminent: Bool { countdownSeconds > 0 && countdownSeconds <= 900 }

    /// Returns true if prayer time is now (0–5 min window).
    var isAtAdhan: Bool { countdownSeconds <= 0 && countdownSeconds > -300 }

    /// Accent color for current state.
    var accentColor: Color {
        if isAtAdhan  { return Color(red: 0.788, green: 0.949, blue: 0.478) }  // #C9F27A
        if isImminent { return Color(red: 1.0, green: 0.7, blue: 0.0)       }  // amber
        return Color(red: 0.475, green: 0.761, blue: 0.298)                     // #79C24C
    }

    /// Formatted countdown string, e.g. "2h 17m" or "7m" or "Now".
    var countdownDisplayText: String {
        if countdownSeconds <= 0 { return "Now!" }
        let hrs  = countdownSeconds / 3600
        let mins = (countdownSeconds % 3600) / 60
        if hrs > 0 { return "\(hrs)h \(mins)m" }
        return "\(mins)m"
    }
}
