-- 007_digest_subscribers.sql
-- Email digest subscribers table

CREATE TABLE IF NOT EXISTS pc_digest_subscribers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  location_lat DECIMAL(9,6),
  location_lng DECIMAL(9,6),
  city         TEXT,
  method       TEXT DEFAULT 'isna',
  confirmed    BOOLEAN NOT NULL DEFAULT FALSE,
  confirm_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at  TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS pc_digest_subscribers_email_idx ON pc_digest_subscribers(email);
CREATE INDEX IF NOT EXISTS pc_digest_subscribers_confirmed_idx ON pc_digest_subscribers(confirmed) WHERE confirmed = TRUE;
