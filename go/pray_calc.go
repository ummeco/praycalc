// Package praycalc provides Islamic prayer time calculations.
// Pure Go, no dependencies.
package praycalc

import (
	"fmt"
	"math"
	"time"
)

// Method represents an Islamic prayer time calculation method.
type Method string

const (
	MethodISNA      Method = "isna"
	MethodMWL       Method = "mwl"
	MethodEgypt     Method = "egypt"
	MethodUmmAlQura Method = "umm_al_qura"
	MethodTehran    Method = "tehran"
	MethodKarachi   Method = "karachi"
)

// Madhab determines the Asr prayer calculation method.
type Madhab string

const (
	MadhabShafi  Madhab = "shafi"
	MadhabHanafi Madhab = "hanafi"
)

// PrayerTimes holds the calculated prayer times for a day.
type PrayerTimes struct {
	Fajr      string  // HH:MM 24-hour
	Sunrise   string
	Dhuhr     string
	Asr       string
	Maghrib   string
	Isha      string
	Date      string  // YYYY-MM-DD
	Latitude  float64
	Longitude float64
	Method    Method
	Madhab    Madhab
}

type methodParams struct {
	fajrAngle    float64
	ishaAngle    float64 // 0 if using interval
	ishaInterval int     // minutes after maghrib; 0 if using angle
}

var methods = map[Method]methodParams{
	MethodISNA:      {15.0, 15.0, 0},
	MethodMWL:       {18.0, 17.0, 0},
	MethodEgypt:     {19.5, 17.5, 0},
	MethodUmmAlQura: {18.5, 0, 90},
	MethodTehran:    {17.7, 14.0, 0},
	MethodKarachi:   {18.0, 18.0, 0},
}

func toRad(d float64) float64 { return d * math.Pi / 180 }
func toDeg(r float64) float64 { return r * 180 / math.Pi }

func fixHour(h float64) float64 {
	return h - 24*math.Floor(h/24)
}

func julianDay(year, month, day int) float64 {
	if month <= 2 {
		year--
		month += 12
	}
	a := math.Floor(float64(year) / 100)
	b := 2 - a + math.Floor(a/4)
	return math.Floor(365.25*float64(year+4716)) + math.Floor(30.6001*float64(month+1)) + float64(day) + b - 1524.5
}

func sunPosition(jd float64) (dec, eqTime float64) {
	d := jd - 2451545.0
	g := toRad(357.529 + 0.98560028*d)
	q := 280.459 + 0.98564736*d
	l := toRad(q + 1.915*math.Sin(g) + 0.020*math.Sin(2*g))
	e := toRad(23.439 - 0.00000036*d)
	ra := toDeg(math.Atan2(math.Cos(e)*math.Sin(l), math.Cos(l))) / 15
	ra = fixHour(ra)
	dec = toDeg(math.Asin(math.Sin(e) * math.Sin(l)))
	eqTime = q/15 - ra
	return
}

func sunAngleTime(jd, lat, angle float64, clockwise bool) float64 {
	dec, eqTime := sunPosition(jd)
	noon := 12.0 - eqTime
	cosVal := (-math.Sin(toRad(angle)) - math.Sin(toRad(dec))*math.Sin(toRad(lat))) /
		(math.Cos(toRad(dec)) * math.Cos(toRad(lat)))
	if cosVal < -1 || cosVal > 1 {
		return math.NaN()
	}
	t := toDeg(math.Acos(cosVal)) / 15
	if clockwise {
		return noon + t
	}
	return noon - t
}

func asrTime(jd, lat float64, shadowFactor int) float64 {
	dec, eqTime := sunPosition(jd)
	noon := 12.0 - eqTime
	targetAngle := -toDeg(math.Atan(1.0 / (float64(shadowFactor) + math.Tan(math.Abs(toRad(lat-dec))))))
	cosVal := (-math.Sin(toRad(targetAngle)) - math.Sin(toRad(dec))*math.Sin(toRad(lat))) /
		(math.Cos(toRad(dec)) * math.Cos(toRad(lat)))
	if cosVal < -1 || cosVal > 1 {
		return math.NaN()
	}
	return noon + toDeg(math.Acos(cosVal))/15
}

func formatTime(hour, lng float64) string {
	hour = fixHour(hour + lng/15)
	h := int(hour)
	m := int((hour-float64(h))*60 + 0.5)
	if m >= 60 {
		h++
		m -= 60
	}
	return fmt.Sprintf("%02d:%02d", h%24, m)
}

// Calculate computes Islamic prayer times for the given location and date.
func Calculate(lat, lng float64, d time.Time, method Method, madhab Madhab) PrayerTimes {
	params, ok := methods[method]
	if !ok {
		params = methods[MethodISNA]
		method = MethodISNA
	}

	jd := julianDay(d.Year(), int(d.Month()), d.Day())
	shadowFactor := 1
	if madhab == MadhabHanafi {
		shadowFactor = 2
	}

	fajr := sunAngleTime(jd, lat, params.fajrAngle, false)
	sunrise := sunAngleTime(jd, lat, -0.833, false)
	_, eqTime := sunPosition(jd)
	dhuhr := 12.0 - eqTime
	asr := asrTime(jd, lat, shadowFactor)
	maghrib := sunAngleTime(jd, lat, -0.833, true)

	var isha float64
	if params.ishaInterval > 0 {
		isha = maghrib + float64(params.ishaInterval)/60
	} else {
		isha = sunAngleTime(jd, lat, params.ishaAngle, true)
	}

	return PrayerTimes{
		Fajr:      formatTime(fajr, lng),
		Sunrise:   formatTime(sunrise, lng),
		Dhuhr:     formatTime(dhuhr, lng),
		Asr:       formatTime(asr, lng),
		Maghrib:   formatTime(maghrib, lng),
		Isha:      formatTime(isha, lng),
		Date:      d.Format("2006-01-02"),
		Latitude:  lat,
		Longitude: lng,
		Method:    method,
		Madhab:    madhab,
	}
}
