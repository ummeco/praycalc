// PushPrayerService.swift — PrayCalcTV push notification service (tvOS 15+)
// Spec §8.4, S19-F T29
//
// On tvOS, local notifications cannot be scheduled for precise future times
// the way they can on iOS — tvOS backgrounding is extremely limited.
// Architecture: push-only alerts received via APNs from nSelf notify plugin.
//   1. Register for remote notifications (APNs)
//   2. Send the APNs device token to the PrayCalc backend
//      (POST /api/push-tokens with platform "tvos")
//   3. Backend (nSelf push plugin) sends push notifications at prayer time
//   4. App displays the banner via UNUserNotificationCenter delegate
//
// FF_TV gate: checked before registration — if false, skip silently.

import Foundation
import UIKit
import UserNotifications
import Combine

// MARK: - PushPrayerService

@MainActor
final class PushPrayerService: NSObject, ObservableObject, UNUserNotificationCenterDelegate {

    @Published private(set) var registrationState: RegistrationState = .idle
    @Published private(set) var apnsToken: String?

    enum RegistrationState {
        case idle
        case requesting
        case registered(token: String)
        case denied
        case error(String)
    }

    // MARK: - Feature flag gate

    /// FF_TV: read from UserDefaults (set by TV settings / Flutter channel).
    /// Default: true (D-S19-02 Desktop/TV is FREE per spec decision defaults).
    private var featureFlagEnabled: Bool {
        // Check UserDefaults key set by Flutter MethodChannel on app startup
        if UserDefaults.standard.object(forKey: "ff_tv") != nil {
            return UserDefaults.standard.bool(forKey: "ff_tv")
        }
        return true  // default: enabled
    }

    // MARK: - Setup

    /// Call from App @main after a brief delay (APNs registration must happen
    /// after the app's main window is ready on tvOS).
    func setup() {
        guard featureFlagEnabled else { return }

        UNUserNotificationCenter.current().delegate = self

        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { [weak self] granted, error in
            Task { @MainActor [weak self] in
                guard let self else { return }
                if let error {
                    self.registrationState = .error(error.localizedDescription)
                    return
                }
                if granted {
                    self.registrationState = .requesting
                    UIApplication.shared.registerForRemoteNotifications()
                } else {
                    self.registrationState = .denied
                }
            }
        }
    }

    /// Called by AppDelegate / App scene delegate when APNs returns the token.
    func didRegisterForRemoteNotifications(deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        apnsToken = token
        registrationState = .registered(token: token)
        Task { await uploadToken(token) }
    }

    func didFailToRegisterForRemoteNotifications(error: Error) {
        registrationState = .error(error.localizedDescription)
    }

    // MARK: - Token upload

    private func uploadToken(_ token: String) async {
        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        guard let url = URL(string: "https://praycalc.com/api/push-tokens") else { return }

        var req = URLRequest(url: url, timeoutInterval: 10)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let body: [String: Any] = [
            "token":     token,
            "platform":  "tvos",
            "device_id": deviceId,
        ]
        req.httpBody = try? JSONSerialization.data(withJSONObject: body)

        // Best-effort: no retry on failure (background is restricted on tvOS).
        _ = try? await URLSession.shared.data(for: req)
    }

    // MARK: - UNUserNotificationCenterDelegate

    /// Show banner + play sound even when the app is in the foreground
    /// (e.g. adhan arrives while user is viewing the prayer times screen).
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler:
            @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound, .badge])
    }

    /// Handle tap on notification — open the prayer times screen.
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        // Post a notification so ContentView can navigate to PrayerTimesView
        NotificationCenter.default.post(
            name: .prayCalcShowPrayerTimes,
            object: nil,
            userInfo: response.notification.request.content.userInfo
        )
        completionHandler()
    }
}

// MARK: - Notification name

extension Notification.Name {
    static let prayCalcShowPrayerTimes = Notification.Name("PrayCalcShowPrayerTimes")
}
