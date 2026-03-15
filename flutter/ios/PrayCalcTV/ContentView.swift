// PrayCalcTV — Root tab view
// Four tabs: Prayer Times · Quran · Streams · Settings.
// Adhan alert modal overlays the entire UI when prayer time fires.

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var prayerStore: PrayerStore
    @State private var showAdhanAlert = false
    @State private var selectedTab = 0

    // MARK: - Adhan alert check timer

    private let alertCheckTimer = Timer.publish(every: 30, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            TabView(selection: $selectedTab) {
                PrayerTimesView()
                    .tabItem { Label("Prayer Times", systemImage: "clock") }
                    .tag(0)

                QuranPlayerView()
                    .tabItem { Label("Quran", systemImage: "book") }
                    .tag(1)

                StreamsView()
                    .tabItem { Label("Streams", systemImage: "antenna.radiowaves.left.and.right") }
                    .tag(2)

                SettingsView()
                    .tabItem { Label("Settings", systemImage: "gearshape") }
                    .tag(3)
            }
            .accentColor(Color(red: 0.79, green: 0.76, blue: 0.48)) // #C9F27A

            // Adhan alert overlay
            if showAdhanAlert, let prayer = prayerStore.currentAdhanPrayer {
                AdhanAlertView(prayer: prayer) {
                    showAdhanAlert = false
                    prayerStore.currentAdhanPrayer = nil
                }
                .transition(.opacity)
                .zIndex(999)
            }
        }
        .onReceive(alertCheckTimer) { _ in
            checkForAdhan()
        }
        .onReceive(prayerStore.$adhanFired) { fired in
            if fired {
                showAdhanAlert = true
            }
        }
    }

    private func checkForAdhan() {
        prayerStore.checkAdhanTrigger()
    }
}

// MARK: - Adhan Alert Overlay

struct AdhanAlertView: View {
    let prayer: Prayer
    let onDismiss: () -> Void

    @State private var opacity: Double = 0
    @State private var dismissTimer: Timer?

    // Arabic prayer names for the overlay
    private var arabicName: String { prayer.arabicName }

    var body: some View {
        ZStack {
            // Dark translucent background
            Color.black.opacity(0.85)
                .ignoresSafeArea()

            VStack(spacing: 40) {
                // Arabic prayer name — large
                Text(arabicName)
                    .font(.system(size: 96, weight: .light))
                    .foregroundColor(Color(red: 0.79, green: 0.76, blue: 0.48))

                // English name
                Text(prayer.name)
                    .font(.system(size: 52, weight: .semibold))
                    .foregroundColor(.white)

                // "Prayer time"
                Text("Prayer time")
                    .font(.system(size: 36, weight: .regular))
                    .foregroundColor(.white.opacity(0.7))

                // Formatted time
                Text(prayer.time, style: .time)
                    .font(.system(size: 44, weight: .bold, design: .rounded))
                    .foregroundColor(Color(red: 0.79, green: 0.76, blue: 0.48))

                Spacer().frame(height: 20)

                Text("Press any button to dismiss")
                    .font(.system(size: 24))
                    .foregroundColor(.white.opacity(0.4))
            }
            .padding(80)
        }
        .opacity(opacity)
        .onAppear {
            withAnimation(.easeIn(duration: 0.4)) { opacity = 1.0 }
            // Auto-dismiss after 5 minutes
            dismissTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: false) { _ in
                onDismiss()
            }
        }
        .onExitCommand {
            dismissTimer?.invalidate()
            onDismiss()
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(PrayerStore())
}
