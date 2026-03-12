// Adhan voice definitions — 9 built-in voices + custom slot.
//
// Each voice has:
//   id         — stable key stored in SharedPreferences
//   name       — English display name
//   nameAr     — Arabic display name
//   previewUrl — short MP3 for preview (everyayah.com Al-Fatiha first ayah)
//   isCustom   — true only for the user-recorded custom slot

import 'package:flutter/foundation.dart';

@immutable
class AdhanVoice {
  final String id;
  final String name;
  final String nameAr;
  final String previewUrl;
  final bool isCustom;

  const AdhanVoice({
    required this.id,
    required this.name,
    required this.nameAr,
    required this.previewUrl,
    this.isCustom = false,
  });
}

const List<AdhanVoice> kBuiltInAdhanVoices = [
  AdhanVoice(
    id: 'makkah',
    name: 'Makkah',
    nameAr: 'مكة المكرمة',
    previewUrl: 'https://everyayah.com/data/Sudais_192kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'madinah',
    name: 'Madinah',
    nameAr: 'المدينة المنورة',
    previewUrl: 'https://everyayah.com/data/Husary_64kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'egypt',
    name: 'Egyptian',
    nameAr: 'مصر',
    previewUrl: 'https://everyayah.com/data/AbdulSamad_64kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'turkey',
    name: 'Turkish',
    nameAr: 'تركيا',
    previewUrl: 'https://everyayah.com/data/Mohammad_al_Tablaway_128kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'malaysia',
    name: 'Malaysian',
    nameAr: 'ماليزيا',
    previewUrl: 'https://everyayah.com/data/Minshawi_Murattal_128kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'fajr',
    name: 'Fajr Special',
    nameAr: 'أذان الفجر',
    previewUrl: 'https://everyayah.com/data/Muhammad_Jibreel_128kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'classical',
    name: 'Classical',
    nameAr: 'كلاسيكي',
    previewUrl: 'https://everyayah.com/data/Parhizgar_40kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'modern',
    name: 'Modern',
    nameAr: 'حديث',
    previewUrl: 'https://everyayah.com/data/Sahl_Yassin_64kbps/001001.mp3',
  ),
  AdhanVoice(
    id: 'yasser',
    name: 'Sheikh Yasser',
    nameAr: 'الشيخ ياسر',
    previewUrl: 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/001001.mp3',
  ),
];

/// Sentinel custom voice. Path resolved at runtime from SharedPreferences.
const kCustomAdhanVoice = AdhanVoice(
  id: 'custom',
  name: 'My Recording',
  nameAr: 'تسجيلي',
  previewUrl: '',
  isCustom: true,
);
