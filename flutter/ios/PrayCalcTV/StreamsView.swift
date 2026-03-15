// PrayCalcTV — Live Streams tab
// Split layout: stream list on left, player on right.
// YouTube embeds via WKWebView; audio-only streams via AVPlayer.

import SwiftUI
import AVKit
import WebKit

// MARK: - Built-in stream library

let builtInStreams: [Stream] = [
    Stream(
        name: "Mecca Live",
        arabicName: "مكة المكرمة",
        url: URL(string: "https://www.youtube.com/embed/l8SQFQ0RRWY?autoplay=1")!,
        emoji: "🕋",
        isDirectStream: false
    ),
    Stream(
        name: "Medina Live",
        arabicName: "المدينة المنورة",
        url: URL(string: "https://www.youtube.com/embed/F040z4Ejkw8?autoplay=1")!,
        emoji: "🟢",
        isDirectStream: false
    ),
    Stream(
        name: "Al-Aqsa Live",
        arabicName: "المسجد الأقصى",
        url: URL(string: "https://www.youtube.com/embed/xSq0rJfBBGQ?autoplay=1")!,
        emoji: "🕌",
        isDirectStream: false
    ),
    Stream(
        name: "Quran Radio",
        arabicName: "إذاعة القرآن",
        url: URL(string: "https://stream.radioislam.org.za/quran")!,
        emoji: "📻",
        isDirectStream: true
    ),
    Stream(
        name: "Islamic Lectures",
        arabicName: "محاضرات إسلامية",
        url: URL(string: "https://stream.radioislam.org.za/")!,
        emoji: "🎙️",
        isDirectStream: true
    ),
]

// MARK: - Audio stream state

@MainActor
class AudioStreamPlayer: ObservableObject {
    @Published var isPlaying: Bool = false
    @Published var isLoading: Bool = false
    @Published var status: String = "Ready"

    private var player: AVPlayer?

    func play(url: URL) {
        isLoading = true
        status = "Connecting…"
        player?.pause()
        player = AVPlayer(url: url)
        player?.play()
        isPlaying = true
        isLoading = false
        status = "Playing"
    }

    func stop() {
        player?.pause()
        player = nil
        isPlaying = false
        status = "Stopped"
    }
}

// MARK: - StreamsView

struct StreamsView: View {
    @State private var selectedStream: Stream = builtInStreams[0]
    @StateObject private var audioPlayer = AudioStreamPlayer()

    private let brandLight = Color(red: 0.79, green: 0.76, blue: 0.48)
    private let brandDark  = Color(red: 0.12, green: 0.37, blue: 0.18)
    private let brandDeep  = Color(red: 0.05, green: 0.19, blue: 0.09)

    var body: some View {
        HStack(spacing: 0) {
            // Left: stream list
            streamList
                .frame(width: 380)

            Divider()
                .background(Color.white.opacity(0.1))

            // Right: player area
            playerArea
                .frame(maxWidth: .infinity)
        }
        .background(
            LinearGradient(
                colors: [brandDeep, Color.black],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
        )
        .onChange(of: selectedStream.id) { _ in
            if selectedStream.isDirectStream {
                audioPlayer.play(url: selectedStream.url)
            } else {
                audioPlayer.stop()
            }
        }
        .onAppear {
            if selectedStream.isDirectStream {
                audioPlayer.play(url: selectedStream.url)
            }
        }
    }

    // MARK: - Stream list

    private var streamList: some View {
        VStack(alignment: .leading, spacing: 0) {
            Text("Live Streams")
                .font(.system(size: 34, weight: .semibold))
                .foregroundColor(.white)
                .padding(.horizontal, 30)
                .padding(.top, 50)
                .padding(.bottom, 24)

            ScrollView {
                VStack(spacing: 6) {
                    ForEach(builtInStreams) { stream in
                        StreamRowButton(
                            stream: stream,
                            isSelected: stream.id == selectedStream.id,
                            brandLight: brandLight,
                            brandDark: brandDark
                        ) {
                            selectedStream = stream
                        }
                    }
                }
                .padding(.horizontal, 16)
            }
        }
        .background(Color.white.opacity(0.03))
    }

    // MARK: - Player area

    private var playerArea: some View {
        VStack {
            if selectedStream.isDirectStream {
                audioOnlyPlayer
            } else {
                webPlayer
            }
        }
    }

    private var webPlayer: some View {
        VStack(spacing: 0) {
            TVWebView(url: selectedStream.url)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .cornerRadius(16)
                .padding(40)

            streamInfoBar
        }
    }

    private var audioOnlyPlayer: some View {
        VStack(spacing: 40) {
            Spacer()

            Text(selectedStream.emoji)
                .font(.system(size: 100))

            Text(selectedStream.arabicName)
                .font(.system(size: 52, weight: .light))
                .foregroundColor(.white)

            Text(selectedStream.name)
                .font(.system(size: 32, weight: .regular))
                .foregroundColor(.white.opacity(0.7))

            // Status
            HStack(spacing: 10) {
                Circle()
                    .fill(audioPlayer.isPlaying ? Color.green : Color.gray)
                    .frame(width: 12, height: 12)
                Text(audioPlayer.status)
                    .font(.system(size: 24))
                    .foregroundColor(.white.opacity(0.6))
            }

            Spacer()

            // Stop/play controls
            HStack(spacing: 40) {
                Button {
                    if audioPlayer.isPlaying {
                        audioPlayer.stop()
                    } else {
                        audioPlayer.play(url: selectedStream.url)
                    }
                } label: {
                    HStack(spacing: 12) {
                        Image(systemName: audioPlayer.isPlaying ? "stop.fill" : "play.fill")
                        Text(audioPlayer.isPlaying ? "Stop" : "Play")
                    }
                    .font(.system(size: 28))
                    .foregroundColor(.black)
                    .padding(.horizontal, 40)
                    .padding(.vertical, 18)
                    .background(brandLight, in: Capsule())
                }
                .buttonStyle(.plain)
            }

            Spacer(minLength: 60)
        }
    }

    private var streamInfoBar: some View {
        HStack(spacing: 16) {
            Text(selectedStream.emoji)
                .font(.system(size: 32))
            VStack(alignment: .leading, spacing: 4) {
                Text(selectedStream.name)
                    .font(.system(size: 26, weight: .semibold))
                    .foregroundColor(.white)
                Text(selectedStream.arabicName)
                    .font(.system(size: 20))
                    .foregroundColor(.white.opacity(0.6))
            }
            Spacer()
            Circle()
                .fill(Color.green)
                .frame(width: 10, height: 10)
            Text("Live")
                .font(.system(size: 22))
                .foregroundColor(.green)
        }
        .padding(.horizontal, 50)
        .padding(.vertical, 20)
    }
}

// MARK: - StreamRowButton

struct StreamRowButton: View {
    let stream: Stream
    let isSelected: Bool
    let brandLight: Color
    let brandDark: Color
    let action: () -> Void

    @FocusState private var isFocused: Bool

    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Text(stream.emoji)
                    .font(.system(size: 34))
                    .frame(width: 48)

                VStack(alignment: .leading, spacing: 4) {
                    Text(stream.name)
                        .font(.system(size: 24, weight: isSelected ? .semibold : .regular))
                        .foregroundColor(isSelected ? brandLight : .white)
                    Text(stream.arabicName)
                        .font(.system(size: 18))
                        .foregroundColor(.white.opacity(0.5))
                }

                Spacer()

                if isSelected {
                    Image(systemName: "speaker.wave.2.fill")
                        .foregroundColor(brandLight)
                        .font(.system(size: 20))
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(isSelected ? brandDark.opacity(0.6) : (isFocused ? Color.white.opacity(0.1) : Color.clear))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? brandLight.opacity(0.4) : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
        .focused($isFocused)
        .scaleEffect(isFocused ? 1.02 : 1.0)
        .animation(.easeInOut(duration: 0.15), value: isFocused)
    }
}

// MARK: - TVWebView (WKWebView wrapper for YouTube)

struct TVWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.backgroundColor = .black
        webView.scrollView.isScrollEnabled = false
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        webView.load(URLRequest(url: url))
    }
}

#Preview {
    StreamsView()
}
