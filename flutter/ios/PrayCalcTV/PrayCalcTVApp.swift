// PrayCalcTV — App entry point (tvOS 15+)
// SwiftUI lifecycle. PrayerStore is injected as an EnvironmentObject
// so all child views share a single source of truth for prayer data.

import SwiftUI

@main
struct PrayCalcTVApp: App {
    @StateObject private var prayerStore = PrayerStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(prayerStore)
        }
    }
}
