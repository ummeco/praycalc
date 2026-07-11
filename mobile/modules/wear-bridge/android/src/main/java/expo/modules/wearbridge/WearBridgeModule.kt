package expo.modules.wearbridge

import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Purpose: App-process bridge that pushes today's computed prayer times to a paired
 *   Wear OS watch via the Wearable Data Layer, matching the EXACT path + keys
 *   wearos/app/src/main/java/app/praycalc/data/PrayerDataListenerService.kt already
 *   expects: path "/prayer_times", DataMap keys location/fajr/dhuhr/asr/maghrib/isha
 *   (each a "HH:mm" 24h string, except location which is a free-text display label).
 *   No madhab/method are sent — the watch owns those via its own local Settings
 *   (see wearos PrayerModels.kt's Settings/PrayerRepository.updateMethod/updateMadhab).
 * Inputs (from JS, mobile/src/lib/watch/nativeWearBridge.ts):
 *   sendPrayerTimes(location, fajr, dhuhr, asr, maghrib, isha) -> Boolean
 * Outputs: WearBridgeModule (autolinked via expo-module.config.json).
 * Constraints: DataClient.putDataItem queues for delivery even when the watch is not
 *   currently connected, so this module cannot confirm the watch actually received the
 *   update — it only confirms the local put call succeeded. Degrades to `false` (never
 *   throws) when the app Context is unavailable or Play Services rejects the call, so a
 *   bridge failure can never break the caller's prayer-notification scheduling flow.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-wear-bridge-native
 */
class WearBridgeModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("WearBridge")

    // Whether this module has a usable Android Context to talk to Play Services with.
    Function("isSupported") {
      appContext.reactContext != null
    }

    AsyncFunction("sendPrayerTimes") {
      location: String,
      fajr: String,
      dhuhr: String,
      asr: String,
      maghrib: String,
      isha: String,
      promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.resolve(false)
        return@AsyncFunction
      }
      try {
        val request = PutDataMapRequest.create("/prayer_times").apply {
          dataMap.putString("location", location)
          dataMap.putString("fajr", fajr)
          dataMap.putString("dhuhr", dhuhr)
          dataMap.putString("asr", asr)
          dataMap.putString("maghrib", maghrib)
          dataMap.putString("isha", isha)
        }
        val putRequest = request.asPutDataRequest().setUrgent()
        Wearable.getDataClient(context).putDataItem(putRequest)
        promise.resolve(true)
      } catch (e: Exception) {
        promise.resolve(false)
      }
    }
  }
}
