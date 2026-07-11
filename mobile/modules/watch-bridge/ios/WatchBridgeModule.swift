// Purpose: App-process WatchConnectivity bridge — the phone side of the phone -> watch
//   settings sync documented in watchos/PrayCalcWatch/Sync/WatchSessionManager.swift's
//   header comment ("Phone-side contract"). Exposes activate/isPaired/isWatchAppInstalled/
//   updateApplicationContext to JS so mobile/src/lib/watch/watchSync.ts never has to touch
//   WatchConnectivity directly. This module is send-only: the watch owns all receive-side
//   validation + storage (SharedLocationStore) already.
// Inputs (from JS, mobile/src/lib/watch/nativeWatchBridge.ts):
//   activate() -> Void ; isSupported() -> Bool ; isPaired() -> Bool ;
//   isWatchAppInstalled() -> Bool ; updateApplicationContext(payload) -> Bool
// Outputs: WatchBridgeModule (autolinked via expo-module.config.json).
// Constraints: WatchConnectivity requires a physical device pairing to do anything useful;
//   every function degrades to a safe no-op/false on the Simulator or an unpaired/no-watch
//   device instead of throwing, so callers never need a platform guard beyond Platform.OS.
//   The dictionary passed to updateApplicationContext MUST match WatchSessionManager.swift's
//   documented keys exactly (see @praycalc/bridge-types' toIosWatchContext, the only place
//   that shape is built).
// SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-watch-bridge-native

import ExpoModulesCore

#if canImport(WatchConnectivity)
import WatchConnectivity

/// Minimal delegate — WCSession requires one to activate even though this bridge is
/// send-only from the phone side (the watch already owns receipt logic in
/// WatchSessionManager.swift). Re-activates on deactivate so a subsequent send still works
/// after switching between multiple paired watches.
private class WatchBridgeSessionDelegate: NSObject, WCSessionDelegate {
    func session(
        _ session: WCSession,
        activationDidCompleteWith activationState: WCSessionActivationState,
        error: Error?
    ) {}

    func sessionDidBecomeInactive(_ session: WCSession) {}

    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }
}
#endif

public class WatchBridgeModule: Module {
    #if canImport(WatchConnectivity)
    private let delegate = WatchBridgeSessionDelegate()
    #endif

    public func definition() -> ModuleDefinition {
        Name("WatchBridge")

        // Whether this device/OS can use WatchConnectivity at all.
        Function("isSupported") { () -> Bool in
            #if canImport(WatchConnectivity)
            return WCSession.isSupported()
            #else
            return false
            #endif
        }

        // Activate the session. Safe to call repeatedly (e.g. on every foreground) —
        // WCSession.activate() is idempotent once already activated.
        Function("activate") { () -> Void in
            #if canImport(WatchConnectivity)
            guard WCSession.isSupported() else { return }
            let session = WCSession.default
            session.delegate = self.delegate
            session.activate()
            #endif
        }

        // Whether ANY Apple Watch is paired to this iPhone (not necessarily running PrayCalc).
        Function("isPaired") { () -> Bool in
            #if canImport(WatchConnectivity)
            guard WCSession.isSupported() else { return false }
            return WCSession.default.isPaired
            #else
            return false
            #endif
        }

        // Whether the PrayCalc watch app is installed on the paired watch.
        Function("isWatchAppInstalled") { () -> Bool in
            #if canImport(WatchConnectivity)
            guard WCSession.isSupported() else { return false }
            return WCSession.default.isWatchAppInstalled
            #else
            return false
            #endif
        }

        // Push the latest-state context (coalesced, delivered even if the watch app isn't
        // running). Returns false — rather than throwing — on any failure so a bridge error
        // can never break the caller's prayer-notification scheduling flow.
        Function("updateApplicationContext") { (payload: [String: Any]) -> Bool in
            #if canImport(WatchConnectivity)
            guard WCSession.isSupported(), WCSession.default.activationState == .activated else {
                return false
            }
            do {
                try WCSession.default.updateApplicationContext(payload)
                return true
            } catch {
                return false
            }
            #else
            return false
            #endif
        }
    }
}
