// AmbientView.swift — PrayCalcTV screensaver / ambient mode (tvOS 15+)
// Spec §8.3, S19-F T29
//
// Shows a minimal, burn-in-safe overlay when the app is idle:
//   - Slow sinusoidal drift (±40pt X, ±25pt Y over 30 minutes)
//   - Dark gradient background
//   - Prayer name + time + countdown
//   - Hijri date
//   - Auto-dismiss on any remote input (Menu or Select)

import SwiftUI
import Combine

// MARK: - Brand colors

private let pcLight = Color(red: 0.788, green: 0.949, blue: 0.478) // #C9F27A
private let pcMid   = Color(red: 0.475, green: 0.761, blue: 0.298) // #79C24C
private let pcDeep  = Color(red: 0.051, green: 0.184, blue: 0.090) // #0D2F17

// MARK: - AmbientView

struct AmbientView: View {
    @EnvironmentObject var prayerStore: PrayerStore
    @Binding var isPresented: Bool

    // Drift state
    @State private var driftX: CGFloat = 0
    @State private var driftY: CGFloat = 0
    @State private var driftTimer: Timer?

    // Time
    @State private var now = Date()
    @State private var clockTimer: Timer?

    private static let driftCycleSec: Double = 1800.0   // 30-minute full cycle
    private static let maxDriftX:     CGFloat = 40.0
    private static let maxDriftY:     CGFloat = 25.0

    var body: some View {
        ZStack {
            // Full-screen very dark background (OLED friendly)
            Color.black
                .ignoresSafeArea()

            // Drifting content block
            VStack(spacing: 16) {

                // Crescent icon
                Image(systemName: "moon.stars.fill")
                    .font(.system(size: 48))
                    .foregroundColor(pcMid.opacity(0.8))

                // Next prayer name
                if let next = prayerStore.nextPrayer {
                    Text(next.name)
                        .font(.system(size: 64, weight: .light))
                        .foregroundColor(pcLight)
                        .accessibilityLabel("\(next.name) is the next prayer")

                    Text(prayerStore.formatTime(next.time))
                        .font(.system(size: 44, weight: .thin, design: .rounded))
                        .foregroundColor(.white.opacity(0.7))
                        .monospacedDigit()

                    // Countdown
                    Text(prayerStore.countdown)
                        .font(.system(size: 36, weight: .regular, design: .rounded))
                        .foregroundColor(pcLight.opacity(0.85))
                        .monospacedDigit()
                        .accessibilityLabel("Time remaining: \(prayerStore.countdown)")
                }

                // Hijri date
                Text(hijriDate())
                    .font(.system(size: 24, weight: .ultraLight))
                    .foregroundColor(.white.opacity(0.4))
                    .padding(.top, 8)

            }
            .offset(x: driftX, y: driftY)
            .animation(.linear(duration: 1.0), value: driftX)
            .animation(.linear(duration: 1.0), value: driftY)

        }
        .onAppear(perform: startTimers)
        .onDisappear(perform: stopTimers)
        // Any remote input (Menu, Select, Play/Pause) dismisses ambient mode
        .focusable()
        .onPlayPauseCommand { isPresented = false }
        .onMoveCommand { _ in isPresented = false }
        .onLongPressGesture(minimumDuration: 0) { isPresented = false }
    }

    // MARK: - Drift animation

    private func startTimers() {
        // 1-second tick drives drift + countdown
        clockTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            updateDrift()
        }
    }

    private func stopTimers() {
        clockTimer?.invalidate()
        clockTimer = nil
        driftTimer?.invalidate()
        driftTimer = nil
    }

    private func updateDrift() {
        let elapsed  = Date().timeIntervalSince1970
        let phase    = (elapsed.truncatingRemainder(dividingBy: Self.driftCycleSec))
                       / Self.driftCycleSec
                       * 2 * .pi
        driftX = CGFloat(sin(phase))         * Self.maxDriftX
        driftY = CGFloat(cos(phase * 0.7))   * Self.maxDriftY * 0.6
    }

    // MARK: - Hijri date

    private func hijriDate() -> String {
        let cal = Calendar(identifier: .islamicUmmAlQura)
        let comps = cal.dateComponents([.year, .month, .day], from: Date())
        let monthNames = ["Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani",
                          "Jumada al-Ula","Jumada al-Akhira","Rajab","Sha'ban",
                          "Ramadan","Shawwal","Dhu al-Qi'dah","Dhu al-Hijjah"]
        let m = (comps.month ?? 1) - 1
        let month = m >= 0 && m < 12 ? monthNames[m] : ""
        return "\(comps.day ?? 1) \(month) \(comps.year ?? 1446)"
    }
}

// MARK: - Preview

#Preview {
    AmbientView(isPresented: .constant(true))
        .environmentObject(PrayerStore())
}
