import SwiftUI

struct MenuPopover: View {
    @ObservedObject var prayerService: PrayerService
    @Binding var showSettings: Bool

    @State private var selectedTab: MenuTab = .prayers

    private let brandPrimary = Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0)
    private let brandAccent = Color(red: 0xC9/255.0, green: 0xF2/255.0, blue: 0x7A/255.0)
    private let brandDeep = Color(red: 0x0D/255.0, green: 0x2F/255.0, blue: 0x17/255.0)

    enum MenuTab { case prayers, tvs, qibla }

    var body: some View {
        VStack(spacing: 0) {
            // Tab bar
            HStack(spacing: 0) {
                tabButton(label: "Prayers", icon: "clock.fill", tab: .prayers)
                tabButton(label: "TVs", icon: "tv.fill", tab: .tvs)
                tabButton(label: "Qibla", icon: "location.north.fill", tab: .qibla)
            }
            .padding(.horizontal, 8)
            .padding(.top, 8)
            .padding(.bottom, 4)

            Divider()

            // Tab content
            switch selectedTab {
            case .prayers:
                prayersContent
            case .tvs:
                TVsView()
                    .frame(minHeight: 120)
            case .qibla:
                QiblaView(prayerService: prayerService)
            }

            Divider()

            // Footer actions (always visible)
            footerSection
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
        }
        .background(Color(nsColor: .windowBackgroundColor))
    }

    @ViewBuilder
    private var prayersContent: some View {
        // Header with date
        headerSection
            .padding(.horizontal, 16)
            .padding(.top, 12)
            .padding(.bottom, 8)

        Divider()

        // Prayer list
        ScrollView {
            VStack(spacing: 2) {
                ForEach(prayerService.prayers) { prayer in
                    PrayerRow(
                        prayer: prayer,
                        isNext: prayer.id == prayerService.nextPrayer?.id,
                        brandPrimary: brandPrimary,
                        brandDeep: brandDeep
                    )
                }
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 6)
        }

        Divider()

        // Qibla + countdown
        if let next = prayerService.nextPrayer {
            countdownSection(next: next)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
            Divider()
        }
    }

    private func tabButton(label: String, icon: String, tab: MenuTab) -> some View {
        let isSelected = selectedTab == tab
        return Button(action: { selectedTab = tab }) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 11))
                Text(label)
                    .font(.system(size: 11, weight: isSelected ? .semibold : .regular))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 5)
            .background(
                RoundedRectangle(cornerRadius: 6)
                    .fill(isSelected ? brandPrimary.opacity(0.15) : Color.clear)
            )
            .foregroundColor(isSelected ? brandAccent : .secondary)
        }
        .buttonStyle(.plain)
    }

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(gregorianDate)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.primary)
            Text(hijriDate)
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private func countdownSection(next: PrayerTime) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("Next: \(next.name)")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(brandPrimary)
                Text(prayerService.countdownText)
                    .font(.system(size: 18, weight: .bold, design: .monospaced))
                    .foregroundColor(.primary)
            }

            Spacer()

            if let qibla = prayerService.qiblaBearing {
                VStack(alignment: .trailing, spacing: 2) {
                    Image(systemName: "location.north.fill")
                        .rotationEffect(.degrees(qibla))
                        .foregroundColor(brandPrimary)
                        .font(.system(size: 16))
                    Text("Qibla \(Int(qibla))\u{00B0}")
                        .font(.system(size: 10))
                        .foregroundColor(.secondary)
                }
            }
        }
    }

    private var footerSection: some View {
        HStack {
            Button(action: {
                if let url = URL(string: "https://praycalc.com") {
                    NSWorkspace.shared.open(url)
                }
            }) {
                HStack(spacing: 4) {
                    Image(systemName: "globe")
                    Text("Open PrayCalc")
                }
                .font(.system(size: 11))
            }
            .buttonStyle(.plain)
            .foregroundColor(.secondary)

            Spacer()

            Button(action: {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }) {
                Image(systemName: "gear")
                    .font(.system(size: 13))
            }
            .buttonStyle(.plain)
            .foregroundColor(.secondary)

            Button(action: {
                NSApplication.shared.terminate(nil)
            }) {
                Image(systemName: "power")
                    .font(.system(size: 13))
            }
            .buttonStyle(.plain)
            .foregroundColor(.secondary)
        }
    }

    private var gregorianDate: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE, MMMM d, yyyy"
        return formatter.string(from: Date())
    }

    private var hijriDate: String {
        let calendar = Calendar(identifier: .islamicUmmAlQura)
        let formatter = DateFormatter()
        formatter.calendar = calendar
        formatter.dateFormat = "d MMMM yyyy"
        return formatter.string(from: Date()) + " AH"
    }
}

struct PrayerRow: View {
    let prayer: PrayerTime
    let isNext: Bool
    let brandPrimary: Color
    let brandDeep: Color

    private let prayerIcons: [String: String] = [
        "Fajr": "sunrise.fill",
        "Sunrise": "sun.horizon.fill",
        "Dhuhr": "sun.max.fill",
        "Asr": "sun.haze.fill",
        "Maghrib": "sunset.fill",
        "Isha": "moon.stars.fill"
    ]

    var body: some View {
        HStack {
            Image(systemName: prayerIcons[prayer.name] ?? "clock.fill")
                .frame(width: 20)
                .foregroundColor(isNext ? brandDeep : .secondary)
                .font(.system(size: 12))

            Text(prayer.name)
                .font(.system(size: 13, weight: isNext ? .semibold : .regular))
                .foregroundColor(isNext ? brandDeep : .primary)

            Spacer()

            Text(prayer.displayTime)
                .font(.system(size: 13, weight: isNext ? .semibold : .regular, design: .monospaced))
                .foregroundColor(isNext ? brandDeep : .secondary)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(isNext ? brandPrimary.opacity(0.9) : Color.clear)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(prayer.name) at \(prayer.displayTime)\(isNext ? ", next prayer" : "")")
    }
}

// ---------------------------------------------------------------------------
// Qibla View
// ---------------------------------------------------------------------------

struct QiblaView: View {
    @ObservedObject var prayerService: PrayerService

    private let brandPrimary = Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0)

    var body: some View {
        VStack(spacing: 12) {
            // Rotating compass needle
            ZStack {
                Circle()
                    .stroke(brandPrimary.opacity(0.3), lineWidth: 1)
                    .frame(width: 80, height: 80)

                // Arrow pointing toward Qibla
                Image(systemName: "arrow.up")
                    .font(.system(size: 32))
                    .foregroundColor(brandPrimary)
                    .rotationEffect(.degrees(prayerService.qiblaBearing ?? 0.0))
            }

            // Bearing info
            Text(String(format: "%.1f° to Mecca", prayerService.qiblaBearing ?? 0.0))
                .font(.system(size: 12))
                .foregroundColor(.secondary)

            Text("Distance: \(Int(prayerService.qiblaDistance)) km")
                .font(.system(size: 11))
                .foregroundColor(.secondary)
        }
        .padding(16)
        .frame(maxWidth: .infinity)
    }
}
