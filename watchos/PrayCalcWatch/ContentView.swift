import SwiftUI

struct ContentView: View {
    @EnvironmentObject var prayerService: PrayerService
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            PrayerListView()
                .tag(0)

            CountdownView()
                .tag(1)

            QiblaView()
                .tag(2)

            SettingsView()
                .tag(3)
        }
        .tabViewStyle(.verticalPage)
        .onAppear {
            prayerService.startUpdating()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(PrayerService())
}
