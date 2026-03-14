import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/services/tv_quran_service.dart';
import '../../core/theme/app_theme.dart';

// Route constant used by app_router.dart.
const kTvQuranControlRoute = '/paired-tvs/quran';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const _kSmartBase = 'https://smart.praycalc.com/api/v1/tv';
const _kTvSessionJwt = 'tv_session_jwt';
const _kTvDeviceList = 'tv_device_list';

/// English surah names, 1-indexed (index 0 = Surah 1).
const List<String> _kSurahNames = [
  'Al-Fatihah', 'Al-Baqarah', "Ali 'Imran", 'An-Nisa', "Al-Ma'idah",
  "Al-An'am", "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus',
  'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr',
  'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
  'Al-Anbiya', 'Al-Hajj', "Al-Mu'minun", 'An-Nur', 'Al-Furqan',
  "Ash-Shu'ara", 'An-Naml', 'Al-Qasas', 'Al-Ankabut', 'Ar-Rum',
  'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
  'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
  'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
  'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
  'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
  "Al-Waqi'ah", 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
  'As-Saf', "Al-Jumu'ah", 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
  'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', "Al-Ma'arij",
  'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
  'Al-Insan', 'Al-Mursalat', "An-Naba", "An-Nazi'at", 'Abasa',
  'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
  'At-Tariq', "Al-A'la", 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
  'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
  'Al-Alaq', 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', 'Al-Adiyat',
  "Al-Qari'ah", 'At-Takathur', 'Al-Asr', 'Al-Humazah', 'Al-Fil',
  'Quraysh', "Al-Ma'un", 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
  'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
];

// After-surah action options.
const _kAfterSurahOptions = [
  (id: 'stop', label: 'Stop'),
  (id: 'loop', label: 'Loop'),
  (id: 'continue', label: 'Continue'),
];

// Background mode options.
const _kBgModes = [
  (id: 'gradient', label: 'Gradient'),
  (id: 'geometric', label: 'Geometric'),
  (id: 'art', label: 'Art Slideshow'),
];

// ---------------------------------------------------------------------------
// Local palette
// ---------------------------------------------------------------------------

const _kBgColor = Color(0xFF0A1F0E);
const _kAccent = Color(0xFFC9F27A);
const _kCardBg = Color(0x4D1E5E2F); // Color(0xFF1E5E2F).withOpacity(0.3)

// ---------------------------------------------------------------------------
// TV device model (local)
// ---------------------------------------------------------------------------

class _TvDevice {
  const _TvDevice({required this.id, required this.name});
  final String id;
  final String name;

  factory _TvDevice.fromJson(Map<String, dynamic> json) => _TvDevice(
        id: json['id'] as String,
        name: json['name'] as String,
      );
}

// ---------------------------------------------------------------------------
// TvQuranControlScreen
// ---------------------------------------------------------------------------

/// Mobile screen for selecting a paired TV and controlling Quran playback
/// on it remotely via the smart service.
class TvQuranControlScreen extends StatefulWidget {
  const TvQuranControlScreen({
    super.key,
    this.deviceId,
    this.deviceName,
  });

  /// Pre-selected TV device ID. If null the user picks from the device list.
  final String? deviceId;

  /// Display name of the pre-selected device.
  final String? deviceName;

  @override
  State<TvQuranControlScreen> createState() => _TvQuranControlScreenState();
}

class _TvQuranControlScreenState extends State<TvQuranControlScreen> {
  // ── Device selection ───────────────────────────────────────────────────────
  String? _deviceId;
  String? _deviceName;
  List<_TvDevice> _devices = [];
  bool _loadingDevices = true;

  // ── Playback options ───────────────────────────────────────────────────────
  QuranReciter _selectedReciter = kQuranReciters[0];
  int _selectedSurah = 1; // 1-indexed
  String _afterSurah = 'stop';
  String _selectedBg = 'gradient';

  // ── Control state ──────────────────────────────────────────────────────────
  bool _isSending = false;

  // ── Now-playing poll ───────────────────────────────────────────────────────
  Timer? _pollTimer;
  Map<String, dynamic>? _nowPlaying; // quranCommand from settings_json

  @override
  void initState() {
    super.initState();
    _deviceId = widget.deviceId;
    _deviceName = widget.deviceName;
    _loadDevices();
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  // ── Device loading ─────────────────────────────────────────────────────────

  Future<void> _loadDevices() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_kTvDeviceList);
    final List<_TvDevice> devices = [];
    if (raw != null) {
      try {
        final list = jsonDecode(raw) as List<dynamic>;
        for (final item in list) {
          if (item is Map<String, dynamic>) {
            devices.add(_TvDevice.fromJson(item));
          }
        }
      } catch (e, st) {
        // Malformed JSON — treat as empty.
      }
    }
    if (mounted) {
      setState(() {
        _devices = devices;
        _loadingDevices = false;
        // If a device was pre-selected, start polling immediately.
        if (_deviceId != null) _startPolling();
      });
    }
  }

  void _selectDevice(_TvDevice device) {
    setState(() {
      _deviceId = device.id;
      _deviceName = device.name;
      _nowPlaying = null;
    });
    _startPolling();
  }

  // ── Polling ────────────────────────────────────────────────────────────────

  void _startPolling() {
    _pollTimer?.cancel();
    _pollNowPlaying();
    _pollTimer = Timer.periodic(const Duration(seconds: 6), (_) {
      _pollNowPlaying();
    });
  }

  Future<void> _pollNowPlaying() async {
    final id = _deviceId;
    if (id == null) return;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_kTvSessionJwt) ?? '';
      final res = await http
          .get(
            Uri.parse('$_kSmartBase/$id/settings'),
            headers: {'Authorization': 'Bearer $token'},
          )
          .timeout(const Duration(seconds: 8));

      if (!mounted) return;
      if (res.statusCode == 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>;
        final settingsJson =
            body['settings_json'] as Map<String, dynamic>?;
        setState(() {
          _nowPlaying =
              settingsJson?['quranCommand'] as Map<String, dynamic>?;
        });
      }
    } catch (e, st) {
      // Network failure — silently ignore; will retry on next tick.
    }
  }

  // ── Smart service calls ────────────────────────────────────────────────────

  Future<void> _playOnTv() async {
    final id = _deviceId;
    if (id == null) return;
    setState(() => _isSending = true);
    String? errorMsg;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_kTvSessionJwt) ?? '';
      final res = await http
          .post(
            Uri.parse('$_kSmartBase/$id/quran'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'action': 'play',
              'surahNumber': _selectedSurah,
              'reciterId': _selectedReciter.id,
              'afterSurah': _afterSurah,
              'backgroundMode': _selectedBg,
            }),
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>?;
        errorMsg =
            body?['error']?.toString() ?? 'Server error ${res.statusCode}';
      } else {
        _pollNowPlaying();
      }
    } catch (e) {
      errorMsg = e.toString();
    } finally {
      if (mounted) setState(() => _isSending = false);
    }

    if (!mounted) return;
    _showSnack(
      errorMsg == null ? 'Playing on TV' : 'Error: $errorMsg',
      isError: errorMsg != null,
    );
  }

  Future<void> _sendAction(String action) async {
    final id = _deviceId;
    if (id == null) return;
    setState(() => _isSending = true);
    String? errorMsg;
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_kTvSessionJwt) ?? '';
      final res = await http
          .post(
            Uri.parse('$_kSmartBase/$id/quran'),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer $token',
            },
            body: jsonEncode({'action': action}),
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>?;
        errorMsg =
            body?['error']?.toString() ?? 'Server error ${res.statusCode}';
      } else {
        _pollNowPlaying();
      }
    } catch (e) {
      errorMsg = e.toString();
    } finally {
      if (mounted) setState(() => _isSending = false);
    }

    if (!mounted) return;
    if (errorMsg != null) _showSnack('Error: $errorMsg', isError: true);
  }

  void _showSnack(String msg, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor:
            isError ? Colors.red.shade800 : PrayCalcColors.dark,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _kBgColor,
      appBar: AppBar(
        backgroundColor: _kBgColor,
        foregroundColor: Colors.white,
        title: const Text(
          'Quran on TV',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: _loadingDevices
          ? const Center(
              child: CircularProgressIndicator(color: _kAccent),
            )
          : _deviceId == null
              ? _buildDevicePicker()
              : _buildControls(),
    );
  }

  // ── Device picker ──────────────────────────────────────────────────────────

  Widget _buildDevicePicker() {
    if (_devices.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.tv_off, color: Colors.white38, size: 56),
              const SizedBox(height: 16),
              const Text(
                'No TVs paired. Connect a TV first.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54, fontSize: 16),
              ),
              const SizedBox(height: 24),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: _kAccent,
                  side: const BorderSide(color: _kAccent),
                ),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        _sectionHeader('Select a TV'),
        const SizedBox(height: 8),
        ..._devices.map(
          (d) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _deviceTile(d),
          ),
        ),
      ],
    );
  }

  Widget _deviceTile(_TvDevice device) {
    return InkWell(
      onTap: () => _selectDevice(device),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: _kCardBg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12),
        ),
        padding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            const Icon(Icons.tv, color: _kAccent, size: 24),
            const SizedBox(width: 14),
            Expanded(
              child: Text(
                device.name,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.white38),
          ],
        ),
      ),
    );
  }

  // ── Controls ───────────────────────────────────────────────────────────────

  Widget _buildControls() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        // Now-playing bar (shown when a track is active).
        if (_isNowPlaying) ...[
          _nowPlayingBar(),
          const SizedBox(height: 20),
        ],

        // TV label + change link.
        Row(
          children: [
            const Icon(Icons.tv, color: _kAccent, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _deviceName ?? _deviceId ?? '',
                style:
                    const TextStyle(color: Colors.white70, fontSize: 14),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            GestureDetector(
              onTap: () => setState(() {
                _deviceId = null;
                _deviceName = null;
                _nowPlaying = null;
                _pollTimer?.cancel();
              }),
              child: const Text(
                'Change',
                style: TextStyle(color: _kAccent, fontSize: 13),
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),

        _sectionHeader('Reciter'),
        const SizedBox(height: 8),
        _reciterSection(),
        const SizedBox(height: 24),

        _sectionHeader('Surah'),
        const SizedBox(height: 8),
        _surahSection(),
        const SizedBox(height: 24),

        _sectionHeader('After Surah'),
        const SizedBox(height: 8),
        _afterSurahSection(),
        const SizedBox(height: 24),

        _sectionHeader('Background'),
        const SizedBox(height: 8),
        _backgroundSection(),
        const SizedBox(height: 32),

        _playButton(),
        const SizedBox(height: 48),
      ],
    );
  }

  // ── Reciter section ────────────────────────────────────────────────────────

  Widget _reciterSection() {
    return Container(
      decoration: BoxDecoration(
        color: _kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        children: kQuranReciters.asMap().entries.map((entry) {
          final index = entry.key;
          final reciter = entry.value;
          final selected = _selectedReciter.id == reciter.id;
          final isLast = index == kQuranReciters.length - 1;
          return Column(
            children: [
              ListTile(
                onTap: () => setState(() => _selectedReciter = reciter),
                dense: true,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 2),
                leading: Text(
                  reciter.emoji,
                  style: const TextStyle(fontSize: 22),
                ),
                title: Text(
                  reciter.name,
                  style: TextStyle(
                    color: selected ? _kAccent : Colors.white,
                    fontWeight: selected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    fontSize: 15,
                  ),
                ),
                subtitle: Text(
                  reciter.country,
                  style: const TextStyle(
                      color: Colors.white38, fontSize: 12),
                ),
                trailing: selected
                    ? const Icon(Icons.check_circle,
                        color: _kAccent, size: 20)
                    : null,
              ),
              if (!isLast)
                const Divider(
                    height: 1, color: Colors.white10, indent: 56),
            ],
          );
        }).toList(),
      ),
    );
  }

  // ── Surah section ──────────────────────────────────────────────────────────

  Widget _surahSection() {
    final items = List.generate(
      114,
      (i) => DropdownMenuItem<int>(
        value: i + 1,
        child: Text(
          '${i + 1}. ${_kSurahNames[i]}',
          overflow: TextOverflow.ellipsis,
        ),
      ),
    );

    return Container(
      decoration: BoxDecoration(
        color: _kCardBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: DropdownButton<int>(
        value: _selectedSurah,
        items: items,
        onChanged: (v) => setState(() => _selectedSurah = v!),
        isExpanded: true,
        dropdownColor: const Color(0xFF0E2A14),
        style: const TextStyle(color: Colors.white, fontSize: 15),
        underline: const SizedBox.shrink(),
        iconEnabledColor: Colors.white38,
      ),
    );
  }

  // ── After-surah section ────────────────────────────────────────────────────

  Widget _afterSurahSection() {
    return Row(
      children: _kAfterSurahOptions.map((opt) {
        final selected = _afterSurah == opt.id;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => setState(() => _afterSurah = opt.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color:
                      selected ? PrayCalcColors.dark : _kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color:
                        selected ? _kAccent : Colors.white12,
                    width: selected ? 1.5 : 1,
                  ),
                ),
                child: Text(
                  opt.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: selected ? _kAccent : Colors.white54,
                    fontWeight: selected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    fontSize: 13,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── Background section ─────────────────────────────────────────────────────

  Widget _backgroundSection() {
    return Row(
      children: _kBgModes.map((mode) {
        final selected = _selectedBg == mode.id;
        return Expanded(
          child: Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => setState(() => _selectedBg = mode.id),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding: const EdgeInsets.symmetric(vertical: 10),
                decoration: BoxDecoration(
                  color:
                      selected ? PrayCalcColors.dark : _kCardBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color:
                        selected ? _kAccent : Colors.white12,
                    width: selected ? 1.5 : 1,
                  ),
                ),
                child: Text(
                  mode.label,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: selected ? _kAccent : Colors.white54,
                    fontWeight: selected
                        ? FontWeight.bold
                        : FontWeight.normal,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  // ── Now-playing bar ────────────────────────────────────────────────────────

  bool get _isNowPlaying =>
      _nowPlaying != null &&
      _nowPlaying!['action']?.toString() == 'play';

  Widget _nowPlayingBar() {
    final surahNum = _nowPlaying?['surahNumber'];
    String surahLabel = 'Unknown Surah';
    if (surahNum is num) {
      final n = surahNum.toInt();
      if (n >= 1 && n <= 114) surahLabel = '${_kSurahNames[n - 1]} ($n)';
    }

    return Container(
      decoration: BoxDecoration(
        color: PrayCalcColors.dark.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _kAccent.withValues(alpha: 0.4)),
      ),
      padding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.music_note, color: _kAccent, size: 16),
              const SizedBox(width: 6),
              const Text(
                'NOW PLAYING',
                style: TextStyle(
                  color: _kAccent,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            'Surah $surahLabel',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _controlButton(
                icon: Icons.pause,
                label: 'Pause',
                onTap: _isSending
                    ? null
                    : () => _sendAction('pause'),
              ),
              const SizedBox(width: 10),
              _controlButton(
                icon: Icons.stop,
                label: 'Stop',
                onTap: _isSending
                    ? null
                    : () => _sendAction('stop'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _controlButton({
    required IconData icon,
    required String label,
    required VoidCallback? onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white10,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Colors.white12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: Colors.white70, size: 16),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                    color: Colors.white70, fontSize: 13),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Play button ────────────────────────────────────────────────────────────

  Widget _playButton() {
    return FilledButton.icon(
      onPressed: _isSending ? null : _playOnTv,
      icon: _isSending
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: Colors.white),
            )
          : const Icon(Icons.play_arrow_rounded, size: 22),
      label: Text(
        _isSending ? 'Sending...' : 'Play on TV',
        style:
            const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
      style: FilledButton.styleFrom(
        backgroundColor: PrayCalcColors.dark,
        foregroundColor: _kAccent,
        minimumSize: const Size(double.infinity, 54),
      ),
    );
  }

  // ── Shared helpers ─────────────────────────────────────────────────────────

  Widget _sectionHeader(String title) {
    return Text(
      title.toUpperCase(),
      style: const TextStyle(
        color: _kAccent,
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}
