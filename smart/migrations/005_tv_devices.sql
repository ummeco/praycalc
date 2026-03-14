-- Migration 005: TV Command Center tables
-- Created: 2026-03-08
-- Note: Created before 004_user_settings.sql — the gap is intentional and documented in README.md.

-- TV devices registered by users
CREATE TABLE IF NOT EXISTS pc_tv_devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES umm_user_profiles(id) ON DELETE CASCADE,
    device_name     TEXT NOT NULL DEFAULT 'My TV',
    model           TEXT,                          -- e.g., "Fire TV Stick 4K"
    manufacturer    TEXT,                          -- e.g., "Amazon"
    android_id      TEXT,                          -- Android device ID (unique per device)
    pairing_code    CHAR(6) UNIQUE,                -- 6-char code for QR pairing
    paired_at       TIMESTAMPTZ DEFAULT NOW(),
    last_seen       TIMESTAMPTZ DEFAULT NOW(),
    settings_json   JSONB DEFAULT '{}'::jsonb,    -- TvSettings serialized
    location_city_slug TEXT,                       -- override city (null = use account home)
    is_online       BOOLEAN DEFAULT FALSE,
    firmware_version TEXT,                         -- app version string
    group_id        UUID,                          -- optional group membership
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TV device groups (for masjids with multiple TVs)
CREATE TABLE IF NOT EXISTS pc_tv_groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES umm_user_profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    settings_json   JSONB DEFAULT '{}'::jsonb,     -- group-level settings override
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: TV device to group membership
CREATE TABLE IF NOT EXISTS pc_tv_device_groups (
    device_id       UUID REFERENCES pc_tv_devices(id) ON DELETE CASCADE,
    group_id        UUID REFERENCES pc_tv_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (device_id, group_id)
);

-- OAuth device codes for RFC 8628 device authorization
CREATE TABLE IF NOT EXISTS pc_tv_auth_codes (
    device_code     TEXT PRIMARY KEY,
    user_code       CHAR(9) UNIQUE NOT NULL,      -- format: XXXX-XXXX
    user_id         UUID,                          -- NULL until authorized
    expires_at      TIMESTAMPTZ NOT NULL,
    authorized_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pc_tv_devices_user_id ON pc_tv_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_tv_devices_android_id ON pc_tv_devices(android_id);
CREATE INDEX IF NOT EXISTS idx_pc_tv_groups_user_id ON pc_tv_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_tv_auth_codes_user_code ON pc_tv_auth_codes(user_code);
CREATE INDEX IF NOT EXISTS idx_pc_tv_auth_codes_expires ON pc_tv_auth_codes(expires_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pc_tv_devices_updated_at
    BEFORE UPDATE ON pc_tv_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pc_tv_groups_updated_at
    BEFORE UPDATE ON pc_tv_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
