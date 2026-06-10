// PrayCalcWatch — WatchView
// SwiftUI root view for the watchOS companion app.
// Data flows from ExtensionDelegate → WatchPrayerData (EnvironmentObject).

import SwiftUI
import ClockKit

// MARK: - Root view

struct WatchView: View {
    @EnvironmentObject var prayerData: WatchPrayerData

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("PrayCalc")
                        .font(.system(size: 13, weight: .bold))
                        .foregroundColor(Color(red: 0.79, green: 0.95, blue: 0.48))
                    Spacer()
                }

                if prayerData.nextPrayer.isEmpty {
                    Text("Waiting for phone…")
                        .font(.caption2)
                        .foregroundColor(.gray)
                } else {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(prayerData.nextPrayer)
                            .font(.headline)
                            .foregroundColor(.white)
                        Text("in \(prayerData.countdown)")
                            .font(.caption)
                            .foregroundColor(Color(red: 0.79, green: 0.95, blue: 0.48))
                    }
                }

                Divider()
                    .background(Color.white.opacity(0.2))

                ForEach(prayerData.prayers) { prayer in
                    HStack {
                        Text(prayer.name)
                            .font(.caption)
                            .foregroundColor(prayer.isNext
                                ? Color(red: 0.79, green: 0.95, blue: 0.48)
                                : .white)
                        Spacer()
                        Text(prayer.time)
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
        }
        .background(Color(red: 0.08, green: 0.23, blue: 0.12))
    }
}

// MARK: - Prayer row model

struct WatchPrayerRow: Identifiable {
    var id: String { name }
    let name: String
    let time: String
    var isNext: Bool = false
}

// MARK: - Observable state

class WatchPrayerData: ObservableObject {
    @Published var prayers: [WatchPrayerRow] = [
        WatchPrayerRow(name: "Fajr",    time: "--:--"),
        WatchPrayerRow(name: "Dhuhr",   time: "--:--"),
        WatchPrayerRow(name: "Asr",     time: "--:--"),
        WatchPrayerRow(name: "Maghrib", time: "--:--"),
        WatchPrayerRow(name: "Isha",    time: "--:--"),
    ]
    @Published var nextPrayer: String = ""
    @Published var countdown: String  = "--:--"

    /// Update from the AppGroup UserDefaults written by ExtensionDelegate.
    /// Keys: "widget_fajr", "widget_dhuhr", "widget_asr", "widget_maghrib",
    ///       "widget_isha", "watch_next_prayer", "watch_countdown".
    func reloadFromDefaults(suiteName: String = "group.com.praycalc.app") {
        guard let defaults = UserDefaults(suiteName: suiteName) else { return }
        let names = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
        let next = defaults.string(forKey: "watch_next_prayer") ?? nextPrayer

        prayers = names.map { name in
            let time = defaults.string(forKey: "widget_\(name.lowercased())") ?? "--:--"
            return WatchPrayerRow(name: name, time: time, isNext: name == next)
        }
        nextPrayer = next
        countdown  = defaults.string(forKey: "watch_countdown") ?? "--:--"
    }

    /// Update directly from a WCSession message payload.
    /// Payload structure matches what ExtensionDelegate.storePrayerPayload() stores.
    func update(from dict: [String: Any]) {
        // The iOS side sends { "data": "<json>", "timestamp": "<iso>" }.
        // ExtensionDelegate parses and writes individual keys — we reload from defaults.
        reloadFromDefaults()
    }
}
