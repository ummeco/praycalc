package com.praycalc.wear

import com.praycalc.wear.data.PrayerData
import com.praycalc.wear.data.PrayerTime
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.time.LocalTime

class PrayerModelTest {

    private val sampleJson = """
    {
        "prayers": {
            "fajr": "05:30",
            "sunrise": "06:55",
            "dhuhr": "12:15",
            "asr": "15:45",
            "maghrib": "18:30",
            "isha": "20:00"
        },
        "nextPrayer": "dhuhr",
        "qibla": {
            "bearing": 56.78,
            "distance": 10234.5
        },
        "meta": {
            "method": "isna",
            "madhab": "shafii",
            "timezone": "America/New_York",
            "latitude": 40.7128,
            "longitude": -74.006
        }
    }
    """.trimIndent()

    @Test
    fun `parse JSON into PrayerData correctly`() {
        val json = JSONObject(sampleJson)
        val data = PrayerData.fromJson(json)

        assertEquals(6, data.prayers.size)
        assertEquals("Fajr", data.prayers[0].name)
        assertEquals(LocalTime.of(5, 30), data.prayers[0].time)
        assertEquals("Isha", data.prayers[5].name)
        assertEquals(LocalTime.of(20, 0), data.prayers[5].time)
    }

    @Test
    fun `next prayer is identified correctly`() {
        val json = JSONObject(sampleJson)
        val data = PrayerData.fromJson(json)

        assertNotNull(data.nextPrayer)
        assertEquals("Dhuhr", data.nextPrayer!!.name)
        assertTrue(data.nextPrayer!!.isNext)

        val dhuhr = data.prayers.find { it.name == "Dhuhr" }
        assertNotNull(dhuhr)
        assertTrue(dhuhr!!.isNext)

        val fajr = data.prayers.find { it.name == "Fajr" }
        assertNotNull(fajr)
        assertTrue(!fajr!!.isNext)
    }

    @Test
    fun `complication data values are correct`() {
        val json = JSONObject(sampleJson)
        val data = PrayerData.fromJson(json)

        val nextPrayer = data.nextPrayer!!
        assertEquals("Dhuhr", nextPrayer.name)
        assertEquals("12:15 PM", nextPrayer.displayTime)

        assertNotNull(data.qibla)
        assertEquals(56.78, data.qibla!!.bearing, 0.01)

        assertNotNull(data.meta)
        assertEquals("isna", data.meta!!.method)
    }

    @Test
    fun `tile content displays correct info`() {
        val json = JSONObject(sampleJson)
        val data = PrayerData.fromJson(json)

        val nextPrayer = data.nextPrayer!!

        val tileName = nextPrayer.name
        val tileTime = nextPrayer.displayTime

        assertEquals("Dhuhr", tileName)
        assertEquals("12:15 PM", tileTime)

        assertEquals(6, data.prayers.size)
        data.prayers.forEach { prayer ->
            assertTrue(prayer.name.isNotEmpty())
            assertTrue(prayer.displayTime.isNotEmpty())
        }
    }
}
