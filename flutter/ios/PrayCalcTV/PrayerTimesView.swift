// PrayCalcTV — Prayer Times tab
// Full-screen horizontal prayer grid. Next prayer highlighted with pulse.
// Countdown timer ticks every second from PrayerStore.

import SwiftUI

// MARK: - Brand colors

private let brandLight  = Color(red: 0.79, green: 0.76, blue: 0.48) // #C9F27A
private let brandMid    = Color(red: 0.47, green: 0.76, blue: 0.30) // #79C24C
private let brandDark   = Color(red: 0.12, green: 0.37, blue: 0.18) // #1E5E2F
private let brandDeep   = Color(red: 0.05, green: 0.19, blue: 0.09) // #0D2F17

// MARK: - PrayerTimesView

struct PrayerTimesView: View {
    @EnvironmentObject private var prayerStore: PrayerStore
    @State private var pulseScale: CGFloat = 1.0

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [brandDeep, brandDark, Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 0) {
                headerBar
                Spacer()
                prayerGrid
                Spacer()
                countdownBar
                Spacer(minLength: 40)
            }
            .padding(.horizontal, 80)
        }
        .onAppear {
            startPulse()
        }
    }

    // MARK: - Header

    private var headerBar: some View {
        VStack(spacing: 8) {
            Text(prayerStore.city)
                .font(.system(size: 48, weight: .light))
                .foregroundColor(.white)

            Text(formattedDate())
                .font(.system(size: 28, weight: .regular))
                .foregroundColor(.white.opacity(0.5))
        }
        .padding(.top, 60)
    }

    // MARK: - Prayer grid

    private var prayerGrid: some View {
        Group {
            if prayerStore.isLoading {
                ProgressView()
                    .scaleEffect(2)
                    .tint(brandLight)
            } else if let err = prayerStore.errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 60))
                        .foregroundColor(brandMid)
                    Text(err)
                        .font(.system(size: 28))
                        .foregroundColor(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                }
            } else {
                HStack(spacing: 0) {
                    ForEach(prayerStore.prayers) { prayer in
                        PrayerCard(
                            prayer: prayer,
                            timeString: prayerStore.formatTime(prayer.time),
                            pulseScale: pulseScale
                        )
                    }
                }
            }
        }
    }

    // MARK: - Countdown bar

    private var countdownBar: some View {
        VStack(spacing: 10) {
            if let next = prayerStore.nextPrayer {
                HStack(spacing: 12) {
                    Text("Next:")
                        .font(.system(size: 32, weight: .regular))
                        .foregroundColor(.white.opacity(0.6))
                    Text(next.name)
                        .font(.system(size: 32, weight: .semibold))
                        .foregroundColor(brandLight)
                    Text("·")
                        .foregroundColor(.white.opacity(0.4))
                    Text(prayerStore.countdown)
                        .font(.system(size: 32, weight: .bold, design: .rounded))
                        .foregroundColor(brandLight)
                        .monospacedDigit()
                }
            }
        }
        .frame(height: 60)
    }

    // MARK: - Pulse animation

    private func startPulse() {
        withAnimation(
            .easeInOut(duration: 1.4)
            .repeatForever(autoreverses: true)
        ) {
            pulseScale = 1.06
        }
    }

    private func formattedDate() -> String {
        let f = DateFormatter()
        f.dateStyle = .full
        f.timeStyle = .none
        return f.string(from: Date())
    }
}

// MARK: - PrayerCard

struct PrayerCard: View {
    let prayer: Prayer
    let timeString: String
    let pulseScale: CGFloat

    var body: some View {
        VStack(spacing: 20) {
            // Arabic name
            Text(prayer.arabicName)
                .font(.system(size: 48, weight: .light))
                .foregroundColor(prayer.isNext ? brandLight : .white.opacity(0.55))
                .multilineTextAlignment(.center)

            // English name
            Text(prayer.name)
                .font(.system(size: 30, weight: prayer.isNext ? .semibold : .regular))
                .foregroundColor(prayer.isNext ? brandLight : .white.opacity(0.7))

            // Time
            Text(timeString)
                .font(.system(size: 36, weight: .bold, design: .rounded))
                .foregroundColor(prayer.isNext ? brandLight : .white)
                .monospacedDigit()

            // Next indicator dot
            if prayer.isNext {
                Circle()
                    .fill(brandLight)
                    .frame(width: 12, height: 12)
                    .scaleEffect(pulseScale)
            } else {
                Circle()
                    .fill(Color.clear)
                    .frame(width: 12, height: 12)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 48)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(prayer.isNext
                      ? brandDark.opacity(0.6)
                      : Color.white.opacity(0.04))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(prayer.isNext ? brandMid.opacity(0.5) : Color.clear, lineWidth: 2)
                )
        )
        .scaleEffect(prayer.isNext ? 1.04 : 1.0)
        .padding(.horizontal, 10)
        .animation(.easeInOut(duration: 0.3), value: prayer.isNext)
    }
}

#Preview {
    PrayerTimesView()
        .environmentObject(PrayerStore())
}
