import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/auth_service.dart';

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
