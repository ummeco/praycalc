import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:crypto/crypto.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../services/auth_service.dart';

String _generateNonce([int length = 32]) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  final rng = Random.secure();
  return List.generate(length, (_) => chars[rng.nextInt(chars.length)]).join();
}

String _sha256ofString(String input) {
  final bytes = utf8.encode(input);
  final digest = sha256.convert(bytes);
  return digest.toString();
}

/// Auth state exposed to the UI.
class AuthData {
  final AuthUser? user;
  final bool isAuthenticated;
  final bool isLoading;
  final String? error;

  const AuthData({
    this.user,
    this.isAuthenticated = false,
    this.isLoading = false,
    this.error,
  });

  AuthData copyWith({
    AuthUser? user,
    bool? isAuthenticated,
    bool? isLoading,
    String? error,
  }) =>
      AuthData(
        user: user ?? this.user,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

/// Riverpod notifier managing auth state.
///
/// Listens to [AuthService.authStateChanges] and exposes sign-in, sign-up,
/// and sign-out methods. Initializes the auth service on first build.
class AuthNotifier extends Notifier<AuthData> {
  StreamSubscription<AuthState>? _sub;

  @override
  AuthData build() {
    _init();
    ref.onDispose(() => _sub?.cancel());
    return const AuthData(isLoading: true);
  }

  Future<void> _init() async {
    final auth = AuthService.instance;
    _sub = auth.authStateChanges.listen((authState) {
      switch (authState) {
        case AuthState.authenticated:
          state = AuthData(
            user: auth.currentUser,
            isAuthenticated: true,
          );
        case AuthState.unauthenticated:
          state = const AuthData();
        case AuthState.loading:
          state = state.copyWith(isLoading: true);
      }
    });

    await auth.init();
  }

  /// Sign in with email/password.
  Future<bool> signIn({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await AuthService.instance.signIn(email: email, password: password);
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Connection failed. Check your internet.',
      );
      return false;
    }
  }

  /// Sign up with email/password.
  Future<bool> signUp({
    required String email,
    required String password,
    String? displayName,
  }) async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      await AuthService.instance.signUp(
        email: email,
        password: password,
        displayName: displayName,
      );
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Connection failed. Check your internet.',
      );
      return false;
    }
  }

  /// Sign out and clear local credentials.
  Future<void> signOut() async {
    state = state.copyWith(isLoading: true, error: null);
    await AuthService.instance.signOut();
  }

  /// Sign in with Apple (iOS native flow).
  Future<bool> signInWithApple() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final rawNonce = _generateNonce();
      final nonce = _sha256ofString(rawNonce);

      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [
          AppleIDAuthorizationScopes.email,
          AppleIDAuthorizationScopes.fullName,
        ],
        nonce: nonce,
      );

      final idToken = credential.identityToken;
      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: 'Apple sign in failed');
        return false;
      }

      final displayName = [credential.givenName, credential.familyName]
          .where((s) => s != null && s.isNotEmpty)
          .join(' ');

      await AuthService.instance.signInWithAppleIdToken(
        idToken: idToken,
        rawNonce: rawNonce,
        displayName: displayName.isEmpty ? null : displayName,
      );
      return true;
    } on SignInWithAppleAuthorizationException catch (e) {
      // User cancelled — not an error
      if (e.code == AuthorizationErrorCode.canceled) {
        state = state.copyWith(isLoading: false);
      } else {
        state = state.copyWith(isLoading: false, error: 'Apple sign in failed');
      }
      return false;
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Apple sign in failed');
      return false;
    }
  }

  /// Sign in with Google (cross-platform native flow).
  Future<bool> signInWithGoogle() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      const clientId = String.fromEnvironment('GOOGLE_CLIENT_ID');
      final googleSignIn = GoogleSignIn(
        scopes: ['email'],
        clientId: clientId.isEmpty ? null : clientId,
      );

      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled
        state = state.copyWith(isLoading: false);
        return false;
      }

      final auth = await googleUser.authentication;
      final idToken = auth.idToken;
      if (idToken == null) {
        state = state.copyWith(isLoading: false, error: 'Google sign in failed');
        return false;
      }

      await AuthService.instance.signInWithGoogleIdToken(
        idToken: idToken,
        accessToken: auth.accessToken,
      );
      return true;
    } on AuthException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
      return false;
    } catch (_) {
      state = state.copyWith(isLoading: false, error: 'Google sign in failed');
      return false;
    }
  }

  /// Clear any displayed error.
  void clearError() {
    if (state.error != null) {
      state = state.copyWith(error: null);
    }
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthData>(
  AuthNotifier.new,
);
