package com.praycalc.wear

import com.google.android.gms.wearable.*

// Receives prayer time data from the phone app via Wearable Data Layer.
// The phone writes to path "/prayer_times" using a DataMap; this service
// persists the values to SharedPreferences and requests a tile update.
class PrayerDataListenerService : WearableListenerService() {

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
                        putString("fajr", dataMap.getString("fajr"))
                        putString("dhuhr", dataMap.getString("dhuhr"))
                        putString("asr", dataMap.getString("asr"))
                        putString("maghrib", dataMap.getString("maghrib"))
                        putString("isha", dataMap.getString("isha"))
                        apply()
                    }
                    TileService.getUpdater(this).requestUpdate(PrayCountdownTile::class.java)
                }
            }
        }
    }
}
