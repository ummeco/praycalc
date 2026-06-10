// LinkView.swift — PrayCalcTV device pairing via QR code (tvOS 15+)
// Spec §9.3, S19-F T29
//
// Shows a 6-character pairing code + QR code for the mobile companion to
// scan. The mobile app calls POST /api/devices/pair with the code to link
// the TV to the user's account, enabling:
//   - Push prayer alerts (via nSelf APNs TV)
//   - Remote settings management
//   - Live countdown subscription (Hasura realtime)
//
// Pairing code: single-use, TTL 15 min, bound to device fingerprint (T05).
// QR payload: "praycalc://pair?code=XXXXXX&device=<identifierForVendor>"

import SwiftUI
import CoreImage.CIFilterBuiltins

// MARK: - Brand colors

private let pcLight = Color(red: 0.788, green: 0.949, blue: 0.478)
private let pcMid   = Color(red: 0.475, green: 0.761, blue: 0.298)
private let pcDark  = Color(red: 0.118, green: 0.369, blue: 0.184)
private let pcDeep  = Color(red: 0.051, green: 0.184, blue: 0.090)

// MARK: - PairingState

enum PairingState {
    case loading
    case ready(code: String)
    case paired(deviceId: String)
    case expired
    case error(String)
}

// MARK: - LinkView

struct LinkView: View {
    @EnvironmentObject var prayerStore: PrayerStore
    @State private var state: PairingState = .loading
    @State private var expiryCountdown: Int = 900   // 15 min in seconds
    @State private var timer: Timer?
    @State private var pollTimer: Timer?

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [pcDeep, pcDark, Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 32) {
                header
                Spacer()
                content
                Spacer()
                footer
            }
            .padding(80)
        }
        .onAppear { Task { await fetchPairingCode() } }
        .onDisappear { cancelTimers() }
    }

    // MARK: - Header

    private var header: some View {
        VStack(spacing: 8) {
            Text("Link Your Phone")
                .font(.system(size: 52, weight: .light))
                .foregroundColor(.white)
                .accessibilityAddTraits(.isHeader)

            Text("Scan with PrayCalc on your iPhone or Android")
                .font(.system(size: 26, weight: .regular))
                .foregroundColor(.white.opacity(0.55))
        }
    }

    // MARK: - Content (state-driven)

    @ViewBuilder
    private var content: some View {
        switch state {
        case .loading:
            ProgressView()
                .scaleEffect(2)
                .tint(pcLight)

        case .ready(let code):
            HStack(spacing: 80) {
                // QR code
                if let qrImage = makeQRCode(code) {
                    Image(decorative: qrImage, scale: 1.0)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 260, height: 260)
                        .padding(16)
                        .background(Color.white)
                        .cornerRadius(12)
                        .accessibilityLabel("QR code — scan with PrayCalc on your phone")
                }

                // Code + instructions
                VStack(alignment: .leading, spacing: 24) {
                    Text("Or enter this code:")
                        .font(.system(size: 26))
                        .foregroundColor(.white.opacity(0.6))

                    Text(formattedCode(code))
                        .font(.system(size: 64, weight: .bold, design: .monospaced))
                        .foregroundColor(pcLight)
                        .tracking(12)
                        .accessibilityLabel("Pairing code: \(code.map(String.init).joined(separator: ", "))")

                    Text("Expires in \(expiryFormatted())")
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.4))

                    stepsList
                }
            }

        case .paired(let deviceId):
            VStack(spacing: 20) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(pcMid)
                Text("Paired!")
                    .font(.system(size: 52, weight: .semibold))
                    .foregroundColor(pcLight)
                Text("Device ID: \(String(deviceId.prefix(8)))...")
                    .font(.system(size: 24))
                    .foregroundColor(.white.opacity(0.5))
            }

        case .expired:
            VStack(spacing: 16) {
                Image(systemName: "clock.badge.xmark")
                    .font(.system(size: 60))
                    .foregroundColor(.orange)
                Text("Code expired")
                    .font(.system(size: 40))
                    .foregroundColor(.white)
                Button("Generate new code") { Task { await fetchPairingCode() } }
                    .buttonStyle(.bordered)
                    .tint(pcMid)
            }

        case .error(let msg):
            VStack(spacing: 16) {
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 60))
                    .foregroundColor(.red)
                Text(msg)
                    .font(.system(size: 28))
                    .foregroundColor(.white.opacity(0.7))
                Button("Retry") { Task { await fetchPairingCode() } }
                    .buttonStyle(.bordered)
                    .tint(pcMid)
            }
        }
    }

    // MARK: - Steps list

    private var stepsList: some View {
        VStack(alignment: .leading, spacing: 12) {
            ForEach(Array(steps.enumerated()), id: \.offset) { idx, step in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(idx + 1)")
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(pcMid)
                        .frame(width: 28, alignment: .trailing)
                    Text(step)
                        .font(.system(size: 20))
                        .foregroundColor(.white.opacity(0.65))
                }
            }
        }
    }

    private let steps = [
        "Open PrayCalc on your iPhone or Android",
        "Go to Settings → Connect TV",
        "Scan the QR code or enter the 6-digit code",
    ]

    // MARK: - Footer

    private var footer: some View {
        Text("Prayer notifications and live countdown will sync after pairing.")
            .font(.system(size: 20, weight: .light))
            .foregroundColor(.white.opacity(0.35))
            .multilineTextAlignment(.center)
    }

    // MARK: - Networking

    private func fetchPairingCode() async {
        state = .loading
        cancelTimers()

        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        guard let url = URL(string: "https://praycalc.com/api/devices/pairing-code") else {
            state = .error("Invalid endpoint URL"); return
        }

        var req = URLRequest(url: url, timeoutInterval: 10)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONEncoder().encode(["device_id": deviceId, "platform": "tvos"])

        do {
            let (data, resp) = try await URLSession.shared.data(for: req)
            guard (resp as? HTTPURLResponse)?.statusCode == 200 else {
                state = .error("Server error. Try again."); return
            }
            let json = try JSONDecoder().decode([String: String].self, from: data)
            guard let code = json["code"] else { state = .error("No code returned"); return }

            await MainActor.run {
                state = .ready(code: code)
                expiryCountdown = 900
                startExpiryTimer()
                startPollTimer(code: code)
            }
        } catch {
            await MainActor.run { state = .error(error.localizedDescription) }
        }
    }

    private func startExpiryTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            guard expiryCountdown > 0 else {
                cancelTimers()
                state = .expired
                return
            }
            expiryCountdown -= 1
        }
    }

    private func startPollTimer(code: String) {
        pollTimer = Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            Task { await checkPairingStatus(code: code) }
        }
    }

    private func checkPairingStatus(code: String) async {
        guard let url = URL(string: "https://praycalc.com/api/devices/pairing-status?code=\(code)") else { return }
        guard let (data, _) = try? await URLSession.shared.data(from: url) else { return }
        let json = (try? JSONDecoder().decode([String: String].self, from: data)) ?? [:]
        if json["status"] == "paired", let id = json["device_id"] {
            await MainActor.run {
                cancelTimers()
                state = .paired(deviceId: id)
            }
        }
    }

    private func cancelTimers() {
        timer?.invalidate()
        pollTimer?.invalidate()
        timer = nil
        pollTimer = nil
    }

    // MARK: - Helpers

    private func formattedCode(_ code: String) -> String {
        // Insert a thin space in the middle: "ABC DEF"
        guard code.count == 6 else { return code }
        let mid = code.index(code.startIndex, offsetBy: 3)
        return String(code[..<mid]) + "  " + String(code[mid...])
    }

    private func expiryFormatted() -> String {
        let m = expiryCountdown / 60
        let s = expiryCountdown % 60
        return String(format: "%d:%02d", m, s)
    }

    private func makeQRCode(_ code: String) -> CGImage? {
        let deviceId = UIDevice.current.identifierForVendor?.uuidString ?? "unknown"
        let payload  = "praycalc://pair?code=\(code)&device=\(deviceId)"
        let context  = CIContext()
        let filter   = CIFilter.qrCodeGenerator()
        filter.correctionLevel = "M"
        filter.message = Data(payload.utf8)
        guard let output = filter.outputImage else { return nil }
        let scaled = output.transformed(by: CGAffineTransform(scaleX: 6, y: 6))
        return context.createCGImage(scaled, from: scaled.extent)
    }
}

// MARK: - Preview

#Preview {
    LinkView()
        .environmentObject(PrayerStore())
}
