import 'dart:async';

import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show KeyDownEvent, LogicalKeyboardKey;
import 'package:just_audio/just_audio.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../core/theme/app_theme.dart';
import 'tv_stream_player_web_stub.dart'
    if (dart.library.html) 'tv_stream_player_web.dart';
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

  // Fallback URL cycling — index into widget.stream.allUrls.
  int _urlIndex = 0;
  bool _isTryingFallback = false;

  // Web-only: starts muted for browser autoplay policy compliance.
  // Incremented on unmute to force iframe recreation with a new viewId.
  bool _webMuted = true;
  int _webViewVersion = 0;
  Timer? _webFallbackTimer;
  // Periodic reload to recover from frozen YouTube/HLS streams on web.
  Timer? _webPeriodicReloadTimer;
  static const Duration _periodicReloadInterval = Duration(minutes: 60);

  final _focusNode = FocusNode();

  /// Returns the active URL based on the current fallback index.
  String get _currentUrl => widget.stream.allUrls[
      _urlIndex.clamp(0, widget.stream.allUrls.length - 1)];

  /// Extracts the YouTube video ID from a watch URL.
  /// e.g. https://www.youtube.com/watch?v=ABC123 → ABC123
  static String? _youtubeId(String url) {
    final uri = Uri.tryParse(url);
    return uri?.queryParameters['v'];
  }

  /// Returns the YouTube embed URL. [muted] controls the mute param.
  ///
  /// Note: loop=1&playlist=id is intentionally omitted — it causes
  /// "Video unavailable" on live streams when the loop timer fires.
  static String? _embedUrl(String url, {bool muted = false}) {
    final id = _youtubeId(url);
    if (id == null) return null;
    final muteParam = muted ? '&mute=1' : '';
    return 'https://www.youtube.com/embed/$id'
        '?autoplay=1$muteParam&controls=1&rel=0'
        '&playsinline=1&iv_load_policy=3&cc_load_policy=0';
  }

  /// Advances to the next fallback URL. No-op when all URLs are exhausted.
  void _tryNextUrl() {
    final total = widget.stream.allUrls.length;
    if (_urlIndex >= total - 1) {
      // All fallbacks exhausted — mark as fully offline.
      if (mounted) {
        setState(() {
          _streamOffline = true;
          _isTryingFallback = false;
        });
        widget.onStreamOffline?.call();
      }
      return;
    }
    if (!mounted) return;
    setState(() {
      _urlIndex++;
      _isTryingFallback = true;
      _streamOffline = false;
      _webViewVersion++; // force iframe recreation on web
    });
    // Re-init native video/audio with the new URL.
    if (!kIsWeb) {
      _webController = null;
      if (widget.stream.type == TvStreamType.audio) {
        _audioPlayer?.dispose();
        _audioPlayer = null;
        _initAudio();
      } else {
        _initVideo();
        _checkHealth();
      }
    }
  }

  void _webUnmute() {
    if (!_webMuted) return;
    setState(() {
      _webMuted = false;
      _webViewVersion++;
    });
    // Reset the periodic reload timer so we don't reload right after user
    // interacted with the stream.
    _schedulePeriodicReload();
  }

  /// Schedules a silent iframe reload every [_periodicReloadInterval] to
  /// recover from frozen YouTube / HLS streams on web without user action.
  void _schedulePeriodicReload() {
    if (!kIsWeb) return;
    _webPeriodicReloadTimer?.cancel();
    _webPeriodicReloadTimer = Timer.periodic(_periodicReloadInterval, (_) {
      if (!mounted) return;
      setState(() => _webViewVersion++);
    });
  }

  /// Schedules a web fallback to try the next URL after [delay].
  /// Not used for HLS streams — they handle errors internally via HLS.js.
  /// Not triggered by muted state — on TV the stream is intentionally muted
  /// for autoplay compliance and should never be cycled away from that state.
  void _scheduleWebFallback() {
    // Disabled: on TV the stream stays muted indefinitely by design.
    // The periodic reload (every 60 min) handles frozen streams instead.
  }

  @override
  void initState() {
    super.initState();
    _checkHealth();
    if (widget.stream.type == TvStreamType.audio) {
      _initAudio();
    } else {
      _initVideo();
      _scheduleWebFallback();
      _schedulePeriodicReload();
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
      _urlIndex = 0;
      _isTryingFallback = false;
      _webFallbackTimer?.cancel();
      _webPeriodicReloadTimer?.cancel();
      _checkHealth();
      if (widget.stream.type == TvStreamType.audio) {
        _initAudio();
      } else {
        _initVideo();
        _scheduleWebFallback();
        _schedulePeriodicReload();
      }
    }
    if (old.muted != widget.muted && _audioPlayer != null) {
      _audioPlayer!.setVolume(widget.muted ? 0.0 : 1.0);
    }
  }

  void _checkHealth() {
    // On web the iframe handles errors natively; HEAD checks fail due to CORS.
    if (kIsWeb) return;
    final cached = TvStreamHealthChecker.isHealthy(widget.stream.id);
    if (!cached) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _tryNextUrl();
      });
      return;
    }
    TvStreamHealthChecker.checkStream(_currentUrl).then((ok) {
      if (!mounted) return;
      if (!ok) {
        _tryNextUrl();
      } else {
        setState(() {
          _streamOffline = false;
          _isTryingFallback = false;
        });
      }
    });
  }

  void _initVideo() {
    if (kIsWeb) return; // Web uses HtmlElementView iframe — no controller needed.
    final embedUrl = _embedUrl(_currentUrl, muted: widget.muted);
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
    final uri = Uri.parse(_currentUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  void dispose() {
    _audioPlayer?.dispose();
    _webFallbackTimer?.cancel();
    _webPeriodicReloadTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_hasError) return _buildError();
    if (_isLoading) return _buildLoading();
    final content = widget.stream.type == TvStreamType.audio
        ? _buildAudioCard()
        : _buildVideoPlayer();
    if (_streamOffline) {
      return Stack(children: [content, _buildOfflineDot()]);
    }
    if (_isTryingFallback) {
      return Stack(children: [content, _buildFallbackBadge()]);
    }
    return content;
  }

  /// Shown when all fallback URLs are exhausted and stream is truly offline.
  Widget _buildOfflineDot() => Positioned(
        top: 16,
        right: 16,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.65),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.red.withValues(alpha: 0.6)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              const Text(
                'Stream offline',
                style: TextStyle(color: Colors.red, fontSize: 13),
              ),
            ],
          ),
        ),
      );

  /// Subtle badge shown while trying a backup stream URL.
  Widget _buildFallbackBadge() => Positioned(
        top: 16,
        right: 16,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.65),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: PrayCalcColors.mid.withValues(alpha: 0.5)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              SizedBox(
                width: 8,
                height: 8,
                child: CircularProgressIndicator(
                  strokeWidth: 1.5,
                  color: PrayCalcColors.light,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                'Backup $_urlIndex',
                style: const TextStyle(
                    color: PrayCalcColors.light, fontSize: 13),
              ),
            ],
          ),
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

  /// Returns true when the current URL is an HLS manifest.
  bool get _isHlsUrl => _currentUrl.contains('.m3u8');

  /// Video streams — iframe on web, WebView on native.
  Widget _buildVideoPlayer() {
    if (kIsWeb) {
      // ── HLS streams (e.g. Akamai CDN, m3u8 URLs) ────────────────────────────
      if (_isHlsUrl) {
        // Version suffix forces iframe recreation when mute state changes.
        final viewId = 'hls-player-${widget.stream.id}-$_webViewVersion';
        return KeyboardListener(
          focusNode: _focusNode,
          autofocus: true,
          onKeyEvent: (e) {
            if (e is! KeyDownEvent) return;
            final k = e.logicalKey;
            if (k == LogicalKeyboardKey.select ||
                k == LogicalKeyboardKey.enter ||
                k == LogicalKeyboardKey.audioVolumeUp ||
                k == LogicalKeyboardKey.audioVolumeDown) {
              _webUnmute();
            }
          },
          child: GestureDetector(
            onTap: _webUnmute,
            child: Stack(
              children: [
                buildHlsVideoPlayer(_currentUrl, viewId, muted: _webMuted),
                Positioned(
                  top: 16,
                  left: 16,
                  child: _WebVolumeButton(
                    muted: _webMuted,
                    onTap: _webUnmute,
                  ),
                ),
              ],
            ),
          ),
        );
      }

      // ── YouTube embeds ───────────────────────────────────────────────────────
      final embedUrl = _embedUrl(_currentUrl, muted: _webMuted);
      if (embedUrl == null) return _buildVideoFallback();
      // Version suffix forces iframe recreation when mute state changes.
      final viewId = 'yt-iframe-${widget.stream.id}-$_webViewVersion';
      return KeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (e) {
          if (e is! KeyDownEvent) return;
          final k = e.logicalKey;
          if (k == LogicalKeyboardKey.select ||
              k == LogicalKeyboardKey.enter ||
              k == LogicalKeyboardKey.audioVolumeUp ||
              k == LogicalKeyboardKey.audioVolumeDown) {
            _webUnmute();
          }
        },
        child: GestureDetector(
          onTap: _webUnmute,
          child: Stack(
            children: [
              buildYouTubeIframe(embedUrl, viewId),
              // Volume indicator — always visible top-left.
              // Red muted icon when muted, green when live audio.
              Positioned(
                top: 16,
                left: 16,
                child: _WebVolumeButton(
                  muted: _webMuted,
                  onTap: _webUnmute,
                ),
              ),
            ],
          ),
        ),
      );
    }
    final controller = _webController;
    if (controller == null) return _buildVideoFallback();
    return Stack(
      children: [
        WebViewWidget(controller: controller),
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

// ─── Volume indicator button (web stream mode) ────────────────────────────────

/// Persistent volume icon shown top-left of the stream iframe.
/// Red + slashed when muted, green when audio is live.
/// Tapping while muted triggers the unmute callback.
class _WebVolumeButton extends StatelessWidget {
  const _WebVolumeButton({required this.muted, required this.onTap});

  final bool muted;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isMuted = muted;
    final iconColor = isMuted ? const Color(0xFFE05555) : const Color(0xFF79C24C);
    final glowColor = isMuted
        ? const Color(0xFFE05555).withValues(alpha: 0.35)
        : const Color(0xFF79C24C).withValues(alpha: 0.30);

    return GestureDetector(
      onTap: isMuted ? onTap : null,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.55),
          shape: BoxShape.circle,
          border: Border.all(color: iconColor.withValues(alpha: 0.7), width: 1.5),
          boxShadow: [
            BoxShadow(color: glowColor, blurRadius: 12, spreadRadius: 2),
          ],
        ),
        child: Icon(
          isMuted ? Icons.volume_off_rounded : Icons.volume_up_rounded,
          color: iconColor,
          size: 22,
        ),
      ),
    );
  }
}

// ─── Generic control button ───────────────────────────────────────────────────

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
