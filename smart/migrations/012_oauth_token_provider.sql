-- Migration 012: Track which OAuth client (provider) issued each token
-- Enables GET /api/v1/links + DELETE /api/v1/links/:provider (WMD account-
-- linking dashboard, WTH Epic H / H2 prep).
-- Apply to shared ummat database via: psql -f 012_oauth_token_provider.sql
--
-- pc_oauth_tokens (003_oauth_tokens.sql) tracks access/refresh tokens but not
-- which platform (google/alexa/...) issued them — that's only known at
-- authorization-code time via pc_oauth_codes.client_id. This column persists
-- it onto the token row so a user's linked-providers list can be read back
-- without re-deriving it from expired/deleted authorization codes.

ALTER TABLE public.pc_oauth_tokens
  ADD COLUMN IF NOT EXISTS provider TEXT;

CREATE INDEX IF NOT EXISTS idx_pc_oauth_tokens_user_provider ON public.pc_oauth_tokens(user_id, provider);

COMMENT ON COLUMN public.pc_oauth_tokens.provider IS 'OAuth client_id that issued this token (e.g. google-home-praycalc, alexa-praycalc) — populated at issuance from pc_oauth_codes.client_id. NULL for tokens issued before this migration.';
