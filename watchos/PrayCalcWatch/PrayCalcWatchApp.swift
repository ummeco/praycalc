import SwiftUI

@main
struct PrayCalcWatchApp: App {
    @StateObject private var prayerService = PrayerService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(prayerService)
        }
    }
}
