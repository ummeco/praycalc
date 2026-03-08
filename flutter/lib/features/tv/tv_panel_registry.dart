import 'package:flutter/material.dart';
import '../../shared/models/tv_settings_model.dart';

/// Metadata for a single TV panel type: human-readable label and icon.
class TvPanelInfo {
  final String label;
  final IconData icon;

  const TvPanelInfo({required this.label, required this.icon});
}

/// Registry mapping every [TvPanelType] to its display metadata.
///
/// Used by the layout selector UI and settings screens to show panel names
/// and icons without hardcoding them in multiple places.
const Map<TvPanelType, TvPanelInfo> kTvPanelRegistry = {
  TvPanelType.prayerTimes: TvPanelInfo(
    label: 'Prayer Times',
    icon: Icons.access_time,
  ),
  TvPanelType.liveStream: TvPanelInfo(
    label: 'Live Stream',
    icon: Icons.live_tv,
  ),
  TvPanelType.artSlideshow: TvPanelInfo(
    label: 'Art Slideshow',
    icon: Icons.photo_library,
  ),
  TvPanelType.weatherFull: TvPanelInfo(
    label: 'Weather',
    icon: Icons.wb_sunny,
  ),
  TvPanelType.qiblaCompass: TvPanelInfo(
    label: 'Qibla Compass',
    icon: Icons.explore,
  ),
  TvPanelType.moonPhase: TvPanelInfo(
    label: 'Moon Phase',
    icon: Icons.nightlight,
  ),
  TvPanelType.hadithTicker: TvPanelInfo(
    label: 'Hadith Ticker',
    icon: Icons.format_quote,
  ),
  TvPanelType.announcementCrawler: TvPanelInfo(
    label: 'Announcements',
    icon: Icons.campaign,
  ),
  TvPanelType.quranDisplay: TvPanelInfo(
    label: 'Quran Display',
    icon: Icons.menu_book,
  ),
};
