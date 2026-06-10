// PrayCalcWatch — ExtensionDelegate
// Receives prayer times from the phone via WCSession and stores them in
// AppGroup UserDefaults (group.com.praycalc.app) for the complication.
//
// NOTE: This target is not yet wired into the Xcode project. To complete
// the setup, add a new "Watch App" target in Xcode, add this file to it,
// enable the WatchKit App Capability, and add the AppGroup entitlement
// (group.com.praycalc.app) to both the watch extension and the Runner.

import WatchKit
import WatchConnectivity
import ClockKit

class ExtensionDelegate: NSObject, WKExtensionDelegate {

  // MARK: - Constants

  private static let appGroup = "group.com.praycalc.app"

  // MARK: - WKExtensionDelegate

  func applicationDidFinishLaunching() {
    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }
  }

  // MARK: - Prayer data storage

  /// Writes the flat [String: String] prayer payload to the shared AppGroup
  /// UserDefaults under the same keys used by the iOS home-screen widget, so a
  /// single data push feeds both the watch complication and the phone widget.
  ///
  /// Expected keys in [payload]:
  ///   "data"      — JSON string produced by WatchBridgeService.syncPrayerTimes()
  ///   "timestamp" — ISO-8601 string of the sync moment
  private func storePrayerPayload(_ payload: [String: Any]) {
    guard let defaults = UserDefaults(suiteName: Self.appGroup) else { return }

    // Store the raw JSON blob for the complication to decode.
    if let json = payload["data"] as? String {
      defaults.set(json, forKey: "watch_prayer_data")
    }
    if let ts = payload["timestamp"] as? String {
      defaults.set(ts, forKey: "watch_prayer_timestamp")
    }

    // Also parse and store individual keys matching the widget convention
    // (widget_fajr, widget_dhuhr, etc.) so the watch face can read them
    // with a simple string lookup without JSON parsing.
    if let json = payload["data"] as? String,
       let raw = json.data(using: .utf8),
       let obj = try? JSONSerialization.jsonObject(with: raw) as? [String: Any],
       let prayers = obj["prayers"] as? [String: Any] {
      let names = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
      for name in names {
        if let time = prayers[name] as? String {
          defaults.set(time, forKey: "widget_\(name)")
        }
      }
    }

    defaults.synchronize()
    reloadComplications()
  }

  /// Asks ClockKit to reload all active complication timelines.
  private func reloadComplications() {
    let server = CLKComplicationServer.sharedInstance()
    for complication in server.activeComplications ?? [] {
      server.reloadTimeline(for: complication)
    }
  }
}

// MARK: - WCSessionDelegate

extension ExtensionDelegate: WCSessionDelegate {

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    // Nothing to do on activation; we wait for the phone to push data.
  }

  /// Phone → Watch real-time message (when both are reachable).
  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    storePrayerPayload(message)
  }

  func session(
    _ session: WCSession,
    didReceiveMessage message: [String: Any],
    replyHandler: @escaping ([String: Any]) -> Void
  ) {
    storePrayerPayload(message)
    replyHandler(["status": "ok"])
  }

  /// Phone → Watch background transfer (used when watch is not reachable,
  /// also used for complication UserInfo which has higher delivery priority).
  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    storePrayerPayload(userInfo)
  }
}
