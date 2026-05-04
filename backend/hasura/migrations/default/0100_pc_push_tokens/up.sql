-- Migration: 0100_pc_push_tokens
-- Push token registry (extended for v1.1 platforms)

CREATE TABLE pc_push_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  device_id text NOT NULL,
  platform text NOT NULL
    CHECK (platform IN ('ios','android','watch_ios','watch_android','macos','windows','tv_android','tv_apple','alexa')),
  token text NOT NULL,
  permission_state text NOT NULL
    CHECK (permission_state IN ('granted','denied','provisional','not_determined')),
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pc_push_tokens_device_platform_unique UNIQUE (device_id, platform)
);

-- Hot-path: find tokens for a user at push time
CREATE INDEX idx_pc_push_tokens_user_id ON pc_push_tokens(user_id);
CREATE INDEX idx_pc_push_tokens_device_platform ON pc_push_tokens(device_id, platform);

COMMENT ON TABLE pc_push_tokens IS 'Push notification token registry for all PrayCalc platforms v1.1+';
COMMENT ON COLUMN pc_push_tokens.user_id IS 'Nullable — anonymous devices allowed before sign-in';
COMMENT ON COLUMN pc_push_tokens.platform IS 'Platform identifier for nSelf notify plugin routing';
COMMENT ON COLUMN pc_push_tokens.permission_state IS 'iOS: granted/denied/provisional/not_determined; Android: granted/denied';
