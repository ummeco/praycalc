package com.praycalc.wear

import com.google.android.gms.wearable.*

// Receives prayer time data from the phone app via Wearable Data Layer.
// The phone writes to path "/prayer_times" using a DataMap; this service
// persists the values to SharedPreferences("wear_prayer") and triggers
// a tile refresh on both the legacy PrayCountdownTile and the v1.1
// PrayerTileService.
//
// DataMap keys written by the Flutter companion:
//   next_prayer         String  — prayer name ("Asr")
//   next_prayer_time    String  — display time ("3:47 PM")
//   next_prayer_ts      Long    — unix seconds of next prayer
//   fajr / dhuhr / asr / maghrib / isha    String — display times
//   fajr_ts / dhuhr_ts / asr_ts / …       Long   — unix seconds per prayer
//   location            String  — location name (may be empty)
class PrayerDataListenerService : WearableListenerService() {

    private val prayerKeys = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val item = event.dataItem
                if (item.uri.path == "/prayer_times") {
                    val dataMap = DataMapItem.fromDataItem(item).dataMap
                    val prefs = getSharedPreferences("wear_prayer", MODE_PRIVATE)
                    prefs.edit().apply {
                        putString("next_prayer", dataMap.getString("next_prayer"))
                        putString("next_prayer_time", dataMap.getString("next_prayer_time"))
                        putLong("next_prayer_ts", dataMap.getLong("next_prayer_ts", 0L))
                        prayerKeys.forEach { key ->
                            putString(key, dataMap.getString(key))
                            putLong("${key}_ts", dataMap.getLong("${key}_ts", 0L))
                        }
                        putString("location", dataMap.getString("location") ?: "")
                        apply()
                    }
                    // Refresh v1.1 tile, legacy tile, and complication
                    PrayerTileService.requestUpdate(this)
                    PrayerComplicationService.requestUpdate(this)
                    TileService.getUpdater(this).requestUpdate(PrayCountdownTile::class.java)
                }
            }
        }
    }
}
