import Flutter
import UIKit
import WatchConnectivity

@main
@objc class AppDelegate: FlutterAppDelegate {

  // MARK: - Properties

  private var watchChannel: FlutterMethodChannel?

  // MARK: - App lifecycle

  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    if #available(iOS 15.0, *) {
      if let registrar = self.registrar(forPlugin: "IAPPlugin") {
        IAPPlugin.register(with: registrar)
      }
    }
    if let registrar = self.registrar(forPlugin: "AudioPlugin") {
      AudioPlugin.register(with: registrar)
    }

    // Register the watch MethodChannel and activate WCSession.
    if let controller = window?.rootViewController as? FlutterViewController {
      let channel = FlutterMethodChannel(
        name: "com.praycalc.app/watch",
        binaryMessenger: controller.binaryMessenger
      )
      watchChannel = channel
      channel.setMethodCallHandler { [weak self] call, result in
        self?.handleWatchCall(call, result: result)
      }
    }

    if WCSession.isSupported() {
      WCSession.default.delegate = self
      WCSession.default.activate()
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

  // MARK: - MethodChannel handler

  private func handleWatchCall(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
    switch call.method {

    case "isReachable":
      guard WCSession.isSupported() else { result(false); return }
      result(WCSession.default.isReachable)

    case "syncPrayerTimes":
      guard WCSession.isSupported(),
            WCSession.default.activationState == .activated,
            let args = call.arguments as? [String: Any] else {
        result(false)
        return
      }
      // Build a flat [String: String] dict for the watch complication.
      // The Flutter side sends { "data": "<json>", "timestamp": "<iso>" }.
      // We forward the raw payload so the watch can decide what to store.
      let payload: [String: String] = args.compactMapValues { $0 as? String }
      if WCSession.default.isReachable {
        WCSession.default.sendMessage(payload, replyHandler: nil) { error in
          NSLog("WCSession sendMessage error: \(error.localizedDescription)")
        }
      }
      // Also push via transferCurrentComplicationUserInfo so complications
      // update even when the watch is not reachable right now.
      if WCSession.default.isComplicationEnabled {
        WCSession.default.transferCurrentComplicationUserInfo(payload)
      } else {
        WCSession.default.transferUserInfo(payload)
      }
      result(true)

    case "syncSettings":
      guard WCSession.isSupported(),
            WCSession.default.activationState == .activated,
            let args = call.arguments as? [String: Any] else {
        result(false)
        return
      }
      let payload: [String: String] = args.compactMapValues { $0 as? String }
      WCSession.default.transferUserInfo(payload)
      result(true)

    case "syncSubscriptionStatus":
      guard WCSession.isSupported(),
            WCSession.default.activationState == .activated,
            let args = call.arguments as? [String: Any] else {
        result(false)
        return
      }
      var payload = [String: String]()
      if let isPlus = args["isPlus"] as? Bool {
        payload["isPlus"] = isPlus ? "true" : "false"
      }
      if let expiresAt = args["expiresAt"] as? String {
        payload["expiresAt"] = expiresAt
      }
      WCSession.default.transferUserInfo(payload)
      result(true)

    case "requestWatchStatus":
      // Not yet implemented — returns nil so Flutter falls back gracefully.
      result(nil)

    default:
      result(FlutterMethodNotImplemented)
    }
  }
}

// MARK: - WCSessionDelegate

extension AppDelegate: WCSessionDelegate {

  func session(
    _ session: WCSession,
    activationDidCompleteWith activationState: WCSessionActivationState,
    error: Error?
  ) {
    DispatchQueue.main.async { [weak self] in
      self?.watchChannel?.invokeMethod(
        "onReachabilityChanged",
        arguments: activationState == .activated && session.isReachable
      )
    }
  }

  func sessionReachabilityDidChange(_ session: WCSession) {
    DispatchQueue.main.async { [weak self] in
      self?.watchChannel?.invokeMethod(
        "onReachabilityChanged",
        arguments: session.isReachable
      )
    }
  }

  func sessionDidBecomeInactive(_ session: WCSession) {}
  func sessionDidDeactivate(_ session: WCSession) {
    // Re-activate after the old watch is unpaired.
    WCSession.default.activate()
  }

  func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
    DispatchQueue.main.async { [weak self] in
      if let data = message["watchStatusJson"] as? String {
        self?.watchChannel?.invokeMethod("onWatchSettingsChanged", arguments: data)
      } else {
        // Watch is requesting fresh prayer times.
        self?.watchChannel?.invokeMethod("onRequestPrayerTimes", arguments: nil)
      }
    }
  }

  func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any] = [:]) {
    DispatchQueue.main.async { [weak self] in
      if let data = userInfo["watchStatusJson"] as? String {
        self?.watchChannel?.invokeMethod("onWatchSettingsChanged", arguments: data)
      }
    }
  }
}
