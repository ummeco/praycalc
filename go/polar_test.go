package praycalc

import (
	"strings"
	"testing"
	"time"
)

// PKG-08 — the Go port silently reported midnight for prayers that do not occur.
//
// sunAngleTime and asrTime return math.NaN() when a depression angle is geometrically
// unreachable, which is correct. formatTime then did int(hour), and int(NaN) is 0 in Go —
// no panic, no error, just "00:00". A caller could not distinguish "no valid time" from a
// prayer that genuinely falls at midnight, so the wrong answer looked like a real one.

var polarCases = []struct {
	name string
	lat  float64
	lng  float64
	date time.Time
}{
	{"Longyearbyen midnight sun", 78.22334, 15.64689, time.Date(2026, 6, 21, 12, 0, 0, 0, time.UTC)},
	{"Longyearbyen polar night", 78.22334, 15.64689, time.Date(2026, 12, 21, 12, 0, 0, 0, time.UTC)},
	{"Tromso midnight sun", 69.6492, 18.9553, time.Date(2026, 6, 21, 12, 0, 0, 0, time.UTC)},
	{"McMurdo polar night", -77.8419, 166.6863, time.Date(2026, 6, 21, 12, 0, 0, 0, time.UTC)},
}

func fields(p PrayerTimes) map[string]string {
	return map[string]string{
		"Fajr": p.Fajr, "Sunrise": p.Sunrise, "Dhuhr": p.Dhuhr,
		"Asr": p.Asr, "Maghrib": p.Maghrib, "Isha": p.Isha,
	}
}

func TestPolarUnreachablePrayersAreExplicit(t *testing.T) {
	for _, c := range polarCases {
		t.Run(c.name, func(t *testing.T) {
			got := Calculate(c.lat, c.lng, c.date, MethodMWL, MadhabShafi)
			for name, v := range fields(got) {
				if v == "00:00" {
					t.Errorf("%s: %s reported as 00:00 — indistinguishable from a real midnight time", c.name, name)
				}
				if v != NoTimePlaceholder && !strings.Contains(v, ":") {
					t.Errorf("%s: %s malformed: %q", c.name, name, v)
				}
			}
		})
	}
}

func TestPolarDayHasNoSunriseOrSunset(t *testing.T) {
	got := Calculate(78.22334, 15.64689, time.Date(2026, 6, 21, 12, 0, 0, 0, time.UTC), MethodMWL, MadhabShafi)
	for _, f := range []struct{ name, value string }{
		{"Sunrise", got.Sunrise}, {"Maghrib", got.Maghrib},
	} {
		if f.value != NoTimePlaceholder {
			t.Errorf("%s should be %q during polar day, got %q", f.name, NoTimePlaceholder, f.value)
		}
	}
}

// Dhuhr comes from the equation of time, not from a rise/set event, so it is defined
// every day at every latitude and must never be blanked.
func TestDhuhrAlwaysPresent(t *testing.T) {
	for lat := -85.0; lat <= 85.0; lat += 5 {
		for month := 1; month <= 12; month++ {
			got := Calculate(lat, 0, time.Date(2026, time.Month(month), 15, 12, 0, 0, 0, time.UTC), MethodMWL, MadhabShafi)
			if got.Dhuhr == NoTimePlaceholder {
				t.Fatalf("lat %.0f month %d: Dhuhr should always exist", lat, month)
			}
		}
	}
}

func TestNormalLatitudesUnchanged(t *testing.T) {
	got := Calculate(21.39, 39.86, time.Date(2026, 3, 20, 12, 0, 0, 0, time.UTC), MethodMWL, MadhabShafi)
	for name, v := range fields(got) {
		if v == NoTimePlaceholder {
			t.Errorf("Mecca should have every prayer, %s was absent", name)
		}
	}
}
