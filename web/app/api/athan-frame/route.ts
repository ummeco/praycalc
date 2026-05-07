import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/athan-frame?city={city}&method={method}
 *
 * Simple REST endpoint for Athan Frame IoT display integration.
 * Returns the next prayer time in JSON format.
 *
 * Query params:
 * - city: city name or coordinates (required)
 * - method: calculation method, e.g. ISNA, MWL, EGYPT (optional, defaults to ISNA)
 *
 * Response:
 * {
 *   "prayer": "Dhuhr",
 *   "time_unix": 1715000400,
 *   "countdown_s": 3600,
 *   "hijri_date": "15 Sha'ban 1445"
 * }
 */

type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

interface AthanFrameResponse {
  prayer: PrayerName
  time_unix: number
  countdown_s: number
  hijri_date: string
}

export const revalidate = 30 // Revalidate every 30 seconds

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const method = searchParams.get('method') ?? 'ISNA'

    if (!city) {
      return NextResponse.json(
        { error: 'city parameter is required' },
        { status: 400 }
      )
    }

    // TODO: Call PrayCalc GraphQL to fetch prayer times for city + method
    // const prayers = await getPrayerTimes(city, method)
    // const nextPrayer = getNextPrayer(prayers)
    // const hijriDate = formatHijriDate(nextPrayer.date)

    // Placeholder response for now
    const nextPrayerTime = Math.floor(Date.now() / 1000) + 3600
    const response: AthanFrameResponse = {
      prayer: 'Dhuhr',
      time_unix: nextPrayerTime,
      countdown_s: 3600,
      hijri_date: '15 Sha\'ban 1445'
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=30'
      }
    })
  } catch (error) {
    console.error('athan-frame error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
