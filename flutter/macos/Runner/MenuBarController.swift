// MenuBarController.swift — PrayCalc macOS menu bar.
// Spec §6.1, S19-E T24
//
// Provides:
//   - Menu bar icon: mosque SF Symbol (or emoji fallback) + next-prayer countdown
//   - Popover: today's prayer list, location/Hijri date, [Settings...], [Quit]
//   - Keyboard shortcuts:
//       Cmd+Option+P — toggle popover
//       Cmd+,        — open Settings window (routes to Flutter via MethodChannel)
//       Cmd+Q        — quit
//   - Respects NSWorkspace.accessibilityDisplayShouldReduceMotion for animations
//   - UNUserNotificationCenter + CoreLocation permissions on first launch
//   - FF_DESKTOP_TRAY feature flag gate (per D-S19-02: Desktop is FREE)
//
// Data source: Flutter SharedPreferences via MethodChannel
// "praycalc/menubar" (the Flutter side calls onMenuBarDataReady with a map).
// Also supports a 60 s timer fallback reading cached values from UserDefaults
// (group.com.praycalc.app) written by the notification service.

import Cocoa
import UserNotifications
import CoreLocation
import FlutterMacOS

// MARK: - MenuBarController

final class MenuBarController: NSObject {

    // MARK: Private properties

    private var statusItem: NSStatusItem?
    private var popover: NSPopover?
    private var popoverVC: MenuBarPopoverViewController?
    private weak var flutterController: FlutterViewController?

    private var prayerData: MenuBarData = .placeholder
    private var refreshTimer: Timer?
    private let appGroup = "group.com.praycalc.app"

    // MARK: Init

    init(flutterController: FlutterViewController) {
        self.flutterController = flutterController
        super.init()
    }

    // MARK: Setup

    /// Call from AppDelegate.applicationDidFinishLaunching.
    func setup() {
        guard featureFlagEnabled else { return }

        setupStatusItem()
        setupPopover()
        setupFlutterChannel()
        setupKeyboardShortcuts()
        requestNotificationPermission()
        requestLocationPermission()

        // Refresh countdown every 60 s even when Flutter doesn't push data
        refreshTimer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { [weak self] _ in
            self?.refreshFromDefaults()
            self?.updateStatusTitle()
        }
        refreshFromDefaults()
        updateStatusTitle()
    }

    // MARK: - Feature flag

    private var featureFlagEnabled: Bool {
        // D-S19-02: Desktop is FREE — default true
        let defaults = UserDefaults(suiteName: appGroup)
        return defaults?.object(forKey: "ff_desktop_tray") as? Bool ?? true
    }

    // MARK: - Status item

    private func setupStatusItem() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)

        if let button = statusItem?.button {
            // Prefer SF Symbol; fallback to emoji on older macOS
            if #available(macOS 11.0, *) {
                button.image = NSImage(systemSymbolName: "moon.stars", accessibilityDescription: "PrayCalc")
            } else {
                button.title = "🕌"
            }
            button.action = #selector(togglePopover(_:))
            button.target = self
            button.toolTip = "PrayCalc — next prayer"
            button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        }
    }

    private func updateStatusTitle() {
        guard let button = statusItem?.button else { return }

        let title: String
        let secs = Int(prayerData.nextPrayerTimestamp - Date().timeIntervalSince1970)
        let countdown: String
        if secs <= 0 {
            countdown = "Now"
        } else if secs < 3600 {
            countdown = "\(secs / 60)m"
        } else {
            countdown = "\(secs / 3600)h \((secs % 3600) / 60)m"
        }

        if #available(macOS 11.0, *) {
            // Icon + text
            title = "\(prayerData.nextPrayer) \(countdown)"
        } else {
            title = "🕌 \(prayerData.nextPrayer) \(countdown)"
        }

        button.title = title
        button.toolTip = "\(prayerData.nextPrayer) at \(prayerData.nextPrayerTime)"
    }

    // MARK: - Popover

    private func setupPopover() {
        let vc = MenuBarPopoverViewController()
        vc.data = prayerData
        vc.onSettings = { [weak self] in
            self?.closePopover()
            self?.openSettings()
        }
        vc.onQuit = {
            NSApplication.shared.terminate(nil)
        }

        let pop = NSPopover()
        pop.contentViewController = vc
        pop.behavior = .transient    // closes on outside click
        pop.animates = !NSWorkspace.shared.accessibilityDisplayShouldReduceMotion

        popover = pop
        popoverVC = vc
    }

    @objc private func togglePopover(_ sender: AnyObject?) {
        if popover?.isShown == true {
            closePopover()
        } else {
            openPopover()
        }
    }

    private func openPopover() {
        guard let button = statusItem?.button else { return }
        popoverVC?.data = prayerData
        popoverVC?.reload()
        popover?.show(
            relativeTo: button.bounds,
            of: button,
            preferredEdge: .minY
        )
        // Make popover key so keyboard navigation works
        popover?.contentViewController?.view.window?.makeKey()
    }

    func closePopover() {
        popover?.performClose(nil)
    }

    // MARK: - Settings + Quit

    private func openSettings() {
        // Route to Flutter via MethodChannel
        let channel = FlutterMethodChannel(
            name: "praycalc/menubar",
            binaryMessenger: flutterController!.engine.binaryMessenger
        )
        channel.invokeMethod("openSettings", arguments: nil)
    }

    // MARK: - Flutter MethodChannel

    private func setupFlutterChannel() {
        guard let fc = flutterController else { return }
        let channel = FlutterMethodChannel(
            name: "praycalc/menubar",
            binaryMessenger: fc.engine.binaryMessenger
        )
        channel.setMethodCallHandler { [weak self] call, result in
            switch call.method {
            case "onMenuBarDataReady":
                if let args = call.arguments as? [String: Any] {
                    self?.handleFlutterData(args)
                }
                result(nil)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }

    private func handleFlutterData(_ args: [String: Any]) {
        prayerData = MenuBarData(
            nextPrayer:          args["nextPrayer"] as? String ?? "Fajr",
            nextPrayerTime:      args["nextPrayerTime"] as? String ?? "--:--",
            nextPrayerTimestamp: args["nextPrayerTs"] as? Double ?? 0,
            prayers:             parsePrayers(args["prayers"]),
            locationName:        args["locationName"] as? String ?? "",
            hijriDate:           args["hijriDate"] as? String ?? ""
        )
        updateStatusTitle()
        if popover?.isShown == true {
            popoverVC?.data = prayerData
            popoverVC?.reload()
        }
    }

    // MARK: - UserDefaults fallback

    private func refreshFromDefaults() {
        guard let defaults = UserDefaults(suiteName: appGroup) else { return }
        let nextPrayer = defaults.string(forKey: "widget_next_prayer") ?? "Fajr"
        let nextTime   = defaults.string(forKey: "widget_next_prayer_time") ?? "--:--"
        let nextTs     = defaults.double(forKey: "widget_next_prayer_ts")
        let location   = defaults.string(forKey: "widget_location_name") ?? ""
        let hijri      = defaults.string(forKey: "widget_hijri_date") ?? ""

        // Only overwrite if Flutter hasn't provided newer data
        if prayerData.nextPrayer == MenuBarData.placeholder.nextPrayer {
            prayerData = MenuBarData(
                nextPrayer: nextPrayer,
                nextPrayerTime: nextTime,
                nextPrayerTimestamp: nextTs,
                prayers: [],
                locationName: location,
                hijriDate: hijri
            )
        }
    }

    // MARK: - Permissions

    private func requestNotificationPermission() {
        UNUserNotificationCenter.current().requestAuthorization(
            options: [.alert, .sound, .badge]
        ) { _, _ in }
    }

    private func requestLocationPermission() {
        let mgr = CLLocationManager()
        mgr.requestWhenInUseAuthorization()
    }

    // MARK: - Keyboard shortcuts

    private func setupKeyboardShortcuts() {
        // Cmd+Option+P: toggle popover
        NSEvent.addGlobalMonitorForEvents(matching: .keyDown) { [weak self] event in
            guard event.modifierFlags.contains([.command, .option]),
                  event.keyCode == 35 /* P */ else { return }
            self?.togglePopover(nil)
        }
        // Note: Cmd+, and Cmd+Q are wired via the main menu in MainMenu.xib
        // and handled in AppDelegate; we don't need to duplicate them here.
    }

    // MARK: - Helpers

    private func parsePrayers(_ raw: Any?) -> [PrayerRow] {
        guard let arr = raw as? [[String: Any]] else { return [] }
        return arr.compactMap { d in
            guard let name = d["name"] as? String,
                  let time = d["time"] as? String else { return nil }
            return PrayerRow(
                name:      name,
                time:      time,
                isNext:    d["isNext"] as? Bool ?? false,
                isDone:    d["isDone"] as? Bool ?? false
            )
        }
    }
}

// MARK: - Data Models

struct MenuBarData {
    let nextPrayer:          String
    let nextPrayerTime:      String
    let nextPrayerTimestamp: Double
    let prayers:             [PrayerRow]
    let locationName:        String
    let hijriDate:           String

    static let placeholder = MenuBarData(
        nextPrayer: "Fajr", nextPrayerTime: "--:--",
        nextPrayerTimestamp: 0, prayers: [],
        locationName: "", hijriDate: ""
    )
}

struct PrayerRow {
    let name:   String
    let time:   String
    let isNext: Bool
    let isDone: Bool
}

// MARK: - MenuBarPopoverViewController

/// Programmatic NSViewController — no XIB required.
final class MenuBarPopoverViewController: NSViewController {

    var data: MenuBarData = .placeholder
    var onSettings: (() -> Void)?
    var onQuit: (() -> Void)?

    private let pcGreen = NSColor(red: 0.788, green: 0.949, blue: 0.478, alpha: 1)
    private let pcDark  = NSColor(red: 0.118, green: 0.369, blue: 0.184, alpha: 1)

    private var stackView: NSStackView!

    override func loadView() {
        view = NSView(frame: NSRect(x: 0, y: 0, width: 260, height: 320))
        view.wantsLayer = true
        view.layer?.backgroundColor = pcDark.cgColor
        view.layer?.cornerRadius = 10

        stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .centerX
        stackView.spacing = 4
        stackView.edgeInsets = NSEdgeInsets(top: 12, left: 12, bottom: 12, right: 12)
        stackView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stackView)

        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.topAnchor),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            stackView.bottomAnchor.constraint(lessThanOrEqualTo: view.bottomAnchor)
        ])

        reload()
    }

    func reload() {
        guard isViewLoaded else { return }
        stackView.arrangedSubviews.forEach { $0.removeFromSuperview() }

        // Location + hijri date
        if !data.locationName.isEmpty {
            stackView.addArrangedSubview(makeLabel(data.locationName, size: 11, color: .lightGray))
        }
        if !data.hijriDate.isEmpty {
            stackView.addArrangedSubview(makeLabel(data.hijriDate, size: 10, color: .lightGray))
        }

        // Divider
        stackView.addArrangedSubview(makeDivider())

        // Prayer rows
        let prayerNames = data.prayers.isEmpty
            ? [PrayerRow(name: data.nextPrayer, time: data.nextPrayerTime, isNext: true, isDone: false)]
            : data.prayers

        for row in prayerNames {
            stackView.addArrangedSubview(makePrayerRow(row))
        }

        // Divider
        stackView.addArrangedSubview(makeDivider())

        // Settings + Quit buttons
        let settings = makeButton("Settings\u{2026}", action: #selector(settingsTapped))
        let quit     = makeButton("Quit PrayCalc", action: #selector(quitTapped))
        stackView.addArrangedSubview(settings)
        stackView.addArrangedSubview(quit)
    }

    // MARK: - Button actions

    @objc private func settingsTapped() { onSettings?() }
    @objc private func quitTapped()    { onQuit?()     }

    // MARK: - View builders

    private func makeLabel(_ text: String, size: CGFloat, color: NSColor) -> NSTextField {
        let tf = NSTextField(labelWithString: text)
        tf.font      = .systemFont(ofSize: size)
        tf.textColor = color
        tf.alignment = .center
        return tf
    }

    private func makePrayerRow(_ row: PrayerRow) -> NSView {
        let container = NSView()
        container.translatesAutoresizingMaskIntoConstraints = false

        let nameLabel = NSTextField(labelWithString: row.name)
        nameLabel.font      = .systemFont(ofSize: 13, weight: row.isNext ? .bold : .regular)
        nameLabel.textColor = row.isNext ? pcGreen : (row.isDone ? NSColor(red: 0.475, green: 0.761, blue: 0.298, alpha: 1) : .lightGray)

        let timeLabel = NSTextField(labelWithString: row.time)
        timeLabel.font      = .systemFont(ofSize: 13)
        timeLabel.textColor = nameLabel.textColor
        timeLabel.alignment = .right

        nameLabel.translatesAutoresizingMaskIntoConstraints = false
        timeLabel.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(nameLabel)
        container.addSubview(timeLabel)

        NSLayoutConstraint.activate([
            nameLabel.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            nameLabel.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            timeLabel.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            timeLabel.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            container.heightAnchor.constraint(equalToConstant: 24),
            container.widthAnchor.constraint(equalToConstant: 230)
        ])

        // VoiceOver
        container.setAccessibilityLabel(
            row.isNext ? "\(row.name) next at \(row.time)"
                       : "\(row.name) at \(row.time)"
        )
        return container
    }

    private func makeDivider() -> NSView {
        let v = NSBox()
        v.boxType = .separator
        return v
    }

    private func makeButton(_ title: String, action: Selector) -> NSButton {
        let btn = NSButton(title: title, target: self, action: action)
        btn.isBordered   = false
        btn.contentTintColor = NSColor.lightGray
        btn.font = .systemFont(ofSize: 12)
        return btn
    }
}
