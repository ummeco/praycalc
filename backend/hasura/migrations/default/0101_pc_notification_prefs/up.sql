-- Migration: 0101_pc_notification_prefs
-- Notification preferences per prayer per device

CREATE TABLE pc_notification_prefs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  device_id text NOT NULL,
  prayer text NOT NULL
    CHECK (prayer IN ('fajr','dhuhr','asr','maghrib','isha')),
  at_adhan bool NOT NULL DEFAULT true,
  pre_reminder_minutes int[] NOT NULL DEFAULT '{}',
  sound text NOT NULL DEFAULT 'default'
    CHECK (sound IN ('default','adhan_makkah','beep','silent')),
  vibrate bool NOT NULL DEFAULT true,
  enabled bool NOT NULL DEFAULT true
);

-- Notification prefs lookup by device
CREATE INDEX idx_pc_notif_prefs_device ON pc_notification_prefs(device_id);
CREATE INDEX idx_pc_notif_prefs_user ON pc_notification_prefs(user_id);

COMMENT ON TABLE pc_notification_prefs IS 'Per-prayer notification preferences per device for PrayCalc v1.1+';
COMMENT ON COLUMN pc_notification_prefs.pre_reminder_minutes IS 'Array of offset minutes before prayer: e.g. {5,15,30}';
