import 'package:flutter_test/flutter_test.dart';
import 'package:praycalc_app/shared/models/tv_settings_model.dart';

void main() {
  group('TvSettings', () {
    test('default values are correct', () {
      const settings = TvSettings();
      expect(settings.isMasjidMode, isFalse);
      expect(settings.masjidName, '');
      expect(settings.iqamahOffsets, hasLength(6));
      expect(settings.iqamahOffsets['Fajr'], 20);
      expect(settings.iqamahOffsets['Jumuah'], 30);
      expect(settings.showQrCode, isFalse);
      expect(settings.qrCodeUrl, isNull);
      expect(settings.ambientIntervalSeconds, 60);
      expect(settings.ambientIdleMinutes, 10);
      expect(settings.screensaverMode, 'photo');
      expect(settings.screensaverCategory, '');
      expect(settings.announcements, isEmpty);
    });

    test('copyWith preserves unchanged fields', () {
      const original = TvSettings(
        isMasjidMode: true,
        masjidName: 'Al-Noor Masjid',
        ambientIntervalSeconds: 45,
      );
      final updated = original.copyWith(masjidName: 'Al-Huda Masjid');
      expect(updated.isMasjidMode, isTrue);
      expect(updated.masjidName, 'Al-Huda Masjid');
      expect(updated.ambientIntervalSeconds, 45);
    });

    test('toJson and fromJson round-trip', () {
      final original = TvSettings(
        isMasjidMode: true,
        masjidName: 'Test Masjid',
        iqamahOffsets: const {'Dhuhr': 15, 'Asr': 10},
        showQrCode: true,
        qrCodeUrl: 'https://praycalc.com/test',
        ambientIntervalSeconds: 90,
        ambientIdleMinutes: 20,
        screensaverMode: 'both',
        screensaverCategory: 'masjid-exterior',
        announcements: [
          Announcement(
            id: '1',
            title: 'Jumu\'ah Khutbah',
            body: 'Starts at 1:15 PM',
          ),
        ],
      );
      final json = original.toJson();
      final restored = TvSettings.fromJson(json);
      expect(restored.isMasjidMode, isTrue);
      expect(restored.masjidName, 'Test Masjid');
      expect(restored.iqamahOffsets['Dhuhr'], 15);
      expect(restored.iqamahOffsets['Asr'], 10);
      expect(restored.showQrCode, isTrue);
      expect(restored.qrCodeUrl, 'https://praycalc.com/test');
      expect(restored.ambientIntervalSeconds, 90);
      expect(restored.ambientIdleMinutes, 20);
      expect(restored.screensaverMode, 'both');
      expect(restored.screensaverCategory, 'masjid-exterior');
      expect(restored.announcements.length, 1);
      expect(restored.announcements.first.title, 'Jumu\'ah Khutbah');
    });
  });

  group('Announcement', () {
    test('toJson and fromJson round-trip', () {
      final original = Announcement(
        id: 'abc',
        title: 'Test Event',
        body: 'Details here',
        expiresAt: DateTime(2026, 4, 1),
      );
      final json = original.toJson();
      final restored = Announcement.fromJson(json);
      expect(restored.id, 'abc');
      expect(restored.title, 'Test Event');
      expect(restored.body, 'Details here');
      expect(restored.expiresAt, DateTime(2026, 4, 1));
    });

    test('isExpired returns true for past dates', () {
      final expired = Announcement(
        id: '1',
        title: 'Old',
        body: 'Expired',
        expiresAt: DateTime(2020, 1, 1),
      );
      expect(expired.isExpired, isTrue);

      final future = Announcement(
        id: '2',
        title: 'Future',
        body: 'Not expired',
        expiresAt: DateTime(2030, 1, 1),
      );
      expect(future.isExpired, isFalse);
    });

    test('null expiresAt is never expired', () {
      const noExpiry = Announcement(
        id: '1',
        title: 'Permanent',
        body: 'No expiry',
      );
      expect(noExpiry.isExpired, isFalse);
    });
  });
}
