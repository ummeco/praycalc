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

// Mock data — replace with smart service API call when backend is live.
private let mockTVs: [PairedTV] = [
    PairedTV(
        id: "tv-1",
        name: "Living Room TV",
        model: "NVIDIA Shield TV Pro",
        isOnline: true,
        lastSeen: Date()
    ),
    PairedTV(
        id: "tv-2",
        name: "Bedroom TV",
        model: "Amazon Fire Stick 4K",
        isOnline: false,
        lastSeen: Calendar.current.date(byAdding: .hour, value: -2, to: Date())
    ),
]

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
                }
                .padding(16)
            }
        }
        .frame(width: 260, height: 280)
        .background(Color(nsColor: .windowBackgroundColor))
    }

    private func pushToTV() {
        isSaving = true
        savedOK = false
        // Simulate async push — wire to smart API when live.
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            isSaving = false
            savedOK = true
        }
    }
}

// ---------------------------------------------------------------------------
// TVs List View
// ---------------------------------------------------------------------------

/// Shows all paired TVs with online status. Tapping a row opens settings.
struct TVsView: View {
    @State private var tvs: [PairedTV] = mockTVs
    @State private var selectedTV: PairedTV?
    @State private var showSettings = false

    private let brandPrimary = Color(red: 0x79/255.0, green: 0xC2/255.0, blue: 0x4C/255.0)
    private let brandAccent  = Color(red: 0xC9/255.0, green: 0xF2/255.0, blue: 0x7A/255.0)

    var body: some View {
        VStack(spacing: 0) {
            if tvs.isEmpty {
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
