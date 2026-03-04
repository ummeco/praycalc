import 'dart:async';
import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

/// Auth URLs injected at build time via --dart-define.
/// Defaults point to the local Hasura Auth running on the shared backend.
const _kAuthUrl = String.fromEnvironment(
  'HASURA_AUTH_URL',
  defaultValue: 'http://127.0.0.1:8087',
);

/// User info returned by the auth service.
class AuthUser {
  final String id;
  final String email;
  final String? displayName;
  final String? avatarUrl;
  final DateTime? createdAt;

  const AuthUser({
    required this.id,
    required this.email,
    this.displayName,
    this.avatarUrl,
    this.createdAt,
  });

  String get initials {
    final name = displayName ?? email.split('@').first.replaceAll(RegExp(r'[._-]+'), ' ');
    final parts = name.split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return name.length >= 2 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
  }

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final user = json['user'] as Map<String, dynamic>? ?? json;
    return AuthUser(
      id: user['id'] as String? ?? '',
      email: user['email'] as String? ?? '',
      displayName: user['displayName'] as String?,
      avatarUrl: user['avatarUrl'] as String?,
      createdAt: user['createdAt'] != null
          ? DateTime.tryParse(user['createdAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        'displayName': displayName,
        'avatarUrl': avatarUrl,
        'createdAt': createdAt?.toIso8601String(),
      };
}

/// Session data: tokens + user info.
class AuthSession {
  final String accessToken;
  final String refreshToken;
  final int accessTokenExpiresIn; // seconds
  final AuthUser user;

  const AuthSession({
    required this.accessToken,
    required this.refreshToken,
    required this.accessTokenExpiresIn,
    required this.user,
  });

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    final session = json['session'] as Map<String, dynamic>? ?? json;
    return AuthSession(
      accessToken: session['accessToken'] as String? ?? '',
      refreshToken: session['refreshToken'] as String? ?? '',
      accessTokenExpiresIn: session['accessTokenExpiresIn'] as int? ?? 900,
      user: AuthUser.fromJson(session['user'] as Map<String, dynamic>? ?? json),
    );
  }
}

/// Auth state emitted by [AuthService.authStateChanges].
enum AuthState { authenticated, unauthenticated, loading }

/// Hasura Auth client for Flutter.
///
/// Handles email/password sign-in, sign-up, sign-out, token storage
/// via [FlutterSecureStorage], and JWT refresh.
class AuthService {
  AuthService._();
  static final instance = AuthService._();

  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _accessTokenKey = 'pc_access_token';
  static const _refreshTokenKey = 'pc_refresh_token';
  static const _userKey = 'pc_auth_user';

  final _authStateController = StreamController<AuthState>.broadcast();
  Stream<AuthState> get authStateChanges => _authStateController.stream;

  AuthUser? _currentUser;
  AuthUser? get currentUser => _currentUser;

  String? _accessToken;
  String? get accessToken => _accessToken;

  String? _refreshToken;

  Timer? _refreshTimer;

  bool get isAuthenticated => _accessToken != null && _currentUser != null;

  /// Initialize the service: load stored tokens and attempt a refresh.
  Future<void> init() async {
    _authStateController.add(AuthState.loading);

    _accessToken = await _storage.read(key: _accessTokenKey);
    _refreshToken = await _storage.read(key: _refreshTokenKey);

    final userJson = await _storage.read(key: _userKey);
    if (userJson != null) {
      try {
        _currentUser = AuthUser.fromJson(
          jsonDecode(userJson) as Map<String, dynamic>,
        );
      } catch (_) {
        _currentUser = null;
      }
    }

    if (_refreshToken != null) {
      try {
        await refreshSession();
      } catch (_) {
        // Refresh failed, clear stored state.
        await _clearStored();
      }
    }

    _authStateController.add(
      isAuthenticated ? AuthState.authenticated : AuthState.unauthenticated,
    );
  }

  /// Sign in with email and password.
  Future<AuthUser> signIn({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_kAuthUrl/signin/email-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode != 200) {
      final body = _parseBody(response);
      throw AuthException(
        body['message'] as String? ?? 'Sign in failed (${response.statusCode})',
      );
    }

    final session = AuthSession.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
    await _persistSession(session);
    return session.user;
  }

  /// Sign up with email and password.
  Future<AuthUser> signUp({
    required String email,
    required String password,
    String? displayName,
  }) async {
    final body = <String, dynamic>{
      'email': email,
      'password': password,
    };
    if (displayName != null && displayName.isNotEmpty) {
      body['options'] = {
        'displayName': displayName,
      };
    }

    final response = await http.post(
      Uri.parse('$_kAuthUrl/signup/email-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode != 200) {
      final parsed = _parseBody(response);
      throw AuthException(
        parsed['message'] as String? ?? 'Sign up failed (${response.statusCode})',
      );
    }

    final session = AuthSession.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
    await _persistSession(session);
    return session.user;
  }

  /// Sign out and clear all stored credentials.
  Future<void> signOut() async {
    if (_accessToken != null) {
      try {
        await http.post(
          Uri.parse('$_kAuthUrl/signout'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $_accessToken',
          },
        );
      } catch (_) {
        // Best-effort server-side signout.
      }
    }

    await _clearStored();
    _authStateController.add(AuthState.unauthenticated);
  }

  /// Refresh the access token using the stored refresh token.
  Future<void> refreshSession() async {
    if (_refreshToken == null) {
      throw AuthException('No refresh token available');
    }

    final response = await http.post(
      Uri.parse('$_kAuthUrl/token'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'refreshToken': _refreshToken}),
    );

    if (response.statusCode != 200) {
      await _clearStored();
      _authStateController.add(AuthState.unauthenticated);
      throw AuthException('Token refresh failed');
    }

    final session = AuthSession.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
    await _persistSession(session);
  }

  /// Request a password reset email.
  Future<void> resetPassword(String email) async {
    final response = await http.post(
      Uri.parse('$_kAuthUrl/user/password/reset'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );

    if (response.statusCode != 200) {
      final body = _parseBody(response);
      throw AuthException(
        body['message'] as String? ?? 'Password reset failed',
      );
    }
  }

  /// Delete the current user's account.
  Future<void> deleteAccount() async {
    if (_accessToken == null) {
      throw AuthException('Not authenticated');
    }

    final response = await http.post(
      Uri.parse('$_kAuthUrl/user/delete'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_accessToken',
      },
    );

    if (response.statusCode != 200) {
      final body = _parseBody(response);
      throw AuthException(
        body['message'] as String? ?? 'Account deletion failed',
      );
    }

    await _clearStored();
    _authStateController.add(AuthState.unauthenticated);
  }

  // ── Internal helpers ─────────────────────────────────────────────────────

  Future<void> _persistSession(AuthSession session) async {
    _accessToken = session.accessToken;
    _refreshToken = session.refreshToken;
    _currentUser = session.user;

    await _storage.write(key: _accessTokenKey, value: session.accessToken);
    await _storage.write(key: _refreshTokenKey, value: session.refreshToken);
    await _storage.write(key: _userKey, value: jsonEncode(session.user.toJson()));

    _scheduleRefresh(session.accessTokenExpiresIn);
    _authStateController.add(AuthState.authenticated);
  }

  Future<void> _clearStored() async {
    _accessToken = null;
    _refreshToken = null;
    _currentUser = null;
    _refreshTimer?.cancel();
    _refreshTimer = null;

    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }

  void _scheduleRefresh(int expiresInSeconds) {
    _refreshTimer?.cancel();
    // Refresh 60 seconds before expiry, minimum 10 seconds.
    final refreshIn = Duration(
      seconds: (expiresInSeconds - 60).clamp(10, expiresInSeconds),
    );
    _refreshTimer = Timer(refreshIn, () async {
      try {
        await refreshSession();
      } catch (_) {
        // Token refresh failed. User will need to re-authenticate.
      }
    });
  }

  Map<String, dynamic> _parseBody(http.Response response) {
    try {
      return jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      return <String, dynamic>{};
    }
  }

  /// Dispose resources. Call when the app is shutting down.
  void dispose() {
    _refreshTimer?.cancel();
    _authStateController.close();
  }
}

/// Exception thrown by [AuthService] operations.
class AuthException implements Exception {
  final String message;
  const AuthException(this.message);

  @override
  String toString() => 'AuthException: $message';
}
