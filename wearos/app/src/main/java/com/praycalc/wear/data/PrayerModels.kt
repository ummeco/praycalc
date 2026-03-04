package com.praycalc.wear.data

import org.json.JSONObject
import java.time.LocalTime
import java.time.format.DateTimeFormatter

data class PrayerTime(
    val name: String,
    val time: LocalTime,
    val isNext: Boolean = false
) {
    val displayTime: String
        get() = time.format(DateTimeFormatter.ofPattern("h:mm a"))
}

data class QiblaInfo(
    val bearing: Double,
    val distance: Double
)

data class PrayerMeta(
    val method: String,
    val madhab: String,
    val timezone: String,
    val latitude: Double,
    val longitude: Double
)

data class PrayerData(
    val prayers: List<PrayerTime>,
    val nextPrayer: PrayerTime?,
    val qibla: QiblaInfo?,
    val meta: PrayerMeta?
) {
    companion object {
        val Empty = PrayerData(
            prayers = emptyList(),
            nextPrayer = null,
            qibla = null,
            meta = null
        )

        fun fromJson(json: JSONObject): PrayerData {
            val timeFormatter = DateTimeFormatter.ofPattern("HH:mm")
            val prayerNames = listOf("fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha")

            val prayersJson = json.getJSONObject("prayers")
            val nextPrayerName = json.optString("nextPrayer", "")

            val prayers = prayerNames.mapNotNull { name ->
                val timeStr = prayersJson.optString(name, "")
                if (timeStr.isNotEmpty()) {
                    PrayerTime(
                        name = name.replaceFirstChar { it.uppercase() },
                        time = LocalTime.parse(timeStr, timeFormatter),
                        isNext = name == nextPrayerName
                    )
                } else null
            }

            val nextPrayer = prayers.find { it.isNext }

            val qibla = if (json.has("qibla")) {
                val qiblaJson = json.getJSONObject("qibla")
                QiblaInfo(
                    bearing = qiblaJson.getDouble("bearing"),
                    distance = qiblaJson.getDouble("distance")
                )
            } else null

            val meta = if (json.has("meta")) {
                val metaJson = json.getJSONObject("meta")
                PrayerMeta(
                    method = metaJson.optString("method", "isna"),
                    madhab = metaJson.optString("madhab", "shafii"),
                    timezone = metaJson.optString("timezone", ""),
                    latitude = metaJson.optDouble("latitude", 0.0),
                    longitude = metaJson.optDouble("longitude", 0.0)
                )
            } else null

            return PrayerData(
                prayers = prayers,
                nextPrayer = nextPrayer,
                qibla = qibla,
                meta = meta
            )
        }
    }
}

data class Settings(
    val method: String = "isna",
    val madhab: String = "shafii"
) {
    companion object {
        val METHODS = listOf(
            "isna" to "ISNA",
            "mwl" to "MWL",
            "egypt" to "Egypt",
            "makkah" to "Umm al-Qura",
            "tehran" to "Tehran",
            "karachi" to "Karachi"
        )

        val MADHABS = listOf(
            "shafii" to "Shafi'i",
            "hanafi" to "Hanafi"
        )
    }
}
