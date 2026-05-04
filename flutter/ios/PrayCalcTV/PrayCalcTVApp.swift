// PrayCalcTVApp — App entry point (tvOS 15+)
// v1.1: Added FF_TV gate, PushPrayerService, AmbientView tab, LinkView tab.
// Spec §8.3–8.5, S19-F T29

import SwiftUI
import UserNotifications

@main
struct PrayCalcTVApp: App {
    @StateObject private var prayerStore   = PrayerStore()
    @StateObject private var pushService   = PushPrayerService()

    // Ambient mode overlay
    @State private var showAmbient = false

    var body: some Scene {
        WindowGroup {
            if featureFlagTV {
                ContentView(showAmbient: $showAmbient)
                    .environmentObject(prayerStore)
                    .environmentObject(pushService)
                    .overlay {
                        if showAmbient {
                            AmbientView(isPresented: $showAmbient)
                                .environmentObject(prayerStore)
                                .transition(.opacity)
                        }
                    }
                    .animation(.easeInOut(duration: 0.4), value: showAmbient)
                    .onReceive(
                        NotificationCenter.default.publisher(for: UIApplication.didEnterBackgroundNotification)
                    ) { _ in showAmbient = true }
                    .onReceive(
                        NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)
                    ) { _ in showAmbient = false }
            } else {
                LockedView()
            }
        }
    }

    // MARK: - FF_TV feature flag

    /// FF_TV gate — default: true (Desktop/TV is FREE per D-S19-02).
    /// The Flutter MethodChannel sets "ff_tv" in UserDefaults on launch.
    private var featureFlagTV: Bool {
        if UserDefaults.standard.object(forKey: "ff_tv") != nil {
            return UserDefaults.standard.bool(forKey: "ff_tv")
        }
        return true
    }
}

// MARK: - ContentView (tab shell)

struct ContentView: View {
    @EnvironmentObject var prayerStore: PrayerStore
    @EnvironmentObject var pushService: PushPrayerService
    @Binding var showAmbient: Bool

    var body: some View {
        TabView {
            PrayerTimesView()
                .tabItem {
                    Label("Prayer Times", systemImage: "clock")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }

            LinkView()
                .tabItem {
                    Label("Link Phone", systemImage: "qrcode")
                }
        }
        .onAppear {
            // Register for push notifications (FF_TV checked inside PushPrayerService)
            pushService.setup()
        }
        // Navigate to PrayerTimesView when a push notification is tapped
        .onReceive(NotificationCenter.default.publisher(for: .prayCalcShowPrayerTimes)) { _ in
            showAmbient = false
        }
    }
}

// MARK: - LockedView (FF_TV = false)

struct LockedView: View {
    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            VStack(spacing: 20) {
                Image(systemName: "moon.zzz")
                    .font(.system(size: 80))
                    .foregroundColor(.white.opacity(0.3))
                Text("PrayCalc TV")
                    .font(.system(size: 52, weight: .ultraLight))
                    .foregroundColor(.white.opacity(0.5))
                Text("TV support is not enabled on this device.")
                    .font(.system(size: 28))
                    .foregroundColor(.white.opacity(0.3))
            }
        }
    }
}
