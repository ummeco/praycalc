-- PC-F0-1: Ummat+ subscription schema
-- Apply to shared ummat database via: psql -f 001_subscriptions.sql

CREATE TABLE IF NOT EXISTS public.umm_subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'plus')),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  current_period_end    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for quick subscription lookups
CREATE INDEX IF NOT EXISTS idx_umm_subscriptions_user_id ON public.umm_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_umm_subscriptions_stripe_customer ON public.umm_subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_umm_subscriptions_updated_at
  BEFORE UPDATE ON public.umm_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Hasura tracking: user can read own subscription
-- Apply via Hasura console or metadata:
-- table: umm_subscriptions
-- role: user
-- select: filter { user_id: { _eq: X-Hasura-User-Id } }
-- columns: id, plan, status, current_period_end, created_at, updated_at
-- (stripe fields NOT exposed to user role)

COMMENT ON TABLE public.umm_subscriptions IS 'Ummat+ subscription status per user. Managed by Stripe webhooks.';
