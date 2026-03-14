# TV Settings Architecture

> See also: [api-security.md](api-security.md)

## Source of Truth

TV settings have two canonical stores:

| Store | Location | Authority |
| --- | --- | --- |
| **Hasura DB** | `pc_tv_devices.settings_json` | Long-term persistence; survives server restarts |
| **Smart server in-memory** | `deviceSettings: Map<deviceId, settingsJson>` in `smart/src/routes/tv.ts` | Latest pushed settings; ephemeral, rebuilt from Hasura on startup |

In-memory always wins over Hasura for reads (most recent push wins). Hasura is the fallback when a device is not in memory (after restart).

## Write Flow (web dashboard → TV)

```
Web dashboard
  → PATCH /api/v1/tv/:id/settings (smart server)
  → Updates in-memory deviceSettings
  → Async write to Hasura (fire-and-forget with error log)
  → Smart server emits SSE 'settings' event to connected TV
  → TV receives event via TvSseService → applies settings immediately

Polling fallback (TV, every 30s):
  → GET /api/v1/tv/:id/settings (smart server)
  → Returns merged { ...dbSettings, ...memSettings }
  → TV applies settings with conflict resolution (ARCH-A5)
```

## Read Flow (TV → smart server)

```
TvHomeScreen._pollSettings()
  → GET /api/v1/tv/:id/settings
  → Smart server merges Hasura + in-memory
  → TV applies with conflict resolution:
      if local.lastModified > remote.last_modified → keep local (local wins)
      else → merge remote over local (remote wins)
```

## Conflict Resolution (ARCH-A5 + SYNC-B2)

`TvSettings` has a `lastModified: DateTime?` field (added in SYNC-B2). When the TV makes a local change (e.g., user adjusts a setting from the TV remote), it should:

1. Mutate settings via `TvSettingsNotifier.update(newSettings.copyWith(lastModified: DateTime.now().toUtc()))`
2. The next polling cycle sees `local.lastModified > remote.last_modified` and skips applying stale remote settings.

The smart server stores `last_modified` inside `settings_json` when present in the PATCH payload.

**Rule:** The most recently modified copy wins. This is a last-write-wins (LWW) strategy — appropriate because conflicting edits from the TV remote and web dashboard simultaneously are rare.

## Settings Fields

See `flutter/lib/shared/models/tv_settings_model.dart` for the complete schema.

Key groups:
- **Location**: `location_lat`, `location_lng`, `location_city`, `location_country`, `location_timezone` — set by web dashboard; consumed by TV for prayer times
- **Display**: `tvAudioMode`, `videoAreaSource`, `selectedStreamId`, `layoutSettings`, `colorPalette`, etc.
- **Masjid mode**: `isMasjidMode`, `masjidName`, `iqamahOffsets`, `announcements`
- **Screensaver**: `screensaverMode`, `screensaverCategory`, `slideshowDurationSeconds`, `photoSource`
- **Notifications/alerts**: `prayerAlertConfigs`, `globalAudioMode`
- **Sync**: `last_modified` (ISO 8601 UTC string)

## Ephemeral State (not in settings_json)

These are tracked in TV-side state only and never persisted to Hasura:

| State | Where | Why ephemeral |
| --- | --- | --- |
| `currentBrightness` | TV local only | Hardware-dependent, changes frequently |
| `_completedPrayers` | `Set<String>` in `TvHomeScreen` | Resets daily at midnight |
| `_heartbeatFailures` | `int` in `TvHomeScreen` | Network condition counter |
| `quranCommand` | Consumed immediately via SSE | Fire-and-forget media commands |

## Migration Notes

Settings backward compatibility: all `TvSettings.fromJson` fields use `?? default` so missing keys in old JSON parse cleanly. New fields are always optional.

The smart server merges settings at read time (`{ ...dbSettings, ...memSettings }`), so adding a new field to the Flutter model does not require a DB schema change — the JSONB column accepts any shape.
