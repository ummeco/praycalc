import CoreMotion
import SwiftUI
import WatchKit

struct QiblaView: View {
    @EnvironmentObject var prayerService: PrayerService
    @StateObject private var compass = CompassManager()

    private let brandGreen = Color(red: 0x79 / 255.0, green: 0xC2 / 255.0, blue: 0x4C / 255.0)
    private let accentGreen = Color(red: 0xC9 / 255.0, green: 0xF2 / 255.0, blue: 0x7A / 255.0)
    private let deepGreen = Color(red: 0x0D / 255.0, green: 0x2F / 255.0, blue: 0x17 / 255.0)

    private var qiblaBearing: Double {
        prayerService.prayerResponse?.qibla.bearing ?? 0
    }

    private var relativeAngle: Double {
        var angle = qiblaBearing - compass.heading
        while angle < 0 { angle += 360 }
        while angle >= 360 { angle -= 360 }
        return angle
    }

    private var isAligned: Bool {
        let diff = abs(relativeAngle)
        return diff <= 5 || diff >= 355
    }

    var body: some View {
        VStack(spacing: 8) {
            Text("QIBLA")
                .font(.system(.caption, design: .rounded))
                .fontWeight(.bold)
                .foregroundColor(accentGreen)
                .tracking(2)

            ZStack {
                compassRose
                qiblaArrow
            }
            .frame(width: 130, height: 130)

            bearingLabel
        }
        .onAppear { compass.start() }
        .onDisappear { compass.stop() }
        .onChange(of: isAligned) { aligned in
            if aligned {
                WKInterfaceDevice.current().play(.click)
            }
        }
    }

    private var compassRose: some View {
        ZStack {
            Circle()
                .stroke(deepGreen, lineWidth: 2)

            // Cardinal direction markers
            ForEach(0..<4) { i in
                let labels = ["N", "E", "S", "W"]
                let angle = Double(i) * 90.0

                Text(labels[i])
                    .font(.system(.caption2, design: .rounded))
                    .fontWeight(.medium)
                    .foregroundColor(.gray)
                    .rotationEffect(.degrees(-compass.heading))
                    .offset(y: -52)
                    .rotationEffect(.degrees(angle))
            }

            // Tick marks
            ForEach(0..<36) { i in
                let angle = Double(i) * 10.0
                Rectangle()
                    .fill(i % 9 == 0 ? Color.white : Color.gray.opacity(0.4))
                    .frame(width: i % 9 == 0 ? 1.5 : 0.5, height: i % 9 == 0 ? 8 : 4)
                    .offset(y: -60)
                    .rotationEffect(.degrees(angle - compass.heading))
            }
        }
    }

    private var qiblaArrow: some View {
        VStack(spacing: 0) {
            Image(systemName: "location.north.fill")
                .font(.system(size: 28, weight: .bold))
                .foregroundColor(isAligned ? accentGreen : brandGreen)
                .shadow(color: isAligned ? accentGreen.opacity(0.8) : .clear, radius: 8)
        }
        .rotationEffect(.degrees(relativeAngle))
        .animation(.easeInOut(duration: 0.3), value: relativeAngle)
    }

    private var bearingLabel: some View {
        HStack(spacing: 4) {
            Image(systemName: isAligned ? "checkmark.circle.fill" : "safari")
                .font(.caption2)
                .foregroundColor(isAligned ? accentGreen : .gray)

            Text(String(format: "%.0f\u{00B0}", qiblaBearing))
                .font(.system(.caption, design: .monospaced))
                .foregroundColor(isAligned ? accentGreen : .white)
        }
    }
}

// MARK: - Compass Manager

class CompassManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published var heading: Double = 0

    private let locationManager = CLLocationManager()

    override init() {
        super.init()
        locationManager.delegate = self
    }

    func start() {
        if CLLocationManager.headingAvailable() {
            locationManager.startUpdatingHeading()
        }
    }

    func stop() {
        locationManager.stopUpdatingHeading()
    }

    func locationManager(_ manager: CLLocationManager, didUpdateHeading newHeading: CLHeading) {
        if newHeading.headingAccuracy >= 0 {
            DispatchQueue.main.async {
                self.heading = newHeading.trueHeading
            }
        }
    }
}

#Preview {
    QiblaView()
        .environmentObject(PrayerService())
}
