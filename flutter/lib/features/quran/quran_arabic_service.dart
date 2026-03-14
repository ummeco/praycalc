// QuranArabicService — fetches and caches Arabic verse text from alquran.cloud.
//
// API: GET https://api.alquran.cloud/v1/ayah/{surah}:{verse}/ar
// Response shape: { "data": { "text": "...", ... } }
//
// Two-tier cache:
//   1. In-memory Map<String, String> for instant repeated lookups.
//   2. SharedPreferences keyed as "quran_arabic_{surah}_{verse}" for offline use.

import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class QuranArabicService {
  QuranArabicService._();

  static final QuranArabicService instance = QuranArabicService._();

  // ── In-memory cache ──────────────────────────────────────────────────────

  final Map<String, String> _cache = {};

  // ── Public API ───────────────────────────────────────────────────────────

  /// Returns the Arabic text for [surah]:[verse], or null on failure.
  ///
  /// Checks in-memory cache first, then SharedPreferences, then the network.
  Future<String?> getVerseText(int surah, int verse) async {
    final key = '$surah:$verse';

    // 1. In-memory cache hit.
    if (_cache.containsKey(key)) return _cache[key];

    // 2. Persistent cache hit.
    final prefs = await SharedPreferences.getInstance();
    final persisted = prefs.getString('quran_arabic_${surah}_$verse');
    if (persisted != null && persisted.isNotEmpty) {
      _cache[key] = persisted;
      return persisted;
    }

    // 3. Network fetch.
    try {
      final uri = Uri.parse(
        'https://api.alquran.cloud/v1/ayah/$surah:$verse/ar',
      );
      final response = await http.get(uri).timeout(const Duration(seconds: 10));
      if (response.statusCode != 200) return null;

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as Map<String, dynamic>?;
      final text = data?['text'] as String?;
      if (text == null || text.isEmpty) return null;

      // Store in both caches.
      _cache[key] = text;
      await prefs.setString('quran_arabic_${surah}_$verse', text);
      return text;
    } catch (_) {
      return null;
    }
  }

  /// Clears the in-memory cache (does not touch SharedPreferences).
  void clearMemoryCache() => _cache.clear();
}
