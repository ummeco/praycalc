import SwiftUI

struct PrayerListView: View {
    @EnvironmentObject var prayerService: PrayerService

    private let brandGreen = Color(red: 0x79 / 255.0, green: 0xC2 / 255.0, blue: 0x4C / 255.0)
    private let accentGreen = Color(red: 0xC9 / 255.0, green: 0xF2 / 255.0, blue: 0x7A / 255.0)
    private let deepGreen = Color(red: 0x0D / 255.0, green: 0x2F / 255.0, blue: 0x17 / 255.0)

    var body: some View {
        Group {
            if prayerService.isLoading && prayerService.prayerTimes.isEmpty {
                loadingView
            } else if let error = prayerService.errorMessage, prayerService.prayerTimes.isEmpty {
                errorView(error)
            } else {
                prayerList
            }
        }
    }

    private var prayerList: some View {
        ScrollView {
            VStack(spacing: 4) {
                Text("Prayer Times")
                    .font(.system(.headline, design: .rounded))
                    .foregroundColor(accentGreen)
                    .padding(.bottom, 4)

                ForEach(prayerService.prayerTimes) { prayer in
                    prayerRow(prayer)
                }
            }
            .padding(.horizontal, 4)
        }
        .accessibilityLabel("Prayer times list")
    }

    private func prayerRow(_ prayer: PrayerTime) -> some View {
        HStack {
            Text(prayer.name)
                .font(.system(.body, design: .rounded))
                .fontWeight(prayer.isNext ? .semibold : .regular)

            Spacer()

            Text(prayer.time)
                .font(.system(.body, design: .monospaced))
                .fontWeight(prayer.isNext ? .semibold : .regular)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .foregroundColor(prayer.isNext ? .white : (prayer.isPast ? .gray : .white))
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(prayer.isNext ? brandGreen.opacity(0.85) : Color.clear)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel(
            prayer.isNext
                ? "\(prayer.name) at \(prayer.time), next prayer"
                : "\(prayer.name) at \(prayer.time)"
        )
    }

    private var loadingView: some View {
        VStack(spacing: 8) {
            ProgressView()
                .tint(brandGreen)
            Text("Loading...")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 8) {
            Image(systemName: "exclamationmark.triangle")
                .font(.title3)
                .foregroundColor(.yellow)
            Text(message)
                .font(.caption2)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)

            Button("Retry") {
                prayerService.refresh()
            }
            .font(.caption)
            .tint(brandGreen)
        }
        .padding()
    }
}

#Preview {
    PrayerListView()
        .environmentObject(PrayerService())
}
