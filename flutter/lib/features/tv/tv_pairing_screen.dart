import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:praycalc_app/l10n/app_localizations.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/providers/smart_home_provider.dart';
import '../../core/services/smart_home_api_service.dart';
import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const _kTvSessionJwt = 'tv_session_jwt';
const _kTvSessionExpiry = 'tv_session_expiry';
const _kSmartBaseUrl = 'https://smart.praycalc.com/api/v1/tv';
const _kDeviceAuthEndpoint = '$_kSmartBaseUrl/auth/device';
const _kPollEndpoint = '$_kSmartBaseUrl/auth/poll';

// ---------------------------------------------------------------------------
// TV Pairing Screen (v2, TV2-1.8)
// ---------------------------------------------------------------------------

/// Three-tab TV pairing screen.
///
/// Tab 0 — Sign In: RFC 8628 device-flow OAuth (praycalc.com/activate).
/// Tab 1 — QR Code: 6-char pairing code + QR for phone pairing.
/// Tab 2 — Guest: skip auth, choose a city and continue.
class TvPairingScreen extends ConsumerStatefulWidget {
  const TvPairingScreen({super.key});

  @override
  ConsumerState<TvPairingScreen> createState() => _TvPairingScreenState();
}

class _TvPairingScreenState extends ConsumerState<TvPairingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // ---------- Sign-In tab state ----------
  String? _userCode;
  String? _deviceCode;
  bool _isDeviceFlowLoading = false;
  bool _isPolling = false;
  bool _isSignedIn = false;
  String? _signedInEmail;
  String? _deviceFlowError;
  DateTime? _deviceCodeExpiry;
  Timer? _pollTimer;

  // ---------- QR tab state ----------
  static const _codeDuration = Duration(minutes: 5);
  static const _codeLength = 6;
  static const _codeChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  String _pairingCode = '';
  late DateTime _qrExpiresAt;
  Timer? _qrCountdownTimer;
  Timer? _qrPollTimer;
  int _qrRemainingSeconds = 0;
  bool _qrIsPaired = false;
  bool _qrIsRegistering = false;
  String? _qrError;

  // ---------- Guest tab state ----------
  final _cityController = TextEditingController();
  final _cityFocusNode = FocusNode();
  static const _sampleCities = ['Mecca', 'Medina', 'Istanbul'];

  // ---------- Device name ----------
  String _deviceName = 'My TV';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _tabController.addListener(_onTabChange);
    _fetchDeviceName();
    _startDeviceFlow();
    _generateQrCode();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _pollTimer?.cancel();
    _qrCountdownTimer?.cancel();
    _qrPollTimer?.cancel();
    _cityController.dispose();
    _cityFocusNode.dispose();
    super.dispose();
  }

  void _onTabChange() {
    // Ensure tab transitions are smooth with D-pad navigation.
    setState(() {});
  }

  // ---------------------------------------------------------------------------
  // Device name (TV2-1.12)
  // ---------------------------------------------------------------------------

  Future<void> _fetchDeviceName() async {
    final name = await _getDeviceName();
    if (mounted) setState(() => _deviceName = name);
  }

  Future<String> _getDeviceName() async {
    const platform =
        MethodChannel('com.praycalc.praycalc_app/device_info');
    try {
      final name = await platform.invokeMethod<String>('getDeviceName');
      return name ?? 'My TV';
    } catch (_) {
      return 'My TV';
    }
  }

  // ---------------------------------------------------------------------------
  // Session persistence (TV2-1.9)
  // ---------------------------------------------------------------------------

  Future<void> _saveSession(String jwt, DateTime expiry) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_kTvSessionJwt, jwt);
    await prefs.setString(_kTvSessionExpiry, expiry.toIso8601String());
  }

  // ---------------------------------------------------------------------------
  // Tab 0: Device-flow OAuth (RFC 8628)
  // ---------------------------------------------------------------------------

  Future<void> _startDeviceFlow() async {
    if (_isDeviceFlowLoading) return;
    setState(() {
      _isDeviceFlowLoading = true;
      _deviceFlowError = null;
      _userCode = null;
      _deviceCode = null;
      _isSignedIn = false;
      _signedInEmail = null;
    });

    try {
      final resp = await http
          .post(
            Uri.parse(_kDeviceAuthEndpoint),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'device_name': _deviceName}),
          )
          .timeout(const Duration(seconds: 15));

      if (resp.statusCode != 200) {
        throw Exception('Server returned ${resp.statusCode}');
      }

      final body = jsonDecode(resp.body) as Map<String, dynamic>;
      final expiresIn = (body['expires_in'] as num?)?.toInt() ?? 300;

      setState(() {
        _userCode = body['user_code'] as String? ?? '----';
        _deviceCode = body['device_code'] as String?;
        _deviceCodeExpiry =
            DateTime.now().add(Duration(seconds: expiresIn));
        _isDeviceFlowLoading = false;
      });

      _startPolling();
    } catch (e) {
      if (mounted) {
        setState(() {
          _isDeviceFlowLoading = false;
          _deviceFlowError = 'Could not reach server. Check your connection.';
        });
      }
    }
  }

  void _startPolling() {
    _pollTimer?.cancel();
    _isPolling = true;
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) async {
      if (!_isPolling || _deviceCode == null) return;
      final expiry = _deviceCodeExpiry;
      if (expiry != null && DateTime.now().isAfter(expiry)) {
        _pollTimer?.cancel();
        if (mounted) {
          setState(() {
            _isPolling = false;
            _userCode = null; // triggers expired UI
          });
        }
        return;
      }

      try {
        final resp = await http
            .get(
              Uri.parse('$_kPollEndpoint?code=${Uri.encodeComponent(_deviceCode!)}'),
              headers: {'Content-Type': 'application/json'},
            )
            .timeout(const Duration(seconds: 10));

        if (resp.statusCode == 200) {
          final body = jsonDecode(resp.body) as Map<String, dynamic>;
          final status = body['status'] as String?;
          if (status == 'authorized') {
            _pollTimer?.cancel();
            final jwt = body['access_token'] as String? ?? '';
            final email = body['email'] as String? ?? '';
            final expiresIn =
                (body['expires_in'] as num?)?.toInt() ?? 86400;
            final expiry =
                DateTime.now().add(Duration(seconds: expiresIn));
            await _saveSession(jwt, expiry);
            if (mounted) {
              setState(() {
                _isPolling = false;
                _isSignedIn = true;
                _signedInEmail = email;
              });
              // Navigate to TV home after 2 seconds.
              Future.delayed(const Duration(seconds: 2), () {
                if (mounted) context.go('/tv');
              });
            }
          }
          // status == 'pending' → keep polling
        }
      } catch (_) {
        // Silently continue polling.
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Tab 1: QR pairing code
  // ---------------------------------------------------------------------------

  Future<void> _generateQrCode() async {
    final random = Random.secure();
    final code = List.generate(
      _codeLength,
      (_) => _codeChars[random.nextInt(_codeChars.length)],
    ).join();

    setState(() {
      _pairingCode = code;
      _qrExpiresAt = DateTime.now().add(_codeDuration);
      _qrRemainingSeconds = _codeDuration.inSeconds;
      _qrIsPaired = false;
      _qrIsRegistering = true;
      _qrError = null;
    });

    _qrCountdownTimer?.cancel();
    _qrCountdownTimer =
        Timer.periodic(const Duration(seconds: 1), (_) {
      final remaining =
          _qrExpiresAt.difference(DateTime.now()).inSeconds;
      if (remaining <= 0) {
        _qrCountdownTimer?.cancel();
        _qrPollTimer?.cancel();
        if (mounted) setState(() => _qrRemainingSeconds = 0);
      } else {
        if (mounted) setState(() => _qrRemainingSeconds = remaining);
      }
    });

    try {
      await SmartHomeApiService.instance.addDevice(
        name: 'TV (${_formatQrCode(code)})',
        type: 'tv',
        pairingCode: code,
      );
      if (mounted) setState(() => _qrIsRegistering = false);
      _startQrPolling();
    } on SmartHomeApiException catch (e) {
      if (mounted) {
        setState(() {
          _qrIsRegistering = false;
          _qrError = e.message;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _qrIsRegistering = false);
    }
  }

  void _startQrPolling() {
    _qrPollTimer?.cancel();
    _qrPollTimer =
        Timer.periodic(const Duration(seconds: 5), (_) async {
      if (_qrIsPaired || _qrRemainingSeconds <= 0) {
        _qrPollTimer?.cancel();
        return;
      }
      try {
        final devices =
            await SmartHomeApiService.instance.getDevices();
        final tvDevice = devices.where(
          (d) =>
              d.type == 'tv' &&
              d.name.contains(_formatQrCode(_pairingCode)),
        );
        if (tvDevice.isNotEmpty && tvDevice.first.online) {
          _qrPollTimer?.cancel();
          ref.read(devicesProvider.notifier).load();
          if (mounted) setState(() => _qrIsPaired = true);
        }
      } catch (_) {
        // Silently continue.
      }
    });
  }

  String get _qrFormattedTime {
    final m = _qrRemainingSeconds ~/ 60;
    final s = _qrRemainingSeconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  String _formatQrCode(String code) {
    if (code.length != _codeLength) return code;
    return '${code.substring(0, 3)}-${code.substring(3)}';
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: _buildAppBar(context),
      body: Column(
        children: [
          _buildTabBar(),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildSignInTab(),
                _buildQrTab(),
                _buildGuestTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  AppBar _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: PrayCalcColors.deep,
      foregroundColor: Colors.white,
      title: const Text(
        'Connect to PrayCalc',
        style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
      ),
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, size: 32),
        onPressed: () => context.pop(),
      ),
    );
  }

  Widget _buildTabBar() {
    return Container(
      color: PrayCalcColors.surface,
      child: TabBar(
        controller: _tabController,
        labelColor: PrayCalcColors.light,
        unselectedLabelColor: Colors.white54,
        indicatorColor: PrayCalcColors.mid,
        indicatorWeight: 3,
        labelStyle: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w600,
        ),
        tabs: const [
          Tab(icon: Icon(Icons.login, size: 28), text: 'Sign In'),
          Tab(icon: Icon(Icons.qr_code, size: 28), text: 'QR Code'),
          Tab(icon: Icon(Icons.person_outline, size: 28), text: 'Guest'),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Tab 0: Sign In (device flow)
  // ---------------------------------------------------------------------------

  Widget _buildSignInTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: _isSignedIn
              ? _buildSignedInState()
              : _buildDeviceFlowState(),
        ),
      ),
    );
  }

  Widget _buildSignedInState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(Icons.check_circle, color: PrayCalcColors.mid, size: 96),
        const SizedBox(height: 24),
        Text(
          'Signed in as $_signedInEmail',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        const Text(
          'Taking you to your prayer times...',
          style: TextStyle(color: Colors.white54, fontSize: 20),
        ),
      ],
    );
  }

  Widget _buildDeviceFlowState() {
    if (_isDeviceFlowLoading) {
      return const Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(height: 60),
          CircularProgressIndicator(color: PrayCalcColors.mid),
          SizedBox(height: 24),
          Text(
            'Generating sign-in code...',
            style: TextStyle(color: Colors.white54, fontSize: 22),
          ),
        ],
      );
    }

    if (_deviceFlowError != null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          const Icon(Icons.wifi_off, color: Colors.red, size: 64),
          const SizedBox(height: 16),
          Text(
            _deviceFlowError!,
            style: const TextStyle(color: Colors.red, fontSize: 20),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 32),
          _focusableButton(
            icon: Icons.refresh,
            label: 'Try Again',
            onPressed: _startDeviceFlow,
          ),
        ],
      );
    }

    final isExpired = _deviceCode != null &&
        _deviceCodeExpiry != null &&
        DateTime.now().isAfter(_deviceCodeExpiry!);
    final userCode = _userCode;

    if (isExpired || userCode == null) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          const Icon(Icons.timer_off, color: Colors.orange, size: 64),
          const SizedBox(height: 16),
          const Text(
            'Code expired',
            style: TextStyle(color: Colors.orange, fontSize: 24),
          ),
          const SizedBox(height: 32),
          _focusableButton(
            icon: Icons.refresh,
            label: 'Generate new code',
            onPressed: _startDeviceFlow,
          ),
        ],
      );
    }

    return Column(
      children: [
        // Step 1: URL
        const Text(
          'Step 1: On your phone or computer, go to:',
          style: TextStyle(color: Colors.white70, fontSize: 20),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          decoration: BoxDecoration(
            color: PrayCalcColors.dark,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Text(
            'praycalc.com/activate',
            style: TextStyle(
              color: PrayCalcColors.light,
              fontSize: 36,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.5,
            ),
          ),
        ),
        const SizedBox(height: 32),

        // Step 2: user code
        const Text(
          'Step 2: Enter this code:',
          style: TextStyle(color: Colors.white70, fontSize: 20),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 20),
          decoration: BoxDecoration(
            color: PrayCalcColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: PrayCalcColors.mid, width: 2),
          ),
          child: Text(
            userCode,
            style: const TextStyle(
              color: PrayCalcColors.light,
              fontSize: 52,
              fontWeight: FontWeight.bold,
              letterSpacing: 10,
              fontFamily: 'monospace',
            ),
          ),
        ),
        const SizedBox(height: 32),

        // Waiting indicator
        if (_isPolling) ...[
          const Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white54,
                ),
              ),
              SizedBox(width: 12),
              Text(
                'Waiting for authorization...',
                style: TextStyle(color: Colors.white54, fontSize: 20),
              ),
            ],
          ),
          const SizedBox(height: 24),
        ],

        _focusableButton(
          icon: Icons.refresh,
          label: 'Generate new code',
          onPressed: _startDeviceFlow,
          outlined: true,
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Tab 1: QR Code
  // ---------------------------------------------------------------------------

  Widget _buildQrTab() {
    final l = AppLocalizations.of(context)!;
    final isExpired = _qrRemainingSeconds <= 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: _qrIsPaired
              ? _buildQrPairedState(l)
              : _buildQrPairingState(isExpired),
        ),
      ),
    );
  }

  Widget _buildQrPairedState(AppLocalizations l) {
    return Column(
      children: [
        const Icon(Icons.check_circle, color: PrayCalcColors.mid, size: 80),
        const SizedBox(height: 24),
        Text(
          l.smartHomePairTvSuccess,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 32,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'Your TV is now connected to your account.',
          style: TextStyle(color: Colors.white54, fontSize: 20),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 32),
        _focusableButton(
          icon: Icons.check,
          label: 'Done',
          onPressed: () => context.pop(),
        ),
      ],
    );
  }

  Widget _buildQrPairingState(bool isExpired) {
    return Column(
      children: [
        const Text(
          'To pair this TV with your phone:',
          style: TextStyle(color: Colors.white70, fontSize: 22),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          '1. Open PrayCalc on your phone\n'
          '2. Go to Settings > TV Display\n'
          '3. Tap "Pair a TV" and enter the code below',
          style: TextStyle(color: Colors.white54, fontSize: 18),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 40),

        // QR code
        Container(
          width: 220,
          height: 220,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.all(16),
          child: QrImageView(
            data: 'praycalc://pair?code=$_pairingCode',
            version: QrVersions.auto,
            size: 188,
            backgroundColor: Colors.white,
            eyeStyle: const QrEyeStyle(
              eyeShape: QrEyeShape.square,
              color: Color(0xFF0D2F17),
            ),
            dataModuleStyle: const QrDataModuleStyle(
              dataModuleShape: QrDataModuleShape.square,
              color: Color(0xFF0D2F17),
            ),
          ),
        ),
        const SizedBox(height: 32),

        // Pairing code
        const Text(
          'Or enter this code:',
          style: TextStyle(color: Colors.white54, fontSize: 18),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          decoration: BoxDecoration(
            color: PrayCalcColors.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isExpired ? Colors.red.withAlpha(100) : PrayCalcColors.mid,
              width: 2,
            ),
          ),
          child: Text(
            isExpired ? 'EXPIRED' : _formatQrCode(_pairingCode),
            style: TextStyle(
              color: isExpired ? Colors.red[300] : PrayCalcColors.light,
              fontSize: 48,
              fontWeight: FontWeight.bold,
              letterSpacing: 8,
              fontFamily: 'monospace',
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Registration status
        if (_qrIsRegistering)
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: Colors.white54,
                  ),
                ),
                SizedBox(width: 8),
                Text(
                  'Registering with server...',
                  style: TextStyle(color: Colors.white54, fontSize: 14),
                ),
              ],
            ),
          ),
        if (_qrError != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Text(
              _qrError!,
              style: TextStyle(color: Colors.red[300], fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ),

        // Timer
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isExpired ? Icons.timer_off : Icons.timer,
              color: isExpired ? Colors.red[300] : Colors.white54,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              isExpired ? 'Code expired' : 'Expires in $_qrFormattedTime',
              style: TextStyle(
                color: isExpired ? Colors.red[300] : Colors.white54,
                fontSize: 18,
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),

        _focusableButton(
          icon: Icons.refresh,
          label: isExpired ? 'Generate new code' : 'New code',
          onPressed: _generateQrCode,
          outlined: true,
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Tab 2: Guest mode (TV2-1.11)
  // ---------------------------------------------------------------------------

  Widget _buildGuestTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 64, vertical: 40),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(
                Icons.person_outline,
                color: PrayCalcColors.mid,
                size: 72,
              ),
              const SizedBox(height: 20),
              const Text(
                'Continue as Guest',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Limited to one city. Settings are not synced across devices.',
                style: TextStyle(color: Colors.white54, fontSize: 20),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),

              // Quick-select city chips
              const Text(
                'Quick select a city:',
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 12,
                runSpacing: 8,
                alignment: WrapAlignment.center,
                children: _sampleCities
                    .map((city) => _buildCityChip(city))
                    .toList(),
              ),
              const SizedBox(height: 28),

              // City text field
              const Text(
                'Or type your city:',
                style: TextStyle(color: Colors.white70, fontSize: 18),
              ),
              const SizedBox(height: 12),
              Focus(
                onKeyEvent: (node, event) {
                  if (event is KeyDownEvent &&
                      event.logicalKey == LogicalKeyboardKey.arrowDown) {
                    // Move focus to the Continue button below.
                    node.nextFocus();
                    return KeyEventResult.handled;
                  }
                  return KeyEventResult.ignored;
                },
                child: TextField(
                  controller: _cityController,
                  focusNode: _cityFocusNode,
                  style: const TextStyle(color: Colors.white, fontSize: 22),
                  cursorColor: PrayCalcColors.light,
                  decoration: InputDecoration(
                    hintText: 'e.g. Cairo',
                    hintStyle: const TextStyle(color: Colors.white38),
                    filled: true,
                    fillColor: PrayCalcColors.surface,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 20, vertical: 16),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: PrayCalcColors.dark),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(
                          color: PrayCalcColors.mid, width: 2),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          const BorderSide(color: PrayCalcColors.dark),
                    ),
                  ),
                  onSubmitted: (_) => _continueAsGuest(),
                ),
              ),
              const SizedBox(height: 32),

              _focusableButton(
                icon: Icons.arrow_forward,
                label: 'Continue',
                onPressed: _continueAsGuest,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCityChip(String city) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          _selectCity(city);
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (ctx) {
        final hasFocus = Focus.of(ctx).hasFocus;
        return GestureDetector(
          onTap: () => _selectCity(city),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding:
                const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            decoration: BoxDecoration(
              color: hasFocus ? PrayCalcColors.dark : PrayCalcColors.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: hasFocus ? PrayCalcColors.light : PrayCalcColors.dark,
                width: hasFocus ? 2 : 1,
              ),
            ),
            child: Text(
              city,
              style: TextStyle(
                color:
                    hasFocus ? PrayCalcColors.light : Colors.white70,
                fontSize: 20,
                fontWeight:
                    hasFocus ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ),
        );
      }),
    );
  }

  void _selectCity(String city) {
    _cityController.text = city;
    setState(() {});
  }

  void _continueAsGuest() {
    // City persistence is handled by the settings flow on the /tv screen
    // (guest city is passed as a query parameter for the initial location lookup).
    final city = _cityController.text.trim();
    if (city.isNotEmpty) {
      context.go('/tv', extra: {'guestCity': city});
    } else {
      context.go('/tv');
    }
  }

  // ---------------------------------------------------------------------------
  // Shared focusable button helper (D-pad accessible)
  // ---------------------------------------------------------------------------

  Widget _focusableButton({
    required IconData icon,
    required String label,
    required VoidCallback onPressed,
    bool outlined = false,
  }) {
    return Focus(
      onKeyEvent: (node, event) {
        if (event is KeyDownEvent &&
            (event.logicalKey == LogicalKeyboardKey.select ||
                event.logicalKey == LogicalKeyboardKey.enter)) {
          onPressed();
          return KeyEventResult.handled;
        }
        return KeyEventResult.ignored;
      },
      child: Builder(builder: (ctx) {
        final hasFocus = Focus.of(ctx).hasFocus;
        if (outlined) {
          return OutlinedButton.icon(
            onPressed: onPressed,
            icon: Icon(icon, size: 24),
            label: Text(label, style: const TextStyle(fontSize: 20)),
            style: OutlinedButton.styleFrom(
              foregroundColor:
                  hasFocus ? PrayCalcColors.light : Colors.white70,
              side: BorderSide(
                color: hasFocus ? PrayCalcColors.mid : Colors.white24,
                width: hasFocus ? 2 : 1,
              ),
              minimumSize: const Size(200, 52),
            ),
          );
        }
        return FilledButton.icon(
          onPressed: onPressed,
          icon: Icon(icon, size: 24),
          label: Text(label, style: const TextStyle(fontSize: 20)),
          style: FilledButton.styleFrom(
            backgroundColor:
                hasFocus ? PrayCalcColors.mid : PrayCalcColors.dark,
            foregroundColor: Colors.white,
            minimumSize: const Size(200, 56),
          ),
        );
      }),
    );
  }
}
