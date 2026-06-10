// PrayCalcTV — Quran audio player
// Full-screen Arabic ayah display + AVFoundation audio from everyayah.com.
// Reciter picker on the left panel (D-pad navigable).
// Plays through sampleAyahs sequentially.

import SwiftUI
import AVFoundation

// MARK: - Audio engine

@MainActor
class QuranAudioPlayer: ObservableObject {
    @Published var isPlaying: Bool = false
    @Published var isLoading: Bool = false
    @Published var currentAyahIndex: Int = 0
    @Published var selectedReciter: Reciter = builtInReciters[0]
    @Published var errorMessage: String?

    private var player: AVPlayer?
    private var playerObserver: Any?

    var currentAyah: Ayah { sampleAyahs[currentAyahIndex] }

    // MARK: - Playback control

    func play() {
        guard let url = selectedReciter.audioURL(
            surah: currentAyah.surahNumber,
            ayah: currentAyah.ayahNumber
        ) else { return }

        isLoading = true
        isPlaying = false
        errorMessage = nil

        player?.pause()
        removeObserver()

        let item = AVPlayerItem(url: url)
        player = AVPlayer(playerItem: item)

        // Observe playback end to auto-advance
        playerObserver = NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: item,
            queue: .main
        ) { [weak self] _ in
            self?.advance()
        }

        // Observe status to detect load error
        Task {
            do {
                try await item.asset.load(.isPlayable)
                self.isLoading = false
                self.player?.play()
                self.isPlaying = true
            } catch {
                self.isLoading = false
                self.errorMessage = "Could not load audio."
            }
        }
    }

    func pause() {
        player?.pause()
        isPlaying = false
    }

    func togglePlayPause() {
        if isPlaying { pause() } else { play() }
    }

    func advance() {
        let next = (currentAyahIndex + 1) % sampleAyahs.count
        currentAyahIndex = next
        play()
    }

    func previous() {
        let prev = (currentAyahIndex - 1 + sampleAyahs.count) % sampleAyahs.count
        currentAyahIndex = prev
        play()
    }

    func selectReciter(_ reciter: Reciter) {
        selectedReciter = reciter
        if isPlaying { play() }
    }

    private func removeObserver() {
        if let obs = playerObserver {
            NotificationCenter.default.removeObserver(obs)
            playerObserver = nil
        }
    }

    deinit {
        if let obs = playerObserver {
            NotificationCenter.default.removeObserver(obs)
        }
    }
}

// MARK: - QuranPlayerView

struct QuranPlayerView: View {
    @StateObject private var audioPlayer = QuranAudioPlayer()
    @State private var showReciterPicker = false
    @FocusState private var focusedControl: PlayerControl?

    private let brandLight = Color(red: 0.79, green: 0.76, blue: 0.48)
    private let brandDark  = Color(red: 0.12, green: 0.37, blue: 0.18)
    private let brandDeep  = Color(red: 0.05, green: 0.19, blue: 0.09)

    enum PlayerControl: Hashable { case prev, playPause, next, reciter }

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [brandDeep, brandDark.opacity(0.8), Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            if showReciterPicker {
                reciterPickerPanel
                    .transition(.move(edge: .leading).combined(with: .opacity))
            } else {
                mainPlayerLayout
            }
        }
        .animation(.easeInOut(duration: 0.3), value: showReciterPicker)
    }

    // MARK: - Main player

    private var mainPlayerLayout: some View {
        VStack(spacing: 0) {
            Spacer()

            // Surah label
            Text(audioPlayer.currentAyah.surahName)
                .font(.system(size: 32, weight: .light))
                .foregroundColor(brandLight.opacity(0.7))
                .padding(.bottom, 12)

            // Ayah counter
            Text("Ayah \(audioPlayer.currentAyah.ayahNumber)")
                .font(.system(size: 24))
                .foregroundColor(.white.opacity(0.4))
                .padding(.bottom, 40)

            // Arabic text — large
            Text(audioPlayer.currentAyah.arabic)
                .font(.system(size: 72, weight: .light))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
                .lineSpacing(20)
                .padding(.horizontal, 100)

            // Translation
            Text(audioPlayer.currentAyah.translation)
                .font(.system(size: 28, weight: .regular))
                .foregroundColor(.white.opacity(0.5))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 120)
                .padding(.top, 32)

            Spacer()

            // Playback controls
            HStack(spacing: 60) {
                controlButton(systemImage: "backward.end.fill", control: .prev) {
                    audioPlayer.previous()
                }

                // Play / Pause — larger
                Button {
                    audioPlayer.togglePlayPause()
                } label: {
                    ZStack {
                        Circle()
                            .fill(brandLight)
                            .frame(width: 90, height: 90)
                        if audioPlayer.isLoading {
                            ProgressView()
                                .scaleEffect(1.4)
                                .tint(.black)
                        } else {
                            Image(systemName: audioPlayer.isPlaying ? "pause.fill" : "play.fill")
                                .font(.system(size: 36))
                                .foregroundColor(.black)
                        }
                    }
                }
                .buttonStyle(.plain)
                .focused($focusedControl, equals: .playPause)
                .scaleEffect(focusedControl == .playPause ? 1.12 : 1.0)
                .animation(.easeInOut(duration: 0.15), value: focusedControl)

                controlButton(systemImage: "forward.end.fill", control: .next) {
                    audioPlayer.advance()
                }
            }
            .padding(.bottom, 30)

            // Reciter name button
            Button {
                showReciterPicker = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "person.wave.2")
                    Text(audioPlayer.selectedReciter.name)
                }
                .font(.system(size: 26))
                .foregroundColor(.white.opacity(0.7))
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(Color.white.opacity(0.08), in: Capsule())
            }
            .buttonStyle(.plain)
            .focused($focusedControl, equals: .reciter)
            .padding(.bottom, 50)

            if let err = audioPlayer.errorMessage {
                Text(err)
                    .font(.system(size: 22))
                    .foregroundColor(.red.opacity(0.8))
                    .padding(.bottom, 20)
            }
        }
    }

    // MARK: - Control button helper

    private func controlButton(systemImage: String, control: PlayerControl, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 38))
                .foregroundColor(.white.opacity(0.85))
                .frame(width: 70, height: 70)
        }
        .buttonStyle(.plain)
        .focused($focusedControl, equals: control)
        .scaleEffect(focusedControl == control ? 1.15 : 1.0)
        .animation(.easeInOut(duration: 0.15), value: focusedControl)
    }

    // MARK: - Reciter picker

    private var reciterPickerPanel: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Select Reciter")
                .font(.system(size: 40, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 60)
                .padding(.top, 60)
                .padding(.bottom, 30)

            ScrollView {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(builtInReciters) { reciter in
                        Button {
                            audioPlayer.selectReciter(reciter)
                            showReciterPicker = false
                        } label: {
                            HStack(spacing: 20) {
                                if reciter.id == audioPlayer.selectedReciter.id {
                                    Image(systemName: "checkmark.circle.fill")
                                        .foregroundColor(brandLight)
                                } else {
                                    Image(systemName: "circle")
                                        .foregroundColor(.white.opacity(0.3))
                                }
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(reciter.name)
                                        .font(.system(size: 30, weight: .regular))
                                        .foregroundColor(.white)
                                    Text(reciter.arabicName)
                                        .font(.system(size: 24, weight: .light))
                                        .foregroundColor(.white.opacity(0.6))
                                }
                            }
                            .padding(.horizontal, 40)
                            .padding(.vertical, 18)
                            .frame(maxWidth: 700, alignment: .leading)
                            .background(
                                reciter.id == audioPlayer.selectedReciter.id
                                    ? brandDark.opacity(0.5)
                                    : Color.clear
                            )
                            .cornerRadius(12)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 20)
            }

            Spacer()

            // Back hint
            Text("Press Back to return")
                .font(.system(size: 22))
                .foregroundColor(.white.opacity(0.35))
                .padding(.horizontal, 60)
                .padding(.bottom, 50)
        }
        .frame(maxWidth: 800, alignment: .leading)
        .background(Color.black.opacity(0.7).ignoresSafeArea())
        .onExitCommand { showReciterPicker = false }
    }
}

#Preview {
    QuranPlayerView()
}
