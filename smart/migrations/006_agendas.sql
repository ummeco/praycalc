-- Migration 006: Prayer time agendas
-- Created: 2026-03-09

-- Prayer agendas: structured schedules anchored to prayer times
-- Example use: Ramadan program, weekly halaqa, school timetable
CREATE TABLE IF NOT EXISTS pc_agendas (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES umm_user_profiles(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    slug        TEXT UNIQUE,                     -- public share slug (null = private)
    items_json  JSONB NOT NULL DEFAULT '[]',     -- array of AgendaItem
    lat         DOUBLE PRECISION,                -- location for prayer time preview
    lng         DOUBLE PRECISION,
    timezone    TEXT NOT NULL DEFAULT 'UTC',
    is_public   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pc_agendas_user_id_idx ON pc_agendas (user_id);
CREATE INDEX IF NOT EXISTS pc_agendas_slug_idx    ON pc_agendas (slug) WHERE slug IS NOT NULL;

-- AgendaItem shape (stored in items_json array):
-- {
--   id: string,
--   label: string,
--   anchor: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'fixed',
--   offsetMinutes: number,   -- minutes from anchor (negative = before)
--   durationMinutes: number,
--   notes?: string
-- }
