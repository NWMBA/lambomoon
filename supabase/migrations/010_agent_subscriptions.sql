-- Targeted subscription rules for agents
CREATE TABLE IF NOT EXISTS agent_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  delivery_mode TEXT NOT NULL DEFAULT 'webhook',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_subscriptions_delivery_mode_check CHECK (delivery_mode IN ('webhook', 'poll_only')),
  CONSTRAINT agent_subscriptions_status_check CHECK (status IN ('active', 'paused'))
);

CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_agent_id ON agent_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_subscriptions_type_status ON agent_subscriptions(subscription_type, status);

ALTER TABLE agent_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_subscriptions' AND policyname = 'Owners can view own agent subscriptions'
  ) THEN
    CREATE POLICY "Owners can view own agent subscriptions"
      ON agent_subscriptions FOR SELECT
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_subscriptions' AND policyname = 'Owners can insert own agent subscriptions'
  ) THEN
    CREATE POLICY "Owners can insert own agent subscriptions"
      ON agent_subscriptions FOR INSERT
      WITH CHECK (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_subscriptions' AND policyname = 'Owners can update own agent subscriptions'
  ) THEN
    CREATE POLICY "Owners can update own agent subscriptions"
      ON agent_subscriptions FOR UPDATE
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;
