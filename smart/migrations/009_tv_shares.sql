-- Migration 009: TV device sharing
-- Allows a TV device owner to share access with other users

CREATE TABLE IF NOT EXISTS pc_tv_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES pc_tv_devices(id) ON DELETE CASCADE,
  owner_user_id TEXT NOT NULL,
  shared_with_user_id TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{"view": true, "control": true, "announce": false}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(device_id, shared_with_user_id)
);

CREATE INDEX IF NOT EXISTS idx_pc_tv_shares_device ON pc_tv_shares(device_id);
CREATE INDEX IF NOT EXISTS idx_pc_tv_shares_shared_with ON pc_tv_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_pc_tv_shares_owner ON pc_tv_shares(owner_user_id);
