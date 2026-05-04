-- Migration: 0105_pc_ambient_devices
-- TV / desktop ambient device registry with pairing code flow

CREATE TABLE pc_ambient_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  platform text NOT NULL
    CHECK (platform IN ('android_tv','fire_tv','apple_tv','macos','windows','linux')),
  pairing_code text,
  paired_at timestamptz,
  home_lat float,
  home_lng float,
  home_label text,
  last_seen_at timestamptz
);

-- Ambient device lookup for TV pairing (single-use code claim)
CREATE INDEX idx_pc_ambient_pairing ON pc_ambient_devices(pairing_code) WHERE pairing_code IS NOT NULL;
CREATE INDEX idx_pc_ambient_user ON pc_ambient_devices(user_id);

COMMENT ON TABLE pc_ambient_devices IS 'TV and desktop ambient device registry for PrayCalc v1.1+';
COMMENT ON COLUMN pc_ambient_devices.pairing_code IS 'Single-use pairing code: nulled after claim, TTL enforced at API layer';
