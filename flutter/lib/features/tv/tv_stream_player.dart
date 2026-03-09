import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/theme/app_theme.dart';
import 'tv_stream_library.dart';

/// Plays a [TvStream].
///
/// Audio streams: played via just_audio with a full-screen art card.
/// Video streams: YouTube links — rendered inline using webview_flutter with
/// the YouTube embed URL (autoplay, no controls). A small "Open in app" button
/// is available as fallback for devices where WebView is not supported.
///
/// When a stream is detected as offline (via [TvStreamHealthChecker]), a red
/// dot indicator is shown and [onStreamOffline] is called so the parent can
/// fall back to the ambient art slideshow.
class TvStreamPlayer extends StatefulWidget {
  const TvStreamPlayer({
    super.key,
    required this.stream,
    this.muted = false,
    this.onStreamOffline,
  });

  final TvStream stream;
  final bool muted;

  /// Called when the selected stream is offline according to the health checker.
  final VoidCallback? onStreamOffline;

  @override
  State<TvStreamPlayer> createState() => _TvStreamPlayerState();
}

class _TvStreamPlayerState extends State<TvStreamPlayer> {
  AudioPlayer? _audioPlayer;
  WebViewController? _webController;
  bool _isLoading = false;
  bool _hasError = false;
  bool _isPlaying = false;
  bool _streamOffline = false;

  /// Extracts the YouTube video ID from a watch URL.
  /// e.g. https://www.youtube.com/watch?v=ABC123 → ABC123
  static String? _youtubeId(String url) {
    final uri = Uri.tryParse(url);
    return uri?.queryParameters['v'];
  }

  /// Returns the YouTube embed URL for inline WebView playback.
  static String? _embedUrl(String url) {
    final id = _youtubeId(url);
    if (id == null) return null;
    return 'https://www.youtube.com/embed/$id'
        '?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1';
  }

  @override
  void initState() {
    super.initState();
    _checkHealth();
    if (widget.stream.type == TvStreamType.audio) {
      _initAudio();
    } else {
      _initVideo();
    }
  }

  @override
  void didUpdateWidget(TvStreamPlayer old) {
    super.didUpdateWidget(old);
    if (old.stream.id != widget.stream.id) {
      _audioPlayer?.dispose();
      _audioPlayer = null;
      _webController = null;
      _hasError = false;
      _isPlaying = false;
      _streamOffline = false;
      _checkHealth();
      if (widget.stream.type == TvStreamType.audio) {
        _initAudio();
      } else {
        _initVideo();
      }
    }
    if (old.muted != widget.muted && _audioPlayer != null) {
      _audioPlayer!.setVolume(widget.muted ? 0.0 : 1.0);
    }
  }

  void _checkHealth() {
    final cached = TvStreamHealthChecker.isHealthy(widget.stream.id);
    if (!cached) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          setState(() => _streamOffline = true);
          widget.onStreamOffline?.call();
        }
      });
    }
    TvStreamHealthChecker.checkStream(widget.stream.url).then((ok) {
      if (!mounted) return;
      final wasOffline = _streamOffline;
      setState(() => _streamOffline = !ok);
      if (!ok && !wasOffline) {
        widget.onStreamOffline?.call();
      }
    });
  }

  void _initVideo() {
    final embedUrl = _embedUrl(widget.stream.url);
    if (embedUrl == null) return;
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.black)
      ..loadRequest(Uri.parse(embedUrl));
    setState(() => _webController = controller);
  }

  Future<void> _initAudio() async {
    setState(() => _isLoading = true);
    try {
      final player = AudioPlayer();
      await player.setUrl(widget.stream.url);
      player.setVolume(widget.muted ? 0.0 : 1.0);
      player.playerStateStream.listen((s) {
        if (!mounted) return;
        setState(() => _isPlaying = s.playing);
      });
      if (mounted) {
        setState(() {
          _audioPlayer = player;
          _isLoading = false;
        });
        await player.play();
      } else {
        player.dispose();
      }
    } catch (_) {
      if (mounted) setState(() { _isLoading = false; _hasError = true; });
    }
  }

  Future<void> _openVideoInBrowser() async {
    final uri = Uri.parse(widget.stream.url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  void dispose() {
    _audioPlayer?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) return _buildError();
    if (_isLoading) return _buildLoading();
    final content = widget.stream.type == TvStreamType.audio
        ? _buildAudioCard()
        : _buildVideoPlayer();
    if (!_streamOffline) return content;
    return Stack(children: [content, _buildOfflineDot()]);
  }

  /// Small overlay dot shown in the top-right corner when the stream is offline.
  Widget _buildOfflineDot() => Positioned(
        top: 16,
        right: 16,
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: const BoxDecoration(
                color: Colors.red,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 6),
            const Text(
              'Offline',
              style: TextStyle(color: Colors.red, fontSize: 14),
            ),
          ],
        ),
      );

  Widget _buildLoading() => Container(
        color: Colors.black,
        child: const Center(
          child: CircularProgressIndicator(color: PrayCalcColors.mid),
        ),
      );

  Widget _buildError() => Container(
        color: Colors.black,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.signal_wifi_off, color: Colors.white38, size: 64),
            const SizedBox(height: 16),
            const Text(
              'Stream unavailable',
              style: TextStyle(color: Colors.white54, fontSize: 20),
            ),
            const SizedBox(height: 8),
            const Text(
              'Showing art slideshow instead',
              style: TextStyle(color: Colors.white38, fontSize: 16),
            ),
          ],
        ),
      );

  Widget _buildAudioCard() => Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [PrayCalcColors.deep, PrayCalcColors.dark],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.stream.thumbnailEmoji ?? '🎵',
                style: const TextStyle(fontSize: 80),
              ),
              const SizedBox(height: 24),
              Text(
                widget.stream.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 8,
                    height: 8,
                    decoration: const BoxDecoration(
                      color: PrayCalcColors.mid,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    widget.muted
                        ? 'Muted'
                        : (_isPlaying ? 'Playing' : 'Buffering…'),
                    style: const TextStyle(
                      color: PrayCalcColors.light,
                      fontSize: 18,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _ControlButton(
                    icon: _isPlaying ? Icons.pause : Icons.play_arrow,
                    label: _isPlaying ? 'Pause' : 'Play',
                    onTap: () {
                      if (_isPlaying) {
                        _audioPlayer?.pause();
                      } else {
                        _audioPlayer?.play();
                      }
                    },
                  ),
                  const SizedBox(width: 16),
                  _ControlButton(
                    icon: Icons.stop,
                    label: 'Stop',
                    onTap: () => _audioPlayer?.stop(),
                  ),
                ],
              ),
            ],
          ),
        ),
      );

  /// Video streams — inline WebView using YouTube embed URL.
  /// Falls back to ambient art card if no embed URL can be derived.
  Widget _buildVideoPlayer() {
    final controller = _webController;
    if (controller == null) {
      // No embed URL (non-YouTube stream) — show art card with external link.
      return _buildVideoFallback();
    }
    return Stack(
      children: [
        WebViewWidget(controller: controller),
        // Small "open in app" button in corner for user escape hatch.
        Positioned(
          bottom: 16,
          right: 16,
          child: Opacity(
            opacity: 0.6,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.black54,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              icon: const Icon(Icons.open_in_new, size: 16),
              label: const Text('Open in YouTube', style: TextStyle(fontSize: 13)),
              onPressed: _openVideoInBrowser,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildVideoFallback() => Container(
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                widget.stream.thumbnailEmoji ?? '📺',
                style: const TextStyle(fontSize: 80),
              ),
              const SizedBox(height: 24),
              Text(
                widget.stream.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              const Text(
                'Live Stream',
                style: TextStyle(color: PrayCalcColors.mid, fontSize: 18),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: PrayCalcColors.dark,
                  foregroundColor: PrayCalcColors.light,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 28, vertical: 14),
                ),
                icon: const Icon(Icons.open_in_new),
                label: const Text('Open in YouTube', style: TextStyle(fontSize: 16)),
                onPressed: _openVideoInBrowser,
              ),
            ],
          ),
        ),
      );
}

class _ControlButton extends StatelessWidget {
  const _ControlButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          border: Border.all(color: PrayCalcColors.mid),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: PrayCalcColors.light, size: 22),
            const SizedBox(width: 8),
            Text(label,
                style: const TextStyle(
                    color: PrayCalcColors.light, fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
