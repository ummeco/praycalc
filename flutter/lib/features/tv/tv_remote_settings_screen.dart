import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';
import '../../shared/models/tv_settings_model.dart';

const _kSmartBase = 'https://smart.praycalc.com/api/v1/tv';
const _kTvSessionJwt = 'tv_session_jwt';

// ---------------------------------------------------------------------------
// Remote settings for a paired TV (TV2-10.13)
// ---------------------------------------------------------------------------

/// Layout preset options mirroring the web dashboard and TvSettingsScreen.
const _kLayoutPresets = [
  (id: 'prayer-only', label: 'Prayer Only'),
  (id: 'split-stream', label: 'Split Stream'),
  (id: 'split-art', label: 'Split Art'),
  (id: 'info-rich', label: 'Info Rich'),
  (id: 'masjid', label: 'Masjid'),
];

/// Audio mode options.
const _kAudioModes = [
  (id: 'silent', label: 'Silent'),
  (id: 'live-stream', label: 'Live Stream'),
  (id: 'quran', label: 'Quran Recitation'),
];

/// Screensaver photo source options.
const _kScreensaverSources = [
  (id: 'praycalc', label: 'PrayCalc Library'),
  (id: 'my-photos', label: 'My Photos'),
  (id: 'mix', label: 'Mix'),
];

/// Screensaver interval options (value = seconds).
const _kScreensaverIntervals = [
  (value: 15, label: '15 seconds'),
  (value: 30, label: '30 seconds'),
  (value: 60, label: '1 minute'),
  (value: 180, label: '3 minutes'),
  (value: 300, label: '5 minutes'),
];

/// Full-page remote settings for a specific paired TV.
///
/// Mirrors the web TvSettingsPanel sections. Settings are persisted locally
/// (SharedPreferences, keyed per device) and a "Push to TV" button shows a
/// confirmation snack bar. Real push-to-TV delivery is wired at the smart
/// service layer when the backend is live.
class TvRemoteSettingsScreen extends ConsumerStatefulWidget {
  const TvRemoteSettingsScreen({
    super.key,
    required this.deviceId,
    required this.deviceName,
  });

  final String deviceId;
  final String deviceName;

  @override
  ConsumerState<TvRemoteSettingsScreen> createState() =>
      _TvRemoteSettingsScreenState();
}

class _TvRemoteSettingsScreenState
    extends ConsumerState<TvRemoteSettingsScreen> {
  // ── State ──────────────────────────────────────────────────────────────────
  String _layoutPreset = 'prayer-only';
  String _audioMode = 'silent';
  String _screensaverSource = 'praycalc';
  int _screensaverInterval = 60;
  final _cityController = TextEditingController();

  // Announcements (mirrors TvSettingsScreen pattern)
  final List<Announcement> _announcements = [];
  final _annTitleController = TextEditingController();
  final _annBodyController = TextEditingController();

  bool _isSaving = false;

  // ── Iqamah state ────────────────────────────────────────────────────────────
  bool _iqamahExpanded = false;

  // Per-prayer iqamah config.  Each entry carries mode ('offset'|'fixed'),
  // offsetMinutes (0-120), and fixedTime ('HH:MM').
  final Map<String, _IqamahEntry> _iqamah = {
    'fajr':    _IqamahEntry(mode: 'offset', offsetMinutes: 20, fixedTime: '05:30'),
    'dhuhr':   _IqamahEntry(mode: 'offset', offsetMinutes: 15, fixedTime: '13:00'),
    'asr':     _IqamahEntry(mode: 'offset', offsetMinutes: 15, fixedTime: '16:30'),
    'maghrib': _IqamahEntry(mode: 'offset', offsetMinutes: 5,  fixedTime: ''),
    'isha':    _IqamahEntry(mode: 'offset', offsetMinutes: 20, fixedTime: '20:00'),
    'jumuah':  _IqamahEntry(mode: 'fixed',  offsetMinutes: 30, fixedTime: '13:30'),
  };

  // Controller map for fixed-time text fields (keyed by prayer key)
  late final Map<String, TextEditingController> _iqamahTimeControllers = {
    for (final entry in _iqamah.entries)
      entry.key: TextEditingController(text: entry.value.fixedTime),
  };

  @override
  void dispose() {
    _cityController.dispose();
    _annTitleController.dispose();
    _annBodyController.dispose();
    for (final c in _iqamahTimeControllers.values) { c.dispose(); }
    super.dispose();
  }

  Future<void> _pushToTv() async {
    setState(() => _isSaving = true);
    String? errorMsg;
    try {
      final prefs = await SharedPreferences.getInstance();
      final jwt = prefs.getString(_kTvSessionJwt);
      if (jwt == null) throw Exception('Not signed in to TV');

      final payload = <String, dynamic>{
        'layout_preset': _layoutPreset,
        'audio_mode': _audioMode,
        'screensaver_source': _screensaverSource,
        'screensaver_interval': _screensaverInterval,
        if (_cityController.text.trim().isNotEmpty)
          'city_slug': _cityController.text.trim(),
        'iqamah': {
          for (final e in _iqamah.entries)
            e.key: {
              'mode': e.value.mode,
              'offsetMinutes': e.value.offsetMinutes,
              'fixedTime': e.value.fixedTime,
            },
        },
      };

      final res = await http
          .patch(
            Uri.parse('$_kSmartBase/${widget.deviceId}/settings'),
            headers: {
              'Authorization': 'Bearer $jwt',
              'Content-Type': 'application/json',
            },
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 10));

      if (res.statusCode != 200) {
        final body = jsonDecode(res.body) as Map<String, dynamic>?;
        errorMsg = body?['error']?.toString() ?? 'Server error ${res.statusCode}';
      }
    } catch (e) {
      errorMsg = e.toString();
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(errorMsg == null ? 'Settings pushed to TV' : 'Error: $errorMsg'),
        backgroundColor: errorMsg == null ? PrayCalcColors.dark : Colors.red.shade800,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _addAnnouncement() {
    final title = _annTitleController.text.trim();
    final body = _annBodyController.text.trim();
    if (title.isEmpty) return;
    setState(() {
      _announcements.add(Announcement(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        title: title,
        body: body,
      ));
      _annTitleController.clear();
      _annBodyController.clear();
    });
  }

  void _removeAnnouncement(String id) {
    setState(() => _announcements.removeWhere((a) => a.id == id));
  }

  // ── Build ──────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: Text(
          widget.deviceName,
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        children: [
          _sectionHeader('Layout Preset'),
          _layoutPresetSection(),
          const SizedBox(height: 24),

          _sectionHeader('Audio Mode'),
          _audioModeSection(),
          const SizedBox(height: 24),

          _sectionHeader('Screensaver'),
          _screensaverSection(),
          const SizedBox(height: 24),

          _sectionHeader('City Override'),
          _cityOverrideSection(),
          const SizedBox(height: 24),

          _sectionHeader('Announcements'),
          _announcementsSection(),
          const SizedBox(height: 24),

          _iqamahSection(),
          const SizedBox(height: 32),

          _pushButton(),
          const SizedBox(height: 48),
        ],
      ),
    );
  }

  // ── Section helpers ────────────────────────────────────────────────────────

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          color: PrayCalcColors.light,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  Widget _layoutPresetSection() {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _kLayoutPresets.map((p) {
        final selected = _layoutPreset == p.id;
        return ChoiceChip(
          label: Text(p.label),
          selected: selected,
          onSelected: (_) => setState(() => _layoutPreset = p.id),
          selectedColor: PrayCalcColors.dark,
          backgroundColor: PrayCalcColors.surface,
          labelStyle: TextStyle(
            color: selected ? PrayCalcColors.light : Colors.white54,
            fontWeight:
                selected ? FontWeight.bold : FontWeight.normal,
          ),
          side: BorderSide(
            color: selected
                ? PrayCalcColors.mid
                : Colors.white12,
          ),
          showCheckmark: false,
        );
      }).toList(),
    );
  }

  Widget _audioModeSection() {
    return RadioGroup<String>(
      groupValue: _audioMode,
      onChanged: (v) => setState(() => _audioMode = v!),
      child: Column(
        children: _kAudioModes.map((m) {
          return RadioListTile<String>(
            value: m.id,
            title: Text(m.label,
                style: const TextStyle(color: Colors.white, fontSize: 15)),
            activeColor: PrayCalcColors.mid,
            contentPadding: EdgeInsets.zero,
            dense: true,
          );
        }).toList(),
      ),
    );
  }

  Widget _screensaverSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Photo source
        _dropdownLabel('Photo Source'),
        const SizedBox(height: 6),
        _styledDropdown<String>(
          value: _screensaverSource,
          items: _kScreensaverSources
              .map((s) => DropdownMenuItem(value: s.id, child: Text(s.label)))
              .toList(),
          onChanged: (v) => setState(() => _screensaverSource = v!),
        ),
        const SizedBox(height: 14),

        // Interval
        _dropdownLabel('Change Interval'),
        const SizedBox(height: 6),
        _styledDropdown<int>(
          value: _screensaverInterval,
          items: _kScreensaverIntervals
              .map((i) => DropdownMenuItem(value: i.value, child: Text(i.label)))
              .toList(),
          onChanged: (v) => setState(() => _screensaverInterval = v!),
        ),
      ],
    );
  }

  Widget _dropdownLabel(String text) {
    return Text(text,
        style: const TextStyle(color: Colors.white54, fontSize: 12));
  }

  Widget _styledDropdown<T>({
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: PrayCalcColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 14),
      child: DropdownButton<T>(
        value: value,
        items: items,
        onChanged: onChanged,
        isExpanded: true,
        dropdownColor: PrayCalcColors.surface,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        underline: const SizedBox.shrink(),
        iconEnabledColor: Colors.white38,
      ),
    );
  }

  Widget _cityOverrideSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _cityController,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          cursorColor: PrayCalcColors.light,
          decoration: InputDecoration(
            hintText: 'e.g. new-york-ny-us (blank = account default)',
            hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
            filled: true,
            fillColor: PrayCalcColors.surface,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.white12),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide:
                  const BorderSide(color: PrayCalcColors.mid, width: 1.5),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Colors.white12),
            ),
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'City slug — leave blank to use your account location',
          style: TextStyle(color: Colors.white24, fontSize: 11),
        ),
      ],
    );
  }

  Widget _announcementsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Existing announcements
        if (_announcements.isNotEmpty) ...[
          ..._announcements.map(
            (a) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: PrayCalcColors.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white12),
                ),
                child: ListTile(
                  title: Text(a.title,
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w600)),
                  subtitle: a.body.isNotEmpty
                      ? Text(a.body,
                          style: const TextStyle(
                              color: Colors.white54, fontSize: 13))
                      : null,
                  trailing: IconButton(
                    icon: const Icon(Icons.close, color: Colors.white38, size: 20),
                    onPressed: () => _removeAnnouncement(a.id),
                  ),
                  dense: true,
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
        ],

        // Add new announcement
        _addAnnouncementForm(),
      ],
    );
  }

  Widget _addAnnouncementForm() {
    return Container(
      decoration: BoxDecoration(
        color: PrayCalcColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          TextField(
            controller: _annTitleController,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            cursorColor: PrayCalcColors.light,
            decoration: InputDecoration(
              hintText: 'Announcement title',
              hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
              filled: true,
              fillColor: Colors.black12,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: PrayCalcColors.mid),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _annBodyController,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            cursorColor: PrayCalcColors.light,
            maxLines: 2,
            decoration: InputDecoration(
              hintText: 'Body text (optional)',
              hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
              filled: true,
              fillColor: Colors.black12,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: Colors.white12),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: PrayCalcColors.mid),
              ),
            ),
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: _addAnnouncement,
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Add Announcement'),
              style: OutlinedButton.styleFrom(
                foregroundColor: PrayCalcColors.light,
                side: const BorderSide(color: PrayCalcColors.dark),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _pushButton() {
    return FilledButton.icon(
      onPressed: _isSaving ? null : _pushToTv,
      icon: _isSaving
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                  strokeWidth: 2, color: Colors.white),
            )
          : const Icon(Icons.send, size: 20),
      label: Text(_isSaving ? 'Pushing...' : 'Push to TV'),
      style: FilledButton.styleFrom(
        backgroundColor: PrayCalcColors.dark,
        foregroundColor: PrayCalcColors.light,
        minimumSize: const Size(double.infinity, 52),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
      ),
    );
  }

  // ── Iqamah section ─────────────────────────────────────────────────────────

  static const _kIqamahPrayers = [
    (key: 'fajr',    name: 'Fajr',     arabic: 'فجر'),
    (key: 'dhuhr',   name: 'Dhuhr',    arabic: 'ظهر'),
    (key: 'asr',     name: 'Asr',      arabic: 'عصر'),
    (key: 'maghrib', name: 'Maghrib',  arabic: 'مغرب'),
    (key: 'isha',    name: 'Isha',     arabic: 'عشاء'),
    (key: 'jumuah',  name: "Jumu'ah",  arabic: 'جمعة'),
  ];

  Widget _iqamahSection() {
    return Theme(
      data: Theme.of(context).copyWith(
        dividerColor: Colors.transparent,
      ),
      child: Container(
        decoration: BoxDecoration(
          color: PrayCalcColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.white12),
        ),
        child: ExpansionTile(
          title: const Text(
            'Iqamah Schedule',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
          ),
          initiallyExpanded: _iqamahExpanded,
          onExpansionChanged: (v) => setState(() => _iqamahExpanded = v),
          iconColor: const Color(0xFFC9F27A),
          collapsedIconColor: Colors.white54,
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          childrenPadding: const EdgeInsets.only(bottom: 8),
          children: _kIqamahPrayers.map((p) {
            final entry = _iqamah[p.key]!;
            final isOffset = entry.mode == 'offset';
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              child: Row(
                children: [
                  // Prayer name
                  SizedBox(
                    width: 90,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: 13,
                          ),
                        ),
                        Text(
                          p.arabic,
                          style: const TextStyle(
                            color: Colors.white60,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Mode toggle
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.black12,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFC9F27A), width: 0.5),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _modeToggleBtn('Offset', isOffset, () {
                          setState(() => _iqamah[p.key] = entry.copyWith(mode: 'offset'));
                        }),
                        _modeToggleBtn('Fixed', !isOffset, () {
                          setState(() => _iqamah[p.key] = entry.copyWith(mode: 'fixed'));
                        }),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Value input
                  if (isOffset)
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _stepBtn(Icons.remove, () {
                          if (entry.offsetMinutes > 0) {
                            setState(() => _iqamah[p.key] =
                                entry.copyWith(offsetMinutes: entry.offsetMinutes - 1));
                          }
                        }),
                        SizedBox(
                          width: 36,
                          child: Text(
                            '${entry.offsetMinutes}',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                          ),
                        ),
                        _stepBtn(Icons.add, () {
                          if (entry.offsetMinutes < 120) {
                            setState(() => _iqamah[p.key] =
                                entry.copyWith(offsetMinutes: entry.offsetMinutes + 1));
                          }
                        }),
                      ],
                    )
                  else
                    SizedBox(
                      width: 80,
                      child: TextField(
                        controller: _iqamahTimeControllers[p.key],
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        cursorColor: PrayCalcColors.light,
                        keyboardType: TextInputType.datetime,
                        onChanged: (v) {
                          setState(() => _iqamah[p.key] = entry.copyWith(fixedTime: v));
                        },
                        decoration: InputDecoration(
                          hintText: 'HH:MM',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                          isDense: true,
                          filled: true,
                          fillColor: Colors.black12,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Colors.white12),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: Colors.white12),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(color: PrayCalcColors.mid),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _modeToggleBtn(String label, bool selected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFF1E5E2F) : Colors.transparent,
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? const Color(0xFFC9F27A) : Colors.white38,
            fontSize: 11,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _stepBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 28,
        height: 28,
        alignment: Alignment.center,
        child: Icon(icon, size: 16, color: Colors.white54),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Data class for iqamah per-prayer config
// ---------------------------------------------------------------------------

class _IqamahEntry {
  const _IqamahEntry({
    required this.mode,
    required this.offsetMinutes,
    required this.fixedTime,
  });

  final String mode;           // 'offset' | 'fixed'
  final int offsetMinutes;     // 0–120
  final String fixedTime;      // 'HH:MM'

  _IqamahEntry copyWith({
    String? mode,
    int? offsetMinutes,
    String? fixedTime,
  }) {
    return _IqamahEntry(
      mode: mode ?? this.mode,
      offsetMinutes: offsetMinutes ?? this.offsetMinutes,
      fixedTime: fixedTime ?? this.fixedTime,
    );
  }
}
