-- Migration 010: Free-tier daily usage tracking
-- Created: 2026-03-13
-- Referenced by: smart/src/lib/subscription.ts checkFreeQueryLimit()

-- Tracks per-identifier (user ID or IP) daily usage counts for free-tier limits.
-- The smart server uses this to enforce FREE_DAILY_LIMIT voice/AI queries per day.
CREATE TABLE IF NOT EXISTS pc_free_tier_usage (
    identifier  TEXT    NOT NULL,                       -- user UUID or IP address
    date        DATE    NOT NULL DEFAULT CURRENT_DATE,
    count       INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY (identifier, date)
);

-- Partial index to keep queries fast for today's rows (most frequent access pattern)
CREATE INDEX IF NOT EXISTS idx_pc_free_tier_usage_today
    ON pc_free_tier_usage(identifier)
    WHERE date = CURRENT_DATE;

-- Auto-clean rows older than 90 days (run periodically via pg_cron or cron job)
-- Note: pg_cron must be enabled on the Postgres instance:
--   SELECT cron.schedule('0 3 * * *', $$DELETE FROM pc_free_tier_usage WHERE date < NOW() - INTERVAL '90 days'$$);
