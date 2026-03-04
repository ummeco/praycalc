-- PC-SC-3: OAuth authorization codes and tokens table
-- Replaces in-memory Maps with persistent storage for production use.
-- Apply to shared ummat database via: psql -f 003_oauth_tokens.sql

CREATE TABLE IF NOT EXISTS public.pc_oauth_codes (
  code            TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id       TEXT NOT NULL,
  code_challenge  TEXT,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_oauth_codes_expires ON public.pc_oauth_codes(expires_at);

CREATE TABLE IF NOT EXISTS public.pc_oauth_tokens (
  token_hash      TEXT PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_type      TEXT NOT NULL CHECK (token_type IN ('access', 'refresh')),
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pc_oauth_tokens_user ON public.pc_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_pc_oauth_tokens_expires ON public.pc_oauth_tokens(expires_at);

COMMENT ON TABLE public.pc_oauth_codes IS 'OAuth 2.0 authorization codes for smart home account linking.';
COMMENT ON TABLE public.pc_oauth_tokens IS 'OAuth 2.0 access and refresh tokens for smart home integrations.';
