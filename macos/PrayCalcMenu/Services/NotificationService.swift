import Foundation
import UserNotifications
import AppKit

// NotificationService — schedules UNCalendarNotificationTrigger for each prayer.
// Called once on app launch and whenever prayers change.
class NotificationService {
    static let shared = NotificationService()
    private init() {}

    func requestPermission() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, _ in
            if granted {
                // Reschedule with current prayers
            }
        }
    }

    // Schedule notifications for today's prayers
    // prayers: array of (name: String, time: Date, enabled: Bool)
    func schedulePrayers(_ prayers: [(name: String, time: Date, enabled: Bool)]) {
        // Remove old prayer notifications
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers:
            prayers.map { "prayer-\($0.name.lowercased())" })

        let formatter = DateFormatter()
        formatter.timeStyle = .short

        for prayer in prayers where prayer.enabled && prayer.time > Date() {
            let content = UNMutableNotificationContent()
            content.title = "Prayer Time"
            content.body = "\(prayer.name) — \(formatter.string(from: prayer.time))"
            content.sound = .default

            var comps = Calendar.current.dateComponents([.hour, .minute], from: prayer.time)
            // Subtract 1 minute to notify slightly before
            comps.minute = (comps.minute ?? 0) - 1

            let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
            let request = UNNotificationRequest(
                identifier: "prayer-\(prayer.name.lowercased())",
                content: content,
                trigger: trigger
            )
            UNUserNotificationCenter.current().add(request, withCompletionHandler: nil)
        }
    }

    func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
}
