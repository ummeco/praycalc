import SwiftUI
import WatchKit

struct CountdownView: View {
    @EnvironmentObject var prayerService: PrayerService
    @State private var timeRemaining: TimeInterval = 0
    @State private var progress: Double = 0
    @State private var isPulsing = false
    @State private var timer: Timer?

    private let brandGreen = Color(red: 0x79 / 255.0, green: 0xC2 / 255.0, blue: 0x4C / 255.0)
    private let accentGreen = Color(red: 0xC9 / 255.0, green: 0xF2 / 255.0, blue: 0x7A / 255.0)
    private let deepGreen = Color(red: 0x0D / 255.0, green: 0x2F / 255.0, blue: 0x17 / 255.0)

    var body: some View {
        VStack(spacing: 6) {
            if let response = prayerService.prayerResponse {
                prayerNameLabel(response.nextPrayer.name)

                ZStack {
                    progressRing
                    countdownText
                }
                .frame(width: 120, height: 120)
                .scaleEffect(isPulsing ? 1.05 : 1.0)
                .animation(
                    isPulsing ? .easeInOut(duration: 0.6).repeatForever(autoreverses: true) : .default,
                    value: isPulsing
                )

                Text("until \(response.nextPrayer.name)")
                    .font(.system(.caption2, design: .rounded))
                    .foregroundColor(.gray)
            } else {
                ProgressView()
                    .tint(brandGreen)
                Text("Loading...")
                    .font(.caption2)
                    .foregroundColor(.gray)
            }
        }
        .onAppear { startTimer() }
        .onDisappear { stopTimer() }
        .onChange(of: prayerService.prayerResponse?.nextPrayer.name) { _ in
            updateCountdown()
        }
    }

    private func prayerNameLabel(_ name: String) -> some View {
        Text(name.uppercased())
            .font(.system(.caption, design: .rounded))
            .fontWeight(.bold)
            .foregroundColor(accentGreen)
            .tracking(2)
    }

    private var progressRing: some View {
        ZStack {
            Circle()
                .stroke(deepGreen, lineWidth: 6)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(
                    AngularGradient(
                        gradient: Gradient(colors: [brandGreen, accentGreen]),
                        center: .center,
                        startAngle: .degrees(-90),
                        endAngle: .degrees(270)
                    ),
                    style: StrokeStyle(lineWidth: 6, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 1), value: progress)
        }
    }

    private var countdownText: some View {
        Text(formattedCountdown)
            .font(.system(.title3, design: .monospaced))
            .fontWeight(.medium)
            .foregroundColor(.white)
            .minimumScaleFactor(0.6)
    }

    private var formattedCountdown: String {
        if timeRemaining <= 0 { return "Now" }

        let hours = Int(timeRemaining) / 3600
        let minutes = (Int(timeRemaining) % 3600) / 60

        if hours > 0 {
            return "\(hours)h \(minutes)m"
        } else {
            let seconds = Int(timeRemaining) % 60
            return "\(minutes)m \(seconds)s"
        }
    }

    // MARK: - Timer

    private func startTimer() {
        updateCountdown()
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            updateCountdown()
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func updateCountdown() {
        guard let response = prayerService.prayerResponse else { return }

        let remaining = response.timeUntilNextPrayer() ?? 0
        let total = response.totalIntervalBetweenPrayers() ?? 1

        timeRemaining = remaining

        if total > 0 {
            let elapsed = total - remaining
            progress = min(max(elapsed / total, 0), 1)
        }

        if remaining <= 60 && remaining > 0 {
            isPulsing = true
            WKInterfaceDevice.current().play(.notification)
        } else if remaining <= 0 {
            isPulsing = false
            WKInterfaceDevice.current().play(.success)
        } else {
            isPulsing = false
        }
    }
}

#Preview {
    CountdownView()
        .environmentObject(PrayerService())
}
