// AppDelegate.swift — PrayCalc macOS app delegate.
// Wires MenuBarController (v1.1, T24) to the FlutterViewController.

import Cocoa
import FlutterMacOS
import UserNotifications

@main
class AppDelegate: FlutterAppDelegate, UNUserNotificationCenterDelegate {

    private var menuBarController: MenuBarController?

    override func applicationDidFinishLaunching(_ notification: Notification) {
        UNUserNotificationCenter.current().delegate = self

        // MenuBarController — set up after the Flutter engine is ready
        if let mainWindow = NSApp.mainWindow,
           let flutterVC  = mainWindow.contentViewController as? FlutterViewController {
            let controller = MenuBarController(flutterController: flutterVC)
            controller.setup()
            menuBarController = controller
        }

        // Keyboard shortcut: Cmd+, → Settings (via Flutter)
        NSApp.mainMenu?
            .item(withTitle: "PrayCalc")?
            .submenu?
            .item(withTitle: "Preferences\u{2026}")?
            .action = #selector(openPreferences(_:))
    }

    override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        // Keep the app alive in the menu bar even when all windows are closed
        return false
    }

    override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        return true
    }

    // MARK: - Menu actions

    @objc private func openPreferences(_ sender: Any?) {
        // Route to Flutter settings screen
        if let mainWindow = NSApp.windows.first(where: { $0.isVisible }),
           let flutterVC = mainWindow.contentViewController as? FlutterViewController {
            let channel = FlutterMethodChannel(
                name: "praycalc/menubar",
                binaryMessenger: flutterVC.engine.binaryMessenger
            )
            channel.invokeMethod("openSettings", arguments: nil)
        }
        // Ensure main window is visible
        NSApp.mainWindow?.makeKeyAndOrderFront(nil)
    }

    // MARK: - UNUserNotificationCenterDelegate

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .sound])
    }
}
