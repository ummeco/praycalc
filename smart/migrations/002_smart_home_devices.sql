-- PC-F0-2: Smart home device registration table
-- Apply to shared ummat database via: psql -f 002_smart_home_devices.sql

CREATE TABLE IF NOT EXISTS public.pc_smart_home_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL CHECK (platform IN ('google', 'alexa', 'siri', 'homeassistant')),
  device_id       TEXT NOT NULL,
  device_name     TEXT,
  access_token_hash   TEXT,
  refresh_token_hash  TEXT,
  token_expires_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'linked' CHECK (status IN ('linked', 'expired', 'revoked')),
  linked_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, device_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_smart_home_devices_user ON public.pc_smart_home_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_smart_home_devices_platform ON public.pc_smart_home_devices(platform);

CREATE TRIGGER trg_pc_smart_home_devices_updated_at
  BEFORE UPDATE ON public.pc_smart_home_devices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PC-F1-10: Device pairing codes table
CREATE TABLE IF NOT EXISTS public.pc_device_pairings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL UNIQUE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  device_id   TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'tv' CHECK (device_type IN ('tv', 'watch', 'desktop')),
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_device_pairings_code ON public.pc_device_pairings(code) WHERE NOT used;

-- Webhook registration table
CREATE TABLE IF NOT EXISTS public.pc_webhook_registrations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  callback_url TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  events      TEXT[] NOT NULL DEFAULT '{adhan}',
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (array_length(events, 1) > 0)
);

CREATE INDEX IF NOT EXISTS idx_pc_webhook_registrations_user ON public.pc_webhook_registrations(user_id);

COMMENT ON TABLE public.pc_smart_home_devices IS 'Linked smart home devices per user (Google, Alexa, Siri, HA).';
COMMENT ON TABLE public.pc_device_pairings IS 'Short-lived pairing codes for TV/watch/desktop linking.';
COMMENT ON TABLE public.pc_webhook_registrations IS 'Webhook callback URLs for prayer event notifications.';
