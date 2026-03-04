import SwiftUI

@main
struct PrayCalcMenuApp: App {
    @StateObject private var prayerService = PrayerService()
    @State private var showSettings = false

    var body: some Scene {
        MenuBarExtra {
            MenuPopover(prayerService: prayerService, showSettings: $showSettings)
                .frame(width: 280, height: 420)
        } label: {
            HStack(spacing: 4) {
                Image(systemName: "moon.stars.fill")
                if let next = prayerService.nextPrayer {
                    Text("\(next.name) \(next.displayTime)")
                }
            }
        }
        .menuBarExtraStyle(.window)

        Settings {
            SettingsView(prayerService: prayerService)
        }
    }
}
