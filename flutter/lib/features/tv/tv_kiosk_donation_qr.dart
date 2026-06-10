import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../../core/providers/tv_provider.dart';

// ---------------------------------------------------------------------------
// Donation QR overlay widget (TV2-11.4)
// ---------------------------------------------------------------------------

/// Small corner widget showing a donation QR code.
///
/// Visibility is governed by [TvSettings.donationQrMode]:
///   - 'always'  → always shown when [donationQrUrl] is set
///   - 'jumuah'  → shown on Fridays only
///   - 'never'   → never shown (widget renders empty box)
///
/// Place inside a [Stack] and align to [Alignment.bottomRight].
class TvKioskDonationQr extends ConsumerWidget {
  const TvKioskDonationQr({super.key});

  static const _size = 120.0;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(tvSettingsProvider);
    final url = settings.donationQrUrl;
    final mode = settings.donationQrMode;

    // Nothing to show if no URL or mode is 'never'.
    if (url == null || url.isEmpty || mode == 'never') {
      return const SizedBox.shrink();
    }

    // Jumu'ah-only: hide on non-Fridays (weekday 5 = Friday in Dart).
    if (mode == 'jumuah' && DateTime.now().weekday != DateTime.friday) {
      return const SizedBox.shrink();
    }

    return _DonationQrCard(url: url);
  }
}

class _DonationQrCard extends StatelessWidget {
  const _DonationQrCard({required this.url});
  final String url;

  static const _size = TvKioskDonationQr._size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: _size,
      height: _size,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(80),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      padding: const EdgeInsets.all(8),
      child: Column(
        children: [
          Expanded(
            child: QrImageView(
              data: url,
              version: QrVersions.auto,
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
          const SizedBox(height: 4),
          const Text(
            'Donate',
            style: TextStyle(
              color: Color(0xFF0D2F17),
              fontSize: 10,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
