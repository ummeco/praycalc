// PrayCalcWatch/Services/WatchPrayerService.swift
// Syncs prayer times from iPhone companion via WatchConnectivity.
// Offline fallback: uses last-good data from AppGroup UserDefaults.
// Spec §3.2 · S19-D T17
//
// FF_APPLE_WATCH: checked via AppGroup key "ff_apple_watch" (default: true).
// D-S19-01 resolution: Watch is FREE; feature flag stub kept for future gate.

import WatchConnectivity
import Combine
import ClockKit

// MARK: - Watch-specific UI State

enum WatchWidgetState {
    case loading
    case locationPending
    case nominal
    case imminent          // < 15 min
    case atAdhan           // 0–5 min window
    case stale
    case error
}

// MARK: - Data Model

struct WatchPrayerItem: Identifiable {
    let name: String
    let time: String        // locale-formatted display string
    let timestamp: Double   // unix seconds
    let isNext: Bool
    let isCompleted: Bool
    var id: String { name }
}

// MARK: - WatchPrayerService (ObservableObject)

/// Observable service that owns all prayer time state on watchOS.
/// Views subscribe to this and re-render when data changes.
///
/// Data flow:
///   1. At launch → load from AppGroup UserDefaults (offline / last good)
///   2. WCSession message from iPhone → update and persist to AppGroup
///   3. Timer fires every 30s → re-evaluate state (imminent/atAdhan transitions)
@MainActor
final class WatchPrayerService: NSObject, ObservableObject {

    // MARK: Published state

    @Published var prayers:              [WatchPrayerItem] = []
    @Published var nextPrayerName:       String            = ""
    @Published var secondsToNextPrayer:  Int               = 0
    @Published var nextPrayerTimestamp:  Double            = 0
    @Published var locationName:         String            = ""
    @Published var hijriDate:            String            = ""
    @Published var state:                WatchWidgetState  = .loading
    @Published var featureEnabled:       Bool              = true

    // MARK: Private

    private let appGroup = "group.com.praycalc.app"
    private var stateTimer: Timer?
    private var session: WCSession?

    // MARK: Init

    override init() {
        super.init()
        if WCSession.isSupported() {
            session = WCSession.default
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
        loadFromDefaults()
        startStateTimer()
    }

    deinit {
        stateTimer?.invalidate()
    }

    // MARK: - Public API

    /// Reload from AppGroup UserDefaults (called on appear, after WCSession message).
    func refresh() {
        loadFromDefaults()
    }

    /// Request an immediate data push from the iPhone companion.
    func requestUpdate() {
        guard let session, session.isReachable else { return }
        session.sendMessage(["action": "requestPrayerTimes"], replyHandler: nil)
    }

    // MARK: - Data Loading

    private func loadFromDefaults() {
        guard let defaults = UserDefaults(suiteName: appGroup) else {
            state = .error
            return
        }

        // Feature flag check
        featureEnabled = defaults.object(forKey: "ff_apple_watch") as? Bool ?? true

        let locationPending = defaults.bool(forKey: "widget_location_pending")
        let isStale         = defaults.bool(forKey: "widget_stale")
        let updatedAt       = defaults.double(forKey: "widget_updated_at")

        let effectivelyStale = isStale || (updatedAt > 0 && Date().timeIntervalSince1970 - updatedAt > 86400)

        guard let jsonStr = defaults.string(forKey: "widget_prayers"),
              let data    = jsonStr.data(using: .utf8),
              let items   = try? JSONDecoder().decode([PrayerSyncItem].self, from: data) else {

            if updatedAt == 0 {
                state = .loading
            } else if locationPending {
                state = .locationPending
            } else {
                state = .error
            }
            return
        }

        let nextName     = defaults.string(forKey: "widget_next_prayer")         ?? ""
        let nextTs       = defaults.double(forKey: "widget_next_prayer_ts")
        let locationName = defaults.string(forKey: "widget_location_name")       ?? ""
        let hijriDate    = defaults.string(forKey: "widget_hijri_date")          ?? ""

        self.locationName        = locationName
        self.hijriDate           = hijriDate
        self.nextPrayerName      = nextName
        self.nextPrayerTimestamp = nextTs

        let now = Date().timeIntervalSince1970
        let completedNames = items
            .filter { $0.timestamp < now && $0.name != nextName }
            .map(\.name)

        self.prayers = items.map { item in
            WatchPrayerItem(
                name: item.name,
                time: item.time,
                timestamp: item.timestamp,
                isNext: item.name == nextName,
                isCompleted: completedNames.contains(item.name)
            )
        }

        updateState(locationPending: locationPending, effectivelyStale: effectivelyStale)
        reloadComplications()
    }

    private func updateState(locationPending: Bool, effectivelyStale: Bool) {
        if locationPending {
            state = .locationPending
            return
        }
        if effectivelyStale {
            state = .stale
            return
        }

        let now  = Date().timeIntervalSince1970
        let secs = Int(nextPrayerTimestamp - now)
        secondsToNextPrayer = max(secs, 0)

        if secs < -300 {        // more than 5 min past — prayer over, next one
            state = .nominal
        } else if secs <= 0 {
            state = .atAdhan
        } else if secs <= 900 {
            state = .imminent
        } else {
            state = .nominal
        }
    }

    // MARK: - State Timer (transitions without data push)

    private func startStateTimer() {
        stateTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { [weak self] _ in
            Task { @MainActor [weak self] in
                self?.refreshState()
            }
        }
    }

    private func refreshState() {
        let defaults = UserDefaults(suiteName: appGroup)
        let locationPending = defaults?.bool(forKey: "widget_location_pending") ?? false
        let isStale         = defaults?.bool(forKey: "widget_stale") ?? false
        let updatedAt       = defaults?.double(forKey: "widget_updated_at") ?? 0
        let effectivelyStale = isStale || (updatedAt > 0 && Date().timeIntervalSince1970 - updatedAt > 86400)
        updateState(locationPending: locationPending, effectivelyStale: effectivelyStale)
    }

    // MARK: - Complication reload

    private func reloadComplications() {
        let server = CLKComplicationServer.sharedInstance()
        server.activeComplications?.forEach { server.reloadTimeline(for: $0) }
    }
}

// MARK: - WCSessionDelegate

extension WatchPrayerService: WCSessionDelegate {

    nonisolated func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) { }

    nonisolated func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        Task { @MainActor in self.loadFromDefaults() }
    }

    nonisolated func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any],
        replyHandler: @escaping ([String: Any]) -> Void
    ) {
        Task { @MainActor in self.loadFromDefaults() }
        replyHandler(["status": "ok"])
    }

    nonisolated func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
        Task { @MainActor in self.loadFromDefaults() }
    }
}

// MARK: - Internal Codable model matching widget_prayers JSON

private struct PrayerSyncItem: Codable {
    let name: String
    let time: String
    let timestamp: Double
    let isNext: Bool
}
