import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/smart_home_api_service.dart';

// ─── Integrations state ──────────────────────────────────────────────────────

class IntegrationsState {
  final List<SmartHomeIntegration> integrations;
  final bool isLoading;
  final String? error;
  final Map<String, bool?> testResults; // platform -> pass/fail/null

  const IntegrationsState({
    this.integrations = const [],
    this.isLoading = false,
    this.error,
    this.testResults = const {},
  });

  IntegrationsState copyWith({
    List<SmartHomeIntegration>? integrations,
    bool? isLoading,
    String? error,
    Map<String, bool?>? testResults,
  }) {
    return IntegrationsState(
      integrations: integrations ?? this.integrations,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      testResults: testResults ?? this.testResults,
    );
  }

  SmartHomeIntegration? forPlatform(String platform) {
    try {
      return integrations.firstWhere((i) => i.platform == platform);
    } catch (_) {
      return null;
    }
  }

  bool isConnected(String platform) =>
      forPlatform(platform)?.connected ?? false;
}

class IntegrationsNotifier extends Notifier<IntegrationsState> {
  @override
  IntegrationsState build() {
    Future.microtask(load);
    return const IntegrationsState(isLoading: true);
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await SmartHomeApiService.instance.getIntegrations();
      state = state.copyWith(integrations: list, isLoading: false);
    } on SmartHomeApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Could not connect to the smart home service.',
      );
    }
  }

  Future<void> unlink(String platform) async {
    try {
      await SmartHomeApiService.instance.updateIntegration(
        action: 'unlink',
        platform: platform,
      );
      await load();
    } catch (_) {
      // Silently fail; user can retry.
    }
  }

  Future<bool> testConnection(String platform) async {
    final tests = Map<String, bool?>.from(state.testResults);
    tests[platform] = null; // null = testing in progress
    state = state.copyWith(testResults: tests);

    try {
      final ok = await SmartHomeApiService.instance.testIntegration(platform);
      tests[platform] = ok;
      state = state.copyWith(testResults: tests);
      return ok;
    } catch (_) {
      tests[platform] = false;
      state = state.copyWith(testResults: tests);
      return false;
    }
  }

  void clearTestResult(String platform) {
    final tests = Map<String, bool?>.from(state.testResults);
    tests.remove(platform);
    state = state.copyWith(testResults: tests);
  }
}

final integrationsProvider =
    NotifierProvider<IntegrationsNotifier, IntegrationsState>(
  IntegrationsNotifier.new,
);

// ─── Devices state ───────────────────────────────────────────────────────────

class DevicesState {
  final List<SmartHomeDevice> devices;
  final bool isLoading;
  final String? error;

  const DevicesState({
    this.devices = const [],
    this.isLoading = false,
    this.error,
  });

  DevicesState copyWith({
    List<SmartHomeDevice>? devices,
    bool? isLoading,
    String? error,
  }) {
    return DevicesState(
      devices: devices ?? this.devices,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class DevicesNotifier extends Notifier<DevicesState> {
  @override
  DevicesState build() {
    Future.microtask(load);
    return const DevicesState(isLoading: true);
  }

  Future<void> load() async {
    state = state.copyWith(isLoading: true, error: null);
    try {
      final list = await SmartHomeApiService.instance.getDevices();
      state = state.copyWith(devices: list, isLoading: false);
    } on SmartHomeApiException catch (e) {
      state = state.copyWith(isLoading: false, error: e.message);
    } catch (_) {
      state = state.copyWith(
        isLoading: false,
        error: 'Could not connect to the device service.',
      );
    }
  }

  Future<SmartHomeDevice?> addDevice({
    required String name,
    required String type,
    String? pairingCode,
  }) async {
    try {
      final device = await SmartHomeApiService.instance.addDevice(
        name: name,
        type: type,
        pairingCode: pairingCode,
      );
      await load();
      return device;
    } on SmartHomeApiException catch (e) {
      state = state.copyWith(error: e.message);
      return null;
    } catch (_) {
      state = state.copyWith(error: 'Failed to add device.');
      return null;
    }
  }

  Future<bool> deleteDevice(String id) async {
    try {
      await SmartHomeApiService.instance.deleteDevice(id);
      await load();
      return true;
    } on SmartHomeApiException catch (e) {
      state = state.copyWith(error: e.message);
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<bool> updateDeviceSettings({
    required String id,
    bool? adhanEnabled,
    int? volumeLevel,
    int? audioType,
    List<String>? enabledPrayers,
  }) async {
    try {
      await SmartHomeApiService.instance.updateDevice(
        id: id,
        adhanEnabled: adhanEnabled,
        volumeLevel: volumeLevel,
        audioType: audioType,
        enabledPrayers: enabledPrayers,
      );
      // Optimistically update local state.
      final updated = state.devices.map((d) {
        if (d.id != id) return d;
        return d.copyWith(
          adhanEnabled: adhanEnabled,
          volumeLevel: volumeLevel,
          audioType: audioType,
          enabledPrayers: enabledPrayers,
        );
      }).toList();
      state = state.copyWith(devices: updated);
      return true;
    } on SmartHomeApiException catch (e) {
      state = state.copyWith(error: e.message);
      return false;
    } catch (_) {
      return false;
    }
  }
}

final devicesProvider = NotifierProvider<DevicesNotifier, DevicesState>(
  DevicesNotifier.new,
);
