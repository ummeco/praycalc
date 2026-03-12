package praycalc_test

import (
	"fmt"
	"regexp"
	"testing"
	"time"

	praycalc "github.com/ummeco/praycalc-go"
)

var timeRegex = regexp.MustCompile(`^\d{2}:\d{2}$`)

func newDate(year, month, day int) time.Time {
	return time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
}

func TestFajrFormat(t *testing.T) {
	r := praycalc.Calculate(21.39, 39.86, newDate(2024, 3, 20), praycalc.MethodUmmAlQura, praycalc.MadhabShafi)
	if !timeRegex.MatchString(r.Fajr) {
		t.Errorf("Fajr format invalid: %s", r.Fajr)
	}
}

func TestAllTimesPresent(t *testing.T) {
	r := praycalc.Calculate(21.39, 39.86, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	for name, val := range map[string]string{"Fajr": r.Fajr, "Sunrise": r.Sunrise, "Dhuhr": r.Dhuhr, "Asr": r.Asr, "Maghrib": r.Maghrib, "Isha": r.Isha} {
		if !timeRegex.MatchString(val) {
			t.Errorf("%s format invalid: %s", name, val)
		}
	}
}

func TestFajrBeforeSunrise(t *testing.T) {
	r := praycalc.Calculate(51.51, -0.13, newDate(2024, 6, 21), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Fajr >= r.Sunrise {
		t.Errorf("Fajr %s should be before Sunrise %s", r.Fajr, r.Sunrise)
	}
}

func TestSunriseBeforeDhuhr(t *testing.T) {
	r := praycalc.Calculate(40.71, -74.01, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Sunrise >= r.Dhuhr {
		t.Errorf("Sunrise %s should be before Dhuhr %s", r.Sunrise, r.Dhuhr)
	}
}

func TestDhuhrBeforeAsr(t *testing.T) {
	r := praycalc.Calculate(40.71, -74.01, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Dhuhr >= r.Asr {
		t.Errorf("Dhuhr %s should be before Asr %s", r.Dhuhr, r.Asr)
	}
}

func TestAsrBeforeMaghrib(t *testing.T) {
	r := praycalc.Calculate(40.71, -74.01, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Asr >= r.Maghrib {
		t.Errorf("Asr %s should be before Maghrib %s", r.Asr, r.Maghrib)
	}
}

func TestMaghribBeforeIsha(t *testing.T) {
	r := praycalc.Calculate(40.71, -74.01, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Maghrib >= r.Isha {
		t.Errorf("Maghrib %s should be before Isha %s", r.Maghrib, r.Isha)
	}
}

func TestISNAMethod(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 1, 15), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodISNA {
		t.Errorf("Expected ISNA, got %s", r.Method)
	}
}

func TestMWLMethod(t *testing.T) {
	r := praycalc.Calculate(51.5, 0.0, newDate(2024, 1, 15), praycalc.MethodMWL, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodMWL {
		t.Errorf("Expected MWL, got %s", r.Method)
	}
}

func TestEgyptMethod(t *testing.T) {
	r := praycalc.Calculate(30.0, 31.0, newDate(2024, 1, 15), praycalc.MethodEgypt, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodEgypt {
		t.Errorf("Expected Egypt, got %s", r.Method)
	}
}

func TestUmmAlQuraMethod(t *testing.T) {
	r := praycalc.Calculate(21.0, 39.0, newDate(2024, 1, 15), praycalc.MethodUmmAlQura, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodUmmAlQura {
		t.Errorf("Expected UmmAlQura, got %s", r.Method)
	}
}

func TestTehranMethod(t *testing.T) {
	r := praycalc.Calculate(35.7, 51.4, newDate(2024, 1, 15), praycalc.MethodTehran, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodTehran {
		t.Errorf("Expected Tehran, got %s", r.Method)
	}
}

func TestKarachiMethod(t *testing.T) {
	r := praycalc.Calculate(24.9, 67.0, newDate(2024, 1, 15), praycalc.MethodKarachi, praycalc.MadhabShafi)
	if r.Method != praycalc.MethodKarachi {
		t.Errorf("Expected Karachi, got %s", r.Method)
	}
}

func TestHanafiAsrLaterThanShafi(t *testing.T) {
	shafi := praycalc.Calculate(40.0, -75.0, newDate(2024, 6, 21), praycalc.MethodISNA, praycalc.MadhabShafi)
	hanafi := praycalc.Calculate(40.0, -75.0, newDate(2024, 6, 21), praycalc.MethodISNA, praycalc.MadhabHanafi)
	if shafi.Asr >= hanafi.Asr {
		t.Errorf("Shafi Asr %s should be earlier than Hanafi Asr %s", shafi.Asr, hanafi.Asr)
	}
}

func TestNorthernLatitude(t *testing.T) {
	r := praycalc.Calculate(59.9, 10.7, newDate(2024, 3, 20), praycalc.MethodMWL, praycalc.MadhabShafi)
	if !timeRegex.MatchString(r.Fajr) {
		t.Errorf("Oslo Fajr invalid: %s", r.Fajr)
	}
}

func TestSouthernLatitude(t *testing.T) {
	r := praycalc.Calculate(-33.87, 151.21, newDate(2024, 3, 20), praycalc.MethodMWL, praycalc.MadhabShafi)
	if !timeRegex.MatchString(r.Fajr) {
		t.Errorf("Sydney Fajr invalid: %s", r.Fajr)
	}
}

func TestNegativeLongitude(t *testing.T) {
	r := praycalc.Calculate(43.65, -79.38, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if !timeRegex.MatchString(r.Dhuhr) {
		t.Errorf("Toronto Dhuhr invalid: %s", r.Dhuhr)
	}
}

func TestLatitudeStored(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Latitude != 40.0 {
		t.Errorf("Expected lat 40.0, got %f", r.Latitude)
	}
}

func TestLongitudeStored(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Longitude != -75.0 {
		t.Errorf("Expected lng -75.0, got %f", r.Longitude)
	}
}

func TestDateStored(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Date != "2024-03-20" {
		t.Errorf("Expected date 2024-03-20, got %s", r.Date)
	}
}

func TestMadhabShafi(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabShafi)
	if r.Madhab != praycalc.MadhabShafi {
		t.Errorf("Expected Shafi, got %s", r.Madhab)
	}
}

func TestMadhabHanafi(t *testing.T) {
	r := praycalc.Calculate(40.0, -75.0, newDate(2024, 3, 20), praycalc.MethodISNA, praycalc.MadhabHanafi)
	if r.Madhab != praycalc.MadhabHanafi {
		t.Errorf("Expected Hanafi, got %s", r.Madhab)
	}
}

func TestUmmAlQuraIshaInterval(t *testing.T) {
	r := praycalc.Calculate(21.39, 39.86, newDate(2024, 3, 20), praycalc.MethodUmmAlQura, praycalc.MadhabShafi)
	toMinutes := func(t string) int {
		h, m := 0, 0
		fmt.Sscanf(t, "%02d:%02d", &h, &m)
		return h*60 + m
	}
	diff := toMinutes(r.Isha) - toMinutes(r.Maghrib)
	if diff != 90 {
		t.Errorf("Umm Al-Qura Isha should be 90min after Maghrib, got %d", diff)
	}
}
