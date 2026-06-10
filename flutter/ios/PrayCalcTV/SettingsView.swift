// PrayCalcTV — Settings tab
// City search, calculation method, time format, theme, about.
// All preferences stored in UserDefaults and observed by PrayerStore.

import SwiftUI

// MARK: - Calculation methods

struct CalcMethod: Identifiable {
    let id: Int
    let name: String
    let shortName: String
}

let calculationMethods: [CalcMethod] = [
    CalcMethod(id: 2, name: "Islamic Society of North America (ISNA)",    shortName: "ISNA"),
    CalcMethod(id: 3, name: "Muslim World League (MWL)",                  shortName: "MWL"),
    CalcMethod(id: 5, name: "Egyptian General Authority of Survey",        shortName: "Egypt"),
    CalcMethod(id: 4, name: "Umm Al-Qura University, Makkah",             shortName: "Umm al-Qura"),
    CalcMethod(id: 1, name: "University of Islamic Sciences, Karachi",    shortName: "Karachi"),
]

// MARK: - SettingsView

struct SettingsView: View {
    @EnvironmentObject private var prayerStore: PrayerStore

    @State private var cityInput: String = ""
    @State private var cityValidating: Bool = false
    @State private var cityError: String?
    @State private var citySuccess: Bool = false

    @State private var selectedTheme: String = "dark"

    private let brandLight = Color(red: 0.79, green: 0.76, blue: 0.48)
    private let brandDark  = Color(red: 0.12, green: 0.37, blue: 0.18)
    private let brandDeep  = Color(red: 0.05, green: 0.19, blue: 0.09)

    // App version from bundle
    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.1.0"
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [brandDeep, Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 48) {
                    Text("Settings")
                        .font(.system(size: 52, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.top, 60)

                    // City section
                    settingSection(title: "Location") {
                        cityRow
                    }

                    // Calculation method
                    settingSection(title: "Calculation Method") {
                        methodPicker
                    }

                    // Time format
                    settingSection(title: "Time Format") {
                        timeFormatToggle
                    }

                    // About
                    settingSection(title: "About") {
                        aboutBlock
                    }
                }
                .padding(.horizontal, 80)
                .padding(.bottom, 80)
            }
        }
        .onAppear {
            cityInput = prayerStore.city
            selectedTheme = UserDefaults.standard.string(forKey: "praycalc_theme") ?? "dark"
        }
    }

    // MARK: - Section container

    private func settingSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 20) {
            Text(title.uppercased())
                .font(.system(size: 22, weight: .semibold, design: .rounded))
                .foregroundColor(brandLight.opacity(0.7))
                .kerning(2)

            content()
                .padding(28)
                .background(Color.white.opacity(0.05), in: RoundedRectangle(cornerRadius: 16))
        }
    }

    // MARK: - City row

    private var cityRow: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Current city: \(prayerStore.city)")
                .font(.system(size: 26))
                .foregroundColor(.white)

            HStack(spacing: 20) {
                TextField("Enter city name…", text: $cityInput)
                    .font(.system(size: 26))
                    .foregroundColor(.white)
                    .padding(16)
                    .background(Color.white.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
                    .frame(maxWidth: 500)
                    .onSubmit { validateAndSaveCity() }

                Button {
                    validateAndSaveCity()
                } label: {
                    HStack(spacing: 8) {
                        if cityValidating {
                            ProgressView()
                                .scaleEffect(0.9)
                                .tint(.black)
                        } else {
                            Image(systemName: "checkmark")
                        }
                        Text(cityValidating ? "Checking…" : "Set City")
                    }
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.black)
                    .padding(.horizontal, 30)
                    .padding(.vertical, 16)
                    .background(brandLight, in: Capsule())
                }
                .buttonStyle(.plain)
                .disabled(cityValidating)
            }

            if let err = cityError {
                Label(err, systemImage: "exclamationmark.triangle")
                    .font(.system(size: 22))
                    .foregroundColor(.red.opacity(0.8))
            }

            if citySuccess {
                Label("City updated!", systemImage: "checkmark.circle.fill")
                    .font(.system(size: 22))
                    .foregroundColor(.green)
            }
        }
    }

    private func validateAndSaveCity() {
        let trimmed = cityInput.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }

        cityValidating = true
        cityError = nil
        citySuccess = false

        guard let url = Config.prayerTimesURL(city: trimmed, method: prayerStore.calculationMethod) else {
            cityValidating = false
            cityError = "Invalid city name."
            return
        }

        Task {
            do {
                let (_, response) = try await URLSession.shared.data(from: url)
                let code = (response as? HTTPURLResponse)?.statusCode ?? 0
                await MainActor.run {
                    cityValidating = false
                    if (200..<300).contains(code) {
                        prayerStore.city = trimmed
                        citySuccess = true
                        Task { try? await Task.sleep(nanoseconds: 3_000_000_000)
                            await MainActor.run { citySuccess = false }
                        }
                    } else {
                        cityError = "City not found. Check spelling and try again."
                    }
                }
            } catch {
                await MainActor.run {
                    cityValidating = false
                    cityError = "Network error. Please try again."
                }
            }
        }
    }

    // MARK: - Method picker

    private var methodPicker: some View {
        VStack(alignment: .leading, spacing: 8) {
            ForEach(calculationMethods) { method in
                Button {
                    prayerStore.calculationMethod = method.id
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: prayerStore.calculationMethod == method.id
                              ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(prayerStore.calculationMethod == method.id ? brandLight : .white.opacity(0.4))
                        .font(.system(size: 24))

                        VStack(alignment: .leading, spacing: 2) {
                            Text(method.shortName)
                                .font(.system(size: 26, weight: prayerStore.calculationMethod == method.id ? .semibold : .regular))
                                .foregroundColor(prayerStore.calculationMethod == method.id ? brandLight : .white)
                            Text(method.name)
                                .font(.system(size: 18))
                                .foregroundColor(.white.opacity(0.45))
                        }
                        Spacer()
                    }
                    .padding(.vertical, 12)
                    .padding(.horizontal, 16)
                    .background(
                        prayerStore.calculationMethod == method.id
                            ? brandDark.opacity(0.4)
                            : Color.clear,
                        in: RoundedRectangle(cornerRadius: 10)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Time format toggle

    private var timeFormatToggle: some View {
        HStack(spacing: 30) {
            formatButton(label: "12h", example: "5:23 PM", is24h: false)
            formatButton(label: "24h", example: "17:23",   is24h: true)
        }
    }

    private func formatButton(label: String, example: String, is24h: Bool) -> some View {
        let selected = prayerStore.use24h == is24h
        return Button {
            prayerStore.use24h = is24h
        } label: {
            VStack(spacing: 6) {
                Text(label)
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundColor(selected ? .black : .white)
                Text(example)
                    .font(.system(size: 20))
                    .foregroundColor(selected ? .black.opacity(0.6) : .white.opacity(0.5))
            }
            .padding(.horizontal, 40)
            .padding(.vertical, 20)
            .background(selected ? brandLight : Color.white.opacity(0.07),
                        in: RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selected ? brandLight : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - About block

    private var aboutBlock: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 16) {
                Image(systemName: "clock.fill")
                    .font(.system(size: 36))
                    .foregroundColor(brandLight)
                VStack(alignment: .leading, spacing: 4) {
                    Text("PrayCalc TV")
                        .font(.system(size: 30, weight: .semibold))
                        .foregroundColor(.white)
                    Text("Version \(appVersion)")
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.5))
                }
            }

            Text("Accurate prayer times for Muslims worldwide.")
                .font(.system(size: 22))
                .foregroundColor(.white.opacity(0.6))

            Text("praycalc.com")
                .font(.system(size: 22))
                .foregroundColor(brandLight)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(PrayerStore())
}
