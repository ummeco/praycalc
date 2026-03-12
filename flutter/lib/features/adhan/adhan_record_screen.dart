// AdhanRecordScreen — lets user record their own adhan using device microphone.
//
// Uses the `record` package (^5.0.0).
// Route: '/settings/adhan-record'

import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import 'adhan_library_service.dart';
import 'adhan_voices.dart';

class AdhanRecordScreen extends StatefulWidget {
  const AdhanRecordScreen({super.key});

  @override
  State<AdhanRecordScreen> createState() => _AdhanRecordScreenState();
}

class _AdhanRecordScreenState extends State<AdhanRecordScreen>
    with TickerProviderStateMixin {
  final AudioRecorder _recorder = AudioRecorder();
  final AudioPlayer _player = AudioPlayer();

  bool _isRecording = false;
  bool _hasRecording = false;
  bool _isPlaying = false;
  Duration _elapsed = Duration.zero;
  Timer? _timer;
  String? _recordingPath;

  // Waveform animation
  late AnimationController _waveCtrl;

  @override
  void initState() {
    super.initState();
    _waveCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _player.playerStateStream.listen((state) {
      if (!mounted) return;
      setState(() => _isPlaying = state.playing);
    });
  }

  @override
  void dispose() {
    _waveCtrl.dispose();
    _timer?.cancel();
    _recorder.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<String> _outputPath() async {
    final dir = await getApplicationDocumentsDirectory();
    return '${dir.path}/custom_adhan.m4a';
  }

  Future<void> _startRecording() async {
    final hasPermission = await _recorder.hasPermission();
    if (!hasPermission) return;

    final path = await _outputPath();
    await _recorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc),
      path: path,
    );
    _recordingPath = path;
    _elapsed = Duration.zero;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _elapsed += const Duration(seconds: 1));
    });
    _waveCtrl.repeat();
    setState(() {
      _isRecording = true;
      _hasRecording = false;
    });
  }

  Future<void> _stopRecording() async {
    await _recorder.stop();
    _timer?.cancel();
    _waveCtrl.stop();
    setState(() {
      _isRecording = false;
      _hasRecording = true;
    });
  }

  Future<void> _playBack() async {
    if (_recordingPath == null) return;
    if (_isPlaying) {
      await _player.stop();
      return;
    }
    await _player.setFilePath(_recordingPath!);
    await _player.play();
  }

  Future<void> _save() async {
    if (_recordingPath == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('custom_adhan_path', _recordingPath!);
    await AdhanLibraryService.instance.selectVoice(kCustomAdhanVoice);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Custom adhan saved.')),
      );
      Navigator.of(context).pop();
    }
  }

  Future<void> _delete() async {
    await _player.stop();
    if (_recordingPath != null) {
      final file = File(_recordingPath!);
      if (await file.exists()) await file.delete();
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('custom_adhan_path');
    setState(() {
      _hasRecording = false;
      _recordingPath = null;
      _elapsed = Duration.zero;
    });
  }

  String _formatDuration(Duration d) {
    final mm = d.inMinutes.remainder(60).toString().padLeft(2, '0');
    final ss = d.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$mm:$ss';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Record Custom Adhan')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 16),

            // Duration display
            Text(
              _formatDuration(_elapsed),
              style: const TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.w200,
                letterSpacing: 4,
                color: Colors.white,
              ),
            ),

            const SizedBox(height: 32),

            // Waveform visualization
            SizedBox(
              height: 60,
              child: AnimatedBuilder(
                animation: _waveCtrl,
                builder: (context, _) {
                  return CustomPaint(
                    size: const Size(double.infinity, 60),
                    painter: _WaveformPainter(
                      animValue: _isRecording ? _waveCtrl.value : 0,
                      color: _isRecording
                          ? Colors.redAccent
                          : Colors.white.withAlpha(60),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 48),

            // Record / Stop button
            GestureDetector(
              onTap: _isRecording ? _stopRecording : _startRecording,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _isRecording
                      ? Colors.redAccent
                      : Colors.white.withAlpha(30),
                  border: Border.all(
                    color: _isRecording
                        ? Colors.red.shade300
                        : Colors.white.withAlpha(80),
                    width: 2,
                  ),
                ),
                child: Icon(
                  _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                  size: 40,
                  color: Colors.white,
                ),
              ),
            ),

            const SizedBox(height: 12),

            Text(
              _isRecording ? 'Tap to stop' : 'Tap to record',
              style: TextStyle(
                color: Colors.white.withAlpha(140),
                fontSize: 14,
              ),
            ),

            const SizedBox(height: 40),

            // Playback + save + delete (visible only after recording)
            if (_hasRecording) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  OutlinedButton.icon(
                    onPressed: _playBack,
                    icon: Icon(_isPlaying ? Icons.stop : Icons.play_arrow),
                    label: Text(_isPlaying ? 'Stop' : 'Play Back'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: PrayCalcColors.light,
                      side: BorderSide(color: PrayCalcColors.mid.withAlpha(120)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  OutlinedButton.icon(
                    onPressed: _delete,
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Delete'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: BorderSide(color: Colors.redAccent.withAlpha(100)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _save,
                  style: FilledButton.styleFrom(
                    backgroundColor: PrayCalcColors.mid,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Save as My Adhan',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Waveform painter ──────────────────────────────────────────────────────────

class _WaveformPainter extends CustomPainter {
  const _WaveformPainter({required this.animValue, required this.color});

  final double animValue;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    const barCount = 20;
    final barWidth = size.width / (barCount * 2 - 1);

    for (int i = 0; i < barCount; i++) {
      final phase = animValue * math.pi * 2 + i * 0.4;
      final heightFraction = animValue > 0
          ? 0.2 + 0.8 * ((math.sin(phase) + 1) / 2)
          : 0.15;
      final barHeight = size.height * heightFraction;
      final x = i * barWidth * 2 + barWidth / 2;
      final top = (size.height - barHeight) / 2;
      canvas.drawLine(
        Offset(x, top),
        Offset(x, top + barHeight),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(_WaveformPainter old) =>
      old.animValue != animValue || old.color != color;
}
