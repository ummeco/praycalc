/**
 * pray_calc.h — Prayer time calculation engine in C99.
 *
 * Supports multiple calculation methods (ISNA, MWL, Egypt, Umm al-Qura,
 * Tehran, Karachi) and both Shafi'i and Hanafi Asr conventions.
 *
 * Uses the NREL SPA for high-accuracy solar position, with method-specific
 * fixed depression angles for Fajr and Isha.
 */
#ifndef PRAY_CALC_H
#define PRAY_CALC_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Calculation method enum.
 */
typedef enum {
    CALC_METHOD_ISNA       = 0,  /* Fajr 15, Isha 15 */
    CALC_METHOD_MWL        = 1,  /* Fajr 18, Isha 17 */
    CALC_METHOD_EGYPT      = 2,  /* Fajr 19.5, Isha 17.5 */
    CALC_METHOD_UMM_AL_QURA= 3,  /* Fajr 18.5, Isha 90min after Maghrib */
    CALC_METHOD_TEHRAN     = 4,  /* Fajr 17.7, Isha 14 */
    CALC_METHOD_KARACHI    = 5,  /* Fajr 18, Isha 18 */
    CALC_METHOD_COUNT      = 6
} CalcMethod;

/**
 * Madhab (Asr shadow convention).
 */
typedef enum {
    MADHAB_SHAFI = 0,  /* Shadow factor 1 (Shafi'i/Maliki/Hanbali) */
    MADHAB_HANAFI = 1  /* Shadow factor 2 */
} Madhab;

/**
 * Input parameters for prayer time calculation.
 */
typedef struct {
    double latitude;      /* degrees (-90..90, south negative) */
    double longitude;     /* degrees (-180..180, west negative) */
    int    year;
    int    month;
    int    day;
    double timezone;      /* UTC offset in hours */
    double elevation;     /* meters above sea level */
    int    method;        /* CalcMethod enum value */
    int    madhab;        /* Madhab enum value (0=Shafi, 1=Hanafi) */
} PrayCalcInput;

/**
 * Prayer time results. All times are fractional hours since midnight (local time).
 * Use pray_calc_format_time() to convert to HH:MM string.
 */
typedef struct {
    double fajr;          /* Fajr (true dawn) */
    double sunrise;       /* Sunrise */
    double dhuhr;         /* Dhuhr (solar noon + 2 min safety) */
    double asr;           /* Asr */
    double maghrib;       /* Maghrib (sunset) */
    double isha;          /* Isha */
    double qibla_bearing; /* Qibla direction in degrees from north */
} PrayCalcResult;

/**
 * Initialize a PrayCalcInput with sensible defaults.
 * Sets method=ISNA, madhab=Shafi, elevation=0, timezone=0.
 */
void pray_calc_input_init(PrayCalcInput *input);

/**
 * Calculate prayer times for the given input parameters.
 *
 * Returns a PrayCalcResult with all prayer times as fractional hours.
 * If a prayer time cannot be computed (e.g., polar regions), the
 * corresponding field is set to NAN.
 */
PrayCalcResult pray_calc_times(PrayCalcInput input);

/**
 * Format fractional hours as "HH:MM" string.
 *
 * buf must be at least 6 bytes. Returns buf on success.
 * If hours is NaN or out of range, writes "--:--".
 */
char *pray_calc_format_time(double hours, char *buf, int buf_size);

#ifdef __cplusplus
}
#endif

#endif /* PRAY_CALC_H */
