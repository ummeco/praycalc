package app.praycalc.data

import android.util.Log
import androidx.datastore.preferences.core.edit
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * Receives prayer time data from the phone app via Wearable Data Layer.
 */
class PrayerDataListenerService : WearableListenerService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (event in dataEvents) {
            if (event.type == DataEvent.TYPE_CHANGED) {
                val item = event.dataItem
                if (item.uri.path == "/prayer_times") {
                    val dataMap = DataMapItem.fromDataItem(item).dataMap

                    // Log the sync event
                    Log.d("PrayerDataListener", "Received prayer times sync from phone")

                    val location = dataMap.getString("location") ?: ""

                    // Convert DataMap back to a JSON-like structure that matches PrayerData.fromJson
                    // Phone sends: fajr, dhuhr, asr, maghrib, isha, next_prayer, location, ts
                    val json =
                        JSONObject().apply {
                            val prayersJson =
                                JSONObject().apply {
                                    put("fajr", dataMap.getString("fajr"))
                                    put("dhuhr", dataMap.getString("dhuhr"))
                                    put("asr", dataMap.getString("asr"))
                                    put("maghrib", dataMap.getString("maghrib"))
                                    put("isha", dataMap.getString("isha"))
                                }
                            put("prayers", prayersJson)
                            put("location", location)
                        }

                    scope.launch {
                        applicationContext.dataStore.edit { prefs ->
                            prefs[PrayerRepository.KEY_SYNCED_DATA] = json.toString()
                            prefs[PrayerRepository.KEY_SYNCED_LOCATION] = location
                        }
                        Log.d("PrayerDataListener", "Saved synced data to DataStore")
                    }
                }
            }
        }
    }
}
