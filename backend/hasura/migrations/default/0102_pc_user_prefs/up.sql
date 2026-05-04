-- Migration: 0102_pc_user_prefs
-- Cross-device user preferences (synced via Hasura on login)

CREATE TABLE pc_user_prefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  calc_method text NOT NULL DEFAULT 'isna',
  hanafi_asr bool NOT NULL DEFAULT false,
  time_format text NOT NULL DEFAULT 'auto'
    CHECK (time_format IN ('auto','12h','24h')),
  hijri_offset int NOT NULL DEFAULT 0,
  show_moon_phase bool NOT NULL DEFAULT true,
  home_lat float,
  home_lng float,
  home_label text,
  locale text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pc_user_prefs_user ON pc_user_prefs(user_id);

COMMENT ON TABLE pc_user_prefs IS 'Cross-device user preferences synced on login for PrayCalc v1.1+';
COMMENT ON COLUMN pc_user_prefs.time_format IS 'auto = detect from device locale; 12h/24h = override';
COMMENT ON COLUMN pc_user_prefs.hijri_offset IS 'Days offset for Hijri date display (-2 to +2)';
