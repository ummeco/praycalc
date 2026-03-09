import SwiftUI

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

struct PairedTV: Identifiable {
    let id: String
    let name: String
    let model: String
    let isOnline: Bool
    let lastSeen: Date?
}

// ---------------------------------------------------------------------------
// TV Settings Sheet
// ---------------------------------------------------------------------------

struct TVSettingsSheet: View {
    let tv: PairedTV
    @Binding var isPresented: Bool

    @State private var layoutPreset = "Prayer Only"
    @State private var audioMode = "Silent"
    @State private var isSaving = false
    @State private var savedOK = false
    @State private var isPlayingQuran = false

    private let brandPrimary = Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0)
    private let brandAccent  = Color(red: 0xC9/255.0, green: 0xF2/255.0, blue: 0x7A/255.0)

    private let layoutOptions = ["Prayer Only", "Split Stream", "Split Art", "Info Rich", "Masjid"]
    private let audioOptions  = ["Silent", "Live Stream", "Quran Recitation"]

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(tv.name)
                        .font(.system(size: 14, weight: .semibold))
                    Text(tv.model)
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }
                Spacer()
                Button("Done") { isPresented = false }
                    .buttonStyle(.plain)
                    .foregroundColor(brandPrimary)
            }
            .padding(16)

            Divider()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    // Layout preset picker
                    VStack(alignment: .leading, spacing: 6) {
                        Text("LAYOUT PRESET")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(brandAccent)

                        Picker("Layout", selection: $layoutPreset) {
                            ForEach(layoutOptions, id: \.self) { option in
                                Text(option).tag(option)
                            }
                        }
                        .pickerStyle(.menu)
                        .labelsHidden()
                    }

                    // Audio mode picker
                    VStack(alignment: .leading, spacing: 6) {
                        Text("AUDIO MODE")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(brandAccent)

                        Picker("Audio Mode", selection: $audioMode) {
                            ForEach(audioOptions, id: \.self) { option in
                                Text(option).tag(option)
                            }
                        }
                        .pickerStyle(.menu)
                        .labelsHidden()
                    }

                    // Push button
                    if savedOK {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(brandPrimary)
                            Text("Pushed to TV")
                                .font(.system(size: 12))
                                .foregroundColor(brandPrimary)
                        }
                    }

                    Button(action: pushToTV) {
                        HStack {
                            if isSaving {
                                ProgressView()
                                    .scaleEffect(0.7)
                                    .frame(width: 14, height: 14)
                            } else {
                                Image(systemName: "paperplane.fill")
                            }
                            Text(isSaving ? "Pushing..." : "Push to TV")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 7)
                        .background(brandPrimary.opacity(0.15))
                        .foregroundColor(brandAccent)
                        .cornerRadius(6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(brandPrimary.opacity(0.4), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .disabled(isSaving)

                    // Play Quran button
                    Button(action: playQuranOnTV) {
                        HStack {
                            if isPlayingQuran {
                                ProgressView()
                                    .scaleEffect(0.7)
                                    .frame(width: 14, height: 14)
                            } else {
                                Image(systemName: "play.fill")
                            }
                            Text(isPlayingQuran ? "Starting..." : "Play Quran on TV")
                                .font(.system(size: 12, weight: .medium))
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 7)
                        .background(brandPrimary.opacity(0.1))
                        .foregroundColor(brandAccent)
                        .cornerRadius(6)
                        .overlay(
                            RoundedRectangle(cornerRadius: 6)
                                .stroke(brandPrimary.opacity(0.3), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                    .disabled(isPlayingQuran)
                }
                .padding(16)
            }
        }
        .frame(width: 260, height: 320)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private func pushToTV() {
        isSaving = true
        savedOK = false
        Task {
            guard let token = UserDefaults.standard.string(forKey: "praycalc_access_token"),
                  let url = URL(string: "https://smart.praycalc.com/api/v1/tv/\(tv.id)/settings") else {
                await MainActor.run { isSaving = false }
                return
            }
            var request = URLRequest(url: url)
            request.httpMethod = "PATCH"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let layoutId = layoutOptions.firstIndex(of: layoutPreset).map { ["prayer-only", "split-stream", "split-art", "info-rich", "masjid"][$0] } ?? "prayer-only"
            let audioId = audioOptions.firstIndex(of: audioMode).map { ["silent", "live-stream", "quran"][$0] } ?? "silent"
            let body: [String: Any] = ["layout_preset": layoutId, "audio_mode": audioId]
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            _ = try? await URLSession.shared.data(for: request)
            await MainActor.run {
                isSaving = false
                savedOK = true
            }
        }
    }

    private func playQuranOnTV() {
        isPlayingQuran = true
        Task {
            guard let token = UserDefaults.standard.string(forKey: "praycalc_access_token"),
                  let url = URL(string: "https://smart.praycalc.com/api/v1/tv/\(tv.id)/quran") else {
                await MainActor.run { isPlayingQuran = false }
                return
            }
            var request = URLRequest(url: url)
            request.httpMethod = "POST"
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let body: [String: Any] = ["action": "play", "surahNumber": 1, "reciterId": "sudais"]
            request.httpBody = try? JSONSerialization.data(withJSONObject: body)
            _ = try? await URLSession.shared.data(for: request)
            await MainActor.run { isPlayingQuran = false }
        }
    }
}

// ---------------------------------------------------------------------------
// TVs List View
// ---------------------------------------------------------------------------

/// Shows all paired TVs with online status. Tapping a row opens settings.
struct TVsView: View {
    @State private var tvs: [PairedTV] = []
    @State private var selectedTV: PairedTV?
    @State private var showSettings = false
    @State private var isLoading = false
    @State private var errorMessage: String? = nil
    @State private var refreshTimer: Timer? = nil

    private let brandPrimary = Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0)
    private let brandAccent  = Color(red: 0xC9/255.0, green: 0xF2/255.0, blue: 0x7A/255.0)

    var body: some View {
        VStack(spacing: 0) {
            if isLoading {
                HStack {
                    ProgressView()
                        .scaleEffect(0.8)
                    Text("Loading TVs...")
                        .font(.system(size: 12))
                        .foregroundColor(.secondary)
                }
                .frame(maxWidth: .infinity, minHeight: 60)
                .padding(16)
            } else if tvs.isEmpty {
                emptyState
            } else {
                ScrollView {
                    VStack(spacing: 2) {
                        ForEach(tvs) { tv in
                            TVRow(tv: tv, brandPrimary: brandPrimary) {
                                selectedTV = tv
                                showSettings = true
                            }
                        }
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 6)
                }
            }

            if let error = errorMessage {
                Text(error)
                    .font(.system(size: 11))
                    .foregroundColor(.red)
                    .padding(.horizontal, 16)
                    .padding(.bottom, 6)
            }
        }
        .onAppear {
            Task { await loadTVs() }
            refreshTimer = Timer.scheduledTimer(withTimeInterval: 300, repeats: true) { _ in
                Task { await loadTVs() }
            }
        }
        .sheet(isPresented: $showSettings) {
            if let tv = selectedTV {
                TVSettingsSheet(tv: tv, isPresented: $showSettings)
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Image(systemName: "tv.slash")
                .font(.system(size: 28))
                .foregroundColor(.secondary)
            Text("No TVs paired")
                .font(.system(size: 12))
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding(24)
    }

    private func loadTVs() async {
        isLoading = true
        defer { isLoading = false }

        // Get JWT from UserDefaults (stored by the auth flow)
        guard let token = UserDefaults.standard.string(forKey: "praycalc_access_token") else {
            // No token — show empty state
            tvs = []
            return
        }

        guard let url = URL(string: "https://smart.praycalc.com/api/v1/tv/") else { return }
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            if let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let devices = json["devices"] as? [[String: Any]] {
                tvs = devices.compactMap { d in
                    guard let id = d["id"] as? String,
                          let name = d["device_name"] as? String else { return nil }
                    let model = d["model"] as? String ?? "Android TV"
                    let isOnline = d["is_online"] as? Bool ?? false
                    return PairedTV(id: id, name: name, model: model, isOnline: isOnline, lastSeen: nil)
                }
            }
        } catch {
            errorMessage = "Could not load TVs"
        }
    }
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

struct TVRow: View {
    let tv: PairedTV
    let brandPrimary: Color
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 10) {
                // Status dot
                Circle()
                    .fill(tv.isOnline ? Color.green : Color.secondary.opacity(0.4))
                    .frame(width: 8, height: 8)

                // Name + model
                VStack(alignment: .leading, spacing: 1) {
                    Text(tv.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.primary)
                    Text(tv.model)
                        .font(.system(size: 11))
                        .foregroundColor(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(Color.clear)
        )
        .accessibilityLabel("\(tv.name), \(tv.isOnline ? "online" : "offline")")
    }
}
