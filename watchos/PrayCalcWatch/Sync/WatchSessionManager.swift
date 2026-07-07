import Foundation
import WidgetKit
#if canImport(WatchConnectivity)
import WatchConnectivity
#endif

/// WatchSessionManager — the watch side of phone -> watch settings sync.
///
/// Purpose
/// -------
/// A paired iPhone (the React Native PrayCalc app) pushes the user's chosen
/// location + calculation preferences to the watch so the watch *follows the
/// phone* rather than relying on its own GPS. This manager is the receiver:
/// it activates a `WCSession`, listens for both `applicationContext` (the
/// latest-state channel, delivered even if the app was not running) and live
/// `sendMessage` payloads (foreground, low-latency), validates them, and writes
/// them into `SharedLocationStore` (the App Group the complication reads).
///
/// Offline-first guarantee
/// -----------------------
/// This is *additive*. When no phone is paired/reachable, nothing here fires and
/// the watch keeps using its own CoreLocation fix + stored defaults exactly as
/// before (see `PrayerService`). A received context simply overwrites the shared
/// store with the phone's authoritative values and rebuilds the widget timeline.
///
/// Phone-side contract (React Native — must be added in mobile/ later)
/// -------------------------------------------------------------------
/// The iOS phone app must transmit a dictionary with these exact keys/types via
/// `WCSession.updateApplicationContext(_:)` (preferred — coalesced, survives
/// relaunch) and/or `sendMessage(_:replyHandler:)` when both apps are live:
///
///     [
///       "latitude":  Double,   // decimal degrees,  e.g.  40.7128
///       "longitude": Double,   // decimal degrees,  e.g. -74.0060
///       "city":      String,   // display label,    e.g. "New York"
///       "method":    String,   // one of: isna | mwl | egypt |
///                              //         umm_al_qura | makkah | tehran | karachi
///       "madhab":    String,   // one of: shafii | shafi | hanafi
///       "ts":        Double    // optional: epoch seconds, for staleness/debug
///     ]
///
/// A React Native bridge module (e.g. `react-native-watch-connectivity`) exposes
/// `updateApplicationContext(context)` and `sendMessage(message)`; the RN app
/// should call `updateApplicationContext` whenever the user changes city/method/
/// madhab, and once on foreground, so a freshly-woken watch always has the latest.
/// Keys are case-sensitive and must match exactly; unknown method/madhab strings
/// fall back to ISNA/Shafi at read time (`SharedLocationStore` + `PrayCalcEngine`).
final class WatchSessionManager: NSObject {

    /// Shared singleton so the app owns exactly one active session.
    static let shared = WatchSessionManager()

    /// Posted after a phone payload has been stored, so the app can recompute
    /// prayer times from the new location without waiting for its own GPS.
    static let didReceivePhoneContext = Notification.Name("PrayCalcDidReceivePhoneContext")

    /// True once a phone payload has been applied this launch. The app can use
    /// this to prefer phone-sourced location over its own GPS while paired.
    private(set) var hasPhoneContext = false

    private override init() {
        super.init()
    }

    /// Activate the connectivity session if the platform supports it. Safe to
    /// call from `onAppear`; a no-op on hardware without a paired-phone channel.
    func activate() {
        #if canImport(WatchConnectivity)
        guard WCSession.isSupported() else { return }
        let session = WCSession.default
        session.delegate = self
        session.activate()
        // If the phone already pushed a context before we activated, apply it now.
        applyContext(session.receivedApplicationContext)
        #endif
    }

    // MARK: - Payload handling

    /// Validate a phone payload and, if it carries a usable coordinate, persist
    /// it to the shared store + rebuild the complication timeline. Ignores empty
    /// or malformed contexts so a bad push can never wipe a good stored location.
    private func applyContext(_ context: [String: Any]) {
        guard !context.isEmpty else { return }
        guard
            let latitude = context["latitude"] as? Double,
            let longitude = context["longitude"] as? Double,
            latitude != 0.0 || longitude != 0.0
        else { return }

        let method = (context["method"] as? String) ?? SharedLocationStore.methodKey
        let madhab = (context["madhab"] as? String) ?? SharedLocationStore.madhabKey

        SharedLocationStore.store(
            latitude: latitude,
            longitude: longitude,
            method: method,
            madhab: madhab
        )
        if let city = context["city"] as? String, !city.isEmpty {
            SharedLocationStore.city = city
        }

        hasPhoneContext = true

        // Rebuild the watch-face complication from the phone's location, and let
        // the app recompute its on-screen schedule. Hop to main for UI/WidgetKit.
        DispatchQueue.main.async {
            WidgetCenter.shared.reloadAllTimelines()
            NotificationCenter.default.post(
                name: Self.didReceivePhoneContext,
                object: nil,
                userInfo: context
            )
        }
    }
}

#if canImport(WatchConnectivity)
extension WatchSessionManager: WCSessionDelegate {

    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {
        // On successful activation, adopt whatever context the phone left for us.
        if activationState == .activated {
            applyContext(session.receivedApplicationContext)
        }
    }

    /// Latest-state channel: delivered even if the watch app was launched after
    /// the phone sent it. This is the primary path for settings sync.
    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        applyContext(applicationContext)
    }

    /// Live message channel (both apps foregrounded). Treated identically.
    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        applyContext(message)
    }

    /// Live message with a reply handler — ack so the phone knows we applied it.
    func session(
        _ session: WCSession,
        didReceiveMessage message: [String: Any],
        replyHandler: @escaping ([String: Any]) -> Void
    ) {
        applyContext(message)
        replyHandler(["applied": true])
    }
}
#endif
