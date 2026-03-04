import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var prayerService: PrayerService
    @AppStorage("calculationMethod") private var calculationMethod: String = CalculationMethod.isna.rawValue
    @AppStorage("madhab") private var madhab: String = Madhab.shafii.rawValue

    private let brandGreen = Color(red: 0x79 / 255.0, green: 0xC2 / 255.0, blue: 0x4C / 255.0)
    private let accentGreen = Color(red: 0xC9 / 255.0, green: 0xF2 / 255.0, blue: 0x7A / 255.0)

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text("Settings")
                    .font(.system(.headline, design: .rounded))
                    .foregroundColor(accentGreen)

                methodPicker
                madhabPicker
                refreshButton
            }
            .padding(.horizontal, 4)
        }
    }

    private var methodPicker: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Method")
                .font(.caption2)
                .foregroundColor(.gray)

            Picker("Method", selection: $calculationMethod) {
                ForEach(CalculationMethod.allCases) { method in
                    Text(method.displayName).tag(method.rawValue)
                }
            }
            .pickerStyle(.navigationLink)
            .onChange(of: calculationMethod) { _ in
                prayerService.refresh()
            }
        }
    }

    private var madhabPicker: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Madhab")
                .font(.caption2)
                .foregroundColor(.gray)

            Picker("Madhab", selection: $madhab) {
                ForEach(Madhab.allCases) { m in
                    Text(m.displayName).tag(m.rawValue)
                }
            }
            .pickerStyle(.navigationLink)
            .onChange(of: madhab) { _ in
                prayerService.refresh()
            }
        }
    }

    private var refreshButton: some View {
        Button {
            prayerService.refresh()
        } label: {
            HStack {
                Image(systemName: "arrow.clockwise")
                Text("Refresh")
            }
            .font(.caption)
        }
        .tint(brandGreen)
        .padding(.top, 8)
    }
}

#Preview {
    SettingsView()
        .environmentObject(PrayerService())
}
