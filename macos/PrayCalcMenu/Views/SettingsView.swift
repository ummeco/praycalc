import SwiftUI
import ServiceManagement

struct SettingsView: View {
    @ObservedObject var prayerService: PrayerService
    @AppStorage("calculationMethod") private var method = "isna"
    @AppStorage("madhab") private var madhab = "shafii"
    @AppStorage("useAutoLocation") private var useAutoLocation = true
    @AppStorage("manualLatitude") private var manualLatitude = ""
    @AppStorage("manualLongitude") private var manualLongitude = ""
    @AppStorage("launchAtLogin") private var launchAtLogin = false
    @AppStorage("notifyFajr") private var notifyFajr = true
    @AppStorage("notifyDhuhr") private var notifyDhuhr = true
    @AppStorage("notifyAsr") private var notifyAsr = true
    @AppStorage("notifyMaghrib") private var notifyMaghrib = true
    @AppStorage("notifyIsha") private var notifyIsha = true

    private let methods: [(key: String, label: String)] = [
        ("isna", "ISNA"),
        ("mwl", "MWL"),
        ("egypt", "Egypt"),
        ("makkah", "Umm al-Qura"),
        ("tehran", "Tehran"),
        ("karachi", "Karachi")
    ]

    private let madhabs: [(key: String, label: String)] = [
        ("shafii", "Shafi'i"),
        ("hanafi", "Hanafi")
    ]

    var body: some View {
        TabView {
            generalTab
                .tabItem {
                    Label("General", systemImage: "gear")
                }

            locationTab
                .tabItem {
                    Label("Location", systemImage: "location")
                }

            notificationsTab
                .tabItem {
                    Label("Notifications", systemImage: "bell")
                }
        }
        .frame(width: 400, height: 280)
        .onChange(of: method) { _ in prayerService.refresh() }
        .onChange(of: madhab) { _ in prayerService.refresh() }
        .onChange(of: useAutoLocation) { _ in prayerService.refresh() }
    }

    private var generalTab: some View {
        Form {
            Picker("Calculation Method", selection: $method) {
                ForEach(methods, id: \.key) { m in
                    Text(m.label).tag(m.key)
                }
            }
            .pickerStyle(.menu)

            Picker("Madhab", selection: $madhab) {
                ForEach(madhabs, id: \.key) { m in
                    Text(m.label).tag(m.key)
                }
            }
            .pickerStyle(.menu)

            Toggle("Launch at Login", isOn: $launchAtLogin)
                .onChange(of: launchAtLogin) { enabled in
                    setLaunchAtLogin(enabled)
                }
        }
        .padding()
    }

    private var locationTab: some View {
        Form {
            Toggle("Auto-detect Location", isOn: $useAutoLocation)

            if !useAutoLocation {
                TextField("Latitude", text: $manualLatitude)
                    .textFieldStyle(.roundedBorder)
                TextField("Longitude", text: $manualLongitude)
                    .textFieldStyle(.roundedBorder)

                Button("Save and Refresh") {
                    prayerService.refresh()
                }
                .buttonStyle(.borderedProminent)
                .tint(Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0))
            }

            if let location = prayerService.currentLocation {
                HStack {
                    Text("Current:")
                        .foregroundColor(.secondary)
                    Text(String(format: "%.4f, %.4f", location.latitude, location.longitude))
                        .font(.system(.body, design: .monospaced))
                }
            }
        }
        .padding()
    }

    private var notificationsTab: some View {
        Form {
            Section("Prayer Notifications") {
                Toggle("Fajr", isOn: $notifyFajr)
                Toggle("Dhuhr", isOn: $notifyDhuhr)
                Toggle("Asr", isOn: $notifyAsr)
                Toggle("Maghrib", isOn: $notifyMaghrib)
                Toggle("Isha", isOn: $notifyIsha)
            }

            Button("Request Notification Permission") {
                prayerService.requestNotificationPermission()
            }
            .buttonStyle(.borderedProminent)
            .tint(Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0))
        }
        .padding()
        .onChange(of: notifyFajr) { _ in prayerService.scheduleNotifications() }
        .onChange(of: notifyDhuhr) { _ in prayerService.scheduleNotifications() }
        .onChange(of: notifyAsr) { _ in prayerService.scheduleNotifications() }
        .onChange(of: notifyMaghrib) { _ in prayerService.scheduleNotifications() }
        .onChange(of: notifyIsha) { _ in prayerService.scheduleNotifications() }
    }

    private func setLaunchAtLogin(_ enabled: Bool) {
        if #available(macOS 13.0, *) {
            do {
                if enabled {
                    try SMAppService.mainApp.register()
                } else {
                    try SMAppService.mainApp.unregister()
                }
            } catch {
                print("Failed to \(enabled ? "register" : "unregister") login item: \(error)")
            }
        }
    }
}
