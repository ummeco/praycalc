-- 008_pc_sessions.sql
-- PrayCalc visitor analytics table
-- Applied after 007_digest_subscribers.sql

CREATE TABLE IF NOT EXISTS pc_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  TEXT NOT NULL,
  user_id     UUID REFERENCES umm_user_profiles(id) ON DELETE SET NULL,
  ip_hash     TEXT NOT NULL,  -- SHA-256 of IP, no raw IP stored (privacy)
  user_agent  TEXT,
  path        TEXT NOT NULL,
  city        TEXT,           -- From GeoIP (if available)
  country     TEXT,           -- ISO 3166-1 alpha-2
  method      TEXT,           -- Prayer calculation method if on times page
  referrer    TEXT,
  duration_ms INTEGER,        -- Session duration in milliseconds
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pc_sessions_session_id_idx ON pc_sessions(session_id);
CREATE INDEX IF NOT EXISTS pc_sessions_created_at_idx ON pc_sessions(created_at);
CREATE INDEX IF NOT EXISTS pc_sessions_path_idx ON pc_sessions(path);
CREATE INDEX IF NOT EXISTS pc_sessions_country_idx ON pc_sessions(country);
