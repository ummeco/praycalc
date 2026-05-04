-- Migration: 0104_pc_assistant_links
-- Voice assistant linked accounts (Alexa / Google Actions)

CREATE TABLE pc_assistant_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform text NOT NULL
    CHECK (platform IN ('alexa','google')),
  external_account_id text NOT NULL,
  home_lat float,
  home_lng float,
  home_label text,
  linked_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pc_assistant_links_user_platform_unique UNIQUE (user_id, platform)
);

CREATE INDEX idx_pc_assistant_links_user ON pc_assistant_links(user_id);

COMMENT ON TABLE pc_assistant_links IS 'Alexa and Google Actions linked accounts for PrayCalc v1.1+';
COMMENT ON COLUMN pc_assistant_links.external_account_id IS 'Alexa userId or Google account sub claim';
COMMENT ON COLUMN pc_assistant_links.home_lat IS 'GPS location from mobile app for GPS-accurate prayer times in skill';
