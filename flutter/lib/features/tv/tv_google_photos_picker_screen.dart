// TvGooglePhotosPickerScreen — select a Google Photos album as rotating TV wallpaper.
//
// Uses google_sign_in (^6.2.2) with photoslibrary.readonly scope.
// Selected photo URLs saved to SharedPreferences key 'tv_google_photos_urls'.
// Route: '/tv/google-photos'

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/theme/app_theme.dart';

// ── Google Photos API helpers ─────────────────────────────────────────────────

const _kPhotosScope = 'https://www.googleapis.com/auth/photoslibrary.readonly';

class _Album {
  final String id;
  final String title;
  final String? coverPhotoBaseUrl;
  final int mediaItemsCount;

  const _Album({
    required this.id,
    required this.title,
    this.coverPhotoBaseUrl,
    required this.mediaItemsCount,
  });

  factory _Album.fromJson(Map<String, dynamic> json) => _Album(
        id: json['id'] as String,
        title: json['title'] as String? ?? 'Untitled',
        coverPhotoBaseUrl: json['coverPhotoBaseUrl'] as String?,
        mediaItemsCount:
            int.tryParse(json['mediaItemsCount']?.toString() ?? '0') ?? 0,
      );
}

// ── Screen ────────────────────────────────────────────────────────────────────

class TvGooglePhotosPickerScreen extends StatefulWidget {
  const TvGooglePhotosPickerScreen({super.key});

  @override
  State<TvGooglePhotosPickerScreen> createState() =>
      _TvGooglePhotosPickerScreenState();
}

class _TvGooglePhotosPickerScreenState
    extends State<TvGooglePhotosPickerScreen> {
  final _signIn = GoogleSignIn(scopes: [_kPhotosScope]);

  GoogleSignInAccount? _account;
  List<_Album> _albums = [];
  _Album? _selectedAlbum;
  bool _loading = false;
  String? _error;

  // ── Sign-in ───────────────────────────────────────────────────────────────

  Future<void> _connectGooglePhotos() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final account = await _signIn.signIn();
      if (account == null) {
        setState(() => _loading = false);
        return;
      }
      _account = account;
      await _fetchAlbums(account);
    } catch (e) {
      setState(() {
        _error = 'Sign-in failed: $e';
        _loading = false;
      });
    }
  }

  Future<void> _fetchAlbums(GoogleSignInAccount account) async {
    setState(() => _loading = true);
    try {
      final auth = await account.authentication;
      final token = auth.accessToken;
      if (token == null) throw Exception('No access token');

      final response = await http.get(
        Uri.parse('https://photoslibrary.googleapis.com/v1/albums'),
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 403) {
        setState(() {
          _error =
              'Google Photos API not enabled. Enable it in Google Cloud Console for your project.';
          _loading = false;
        });
        return;
      }
      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final albums = (json['albums'] as List? ?? [])
          .cast<Map<String, dynamic>>()
          .map(_Album.fromJson)
          .toList();

      setState(() {
        _albums = albums;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load albums: $e';
        _loading = false;
      });
    }
  }

  Future<void> _selectAlbum(_Album album) async {
    setState(() {
      _selectedAlbum = album;
      _loading = true;
      _error = null;
    });
    try {
      final auth = await _account!.authentication;
      final token = auth.accessToken!;

      final response = await http.post(
        Uri.parse(
            'https://photoslibrary.googleapis.com/v1/mediaItems:search'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: jsonEncode({'albumId': album.id, 'pageSize': 50}),
      );

      if (response.statusCode != 200) {
        throw Exception('HTTP ${response.statusCode}');
      }

      final json = jsonDecode(response.body) as Map<String, dynamic>;
      final items = (json['mediaItems'] as List? ?? [])
          .cast<Map<String, dynamic>>();

      final urls = items
          .map((item) => item['baseUrl'] as String?)
          .whereType<String>()
          .toList();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('tv_google_photos_urls', jsonEncode(urls));
      await prefs.setBool('tv_google_photos_enabled', true);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  '${urls.length} photos saved. TV wallpaper will rotate every 60 seconds.')),
        );
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() {
        _error = 'Failed to load photos: $e';
        _loading = false;
      });
    }
  }

  Future<void> _disconnect() async {
    await _signIn.signOut();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('tv_google_photos_urls');
    await prefs.setBool('tv_google_photos_enabled', false);
    setState(() {
      _account = null;
      _albums = [];
      _selectedAlbum = null;
    });
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('TV Wallpaper — Google Photos'),
        actions: [
          if (_account != null)
            TextButton(
              onPressed: _disconnect,
              child: Text('Disconnect',
                  style: TextStyle(color: Colors.redAccent.withAlpha(200))),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _account == null
              ? _buildConnectView()
              : _buildAlbumGrid(),
    );
  }

  Widget _buildConnectView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.photo_library_outlined,
                size: 64, color: Colors.white.withAlpha(80)),
            const SizedBox(height: 24),
            const Text(
              'Connect Google Photos',
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: Colors.white),
            ),
            const SizedBox(height: 12),
            Text(
              'Select a photo album to use as a rotating TV wallpaper background. Photos change every 60 seconds.',
              textAlign: TextAlign.center,
              style: TextStyle(
                  color: Colors.white.withAlpha(160), fontSize: 14, height: 1.5),
            ),
            if (_error != null) ...[
              const SizedBox(height: 16),
              Text(_error!,
                  style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                  textAlign: TextAlign.center),
            ],
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: _connectGooglePhotos,
              icon: const Icon(Icons.login),
              label: const Text('Connect Google Photos'),
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.mid,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                    horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlbumGrid() {
    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(_error!,
                  style: const TextStyle(color: Colors.redAccent),
                  textAlign: TextAlign.center),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => _fetchAlbums(_account!),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_albums.isEmpty) {
      return const Center(
        child: Text('No albums found in your Google Photos.',
            style: TextStyle(color: Colors.white70)),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1,
      ),
      itemCount: _albums.length,
      itemBuilder: (context, i) {
        final album = _albums[i];
        final isSelected = _selectedAlbum?.id == album.id;
        return GestureDetector(
          onTap: () => _selectAlbum(album),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: isSelected
                    ? PrayCalcColors.light
                    : Colors.white.withAlpha(25),
                width: isSelected ? 2 : 1,
              ),
              color: Colors.white.withAlpha(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(11)),
                    child: album.coverPhotoBaseUrl != null
                        ? Image.network(
                            '${album.coverPhotoBaseUrl}=w300-h300-c',
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => Container(
                              color: Colors.white.withAlpha(15),
                              child: const Icon(Icons.photo_album_outlined,
                                  color: Colors.white54, size: 40),
                            ),
                          )
                        : Container(
                            color: Colors.white.withAlpha(15),
                            child: const Icon(Icons.photo_album_outlined,
                                color: Colors.white54, size: 40),
                          ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        album.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: isSelected
                              ? PrayCalcColors.light
                              : Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        '${album.mediaItemsCount} photos',
                        style: TextStyle(
                          color: Colors.white.withAlpha(120),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
