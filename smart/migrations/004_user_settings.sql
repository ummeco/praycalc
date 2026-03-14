-- Migration 004: User settings table for prayer calculation preferences
-- Created: 2026-03-13
-- Note: Numbering gap between 003 and 005 — this migration fills it.
--       Migration 005 (tv_devices) was created before user settings were formalised.

-- Per-user prayer calculation and display settings.
-- Synced from the mobile app and surfaced via the smart server settings routes.
CREATE TABLE IF NOT EXISTS pc_user_settings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES umm_user_profiles(id) ON DELETE CASCADE,

    -- Prayer calculation
    calculation_method  TEXT NOT NULL DEFAULT 'ISNA',   -- ISNA, MWL, Egypt, UmmAlQura, Tehran, Karachi
    asr_method          TEXT NOT NULL DEFAULT 'standard', -- standard | hanafi
    high_latitude_rule  TEXT NOT NULL DEFAULT 'middle_of_night', -- none | middle_of_night | seventh_of_night | twilight_angle
    fajr_angle          DOUBLE PRECISION,               -- override if custom method
    isha_angle          DOUBLE PRECISION,               -- override if custom method

    -- Location
    location_city       TEXT,
    location_slug       TEXT,                           -- URL-safe slug for the city
    location_lat        DOUBLE PRECISION,
    location_lng        DOUBLE PRECISION,
    location_timezone   TEXT,
    location_country    TEXT,

    -- Display preferences
    time_format         TEXT NOT NULL DEFAULT '12h',    -- 12h | 24h
    language            TEXT NOT NULL DEFAULT 'en',     -- BCP-47 language code
    hijri_offset        INTEGER NOT NULL DEFAULT 0,     -- days to offset Hijri date display

    -- Notification preferences (serialised JSON for flexibility)
    notification_config JSONB DEFAULT '{}'::jsonb,

    -- Timestamps
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT pc_user_settings_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_user_settings_user_id ON pc_user_settings(user_id);

CREATE TRIGGER update_pc_user_settings_updated_at
    BEFORE UPDATE ON pc_user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
