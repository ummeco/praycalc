-- Migration: 0103_pc_smart_home_routines
-- Smart home prayer routines (Ummat+ gated: FF_SMART_HOME=false default)

CREATE TABLE pc_smart_home_routines (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_prayer text NOT NULL
    CHECK (trigger_prayer IN ('fajr','dhuhr','asr','maghrib','isha')),
  trigger_offset_minutes int NOT NULL DEFAULT 0,
  trigger_days int[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  platform text NOT NULL
    CHECK (platform IN ('google_home','alexa','homekit')),
  device_ids text[],
  action jsonb NOT NULL,
  duration_minutes int,
  after_action text NOT NULL DEFAULT 'revert',
  enabled bool NOT NULL DEFAULT true
);

-- Routine execution: find all enabled routines at trigger time
CREATE INDEX idx_pc_routines_enabled ON pc_smart_home_routines(enabled) WHERE enabled = true;
CREATE INDEX idx_pc_routines_user ON pc_smart_home_routines(user_id);

COMMENT ON TABLE pc_smart_home_routines IS 'Smart home prayer routines. Gated: FF_SMART_HOME=false (Ummat+)';
COMMENT ON COLUMN pc_smart_home_routines.action IS 'JSON: {type: light|speaker, color?, brightness?, volume?, audio_url?}';
COMMENT ON COLUMN pc_smart_home_routines.trigger_days IS 'Days of week (0=Sun..6=Sat)';
