-- Webhook subscriptions and delivery logs for agents
CREATE TABLE IF NOT EXISTS agent_webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event_types TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_delivery_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_webhook_subscriptions_status_check CHECK (status IN ('active', 'paused', 'failing'))
);

CREATE TABLE IF NOT EXISTS agent_webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES agent_webhook_subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status_code INTEGER,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  response_excerpt TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_webhook_subscriptions_agent_id ON agent_webhook_subscriptions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_webhook_deliveries_subscription_id ON agent_webhook_deliveries(subscription_id);
CREATE INDEX IF NOT EXISTS idx_agent_webhook_deliveries_created_at ON agent_webhook_deliveries(created_at DESC);

ALTER TABLE agent_webhook_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_webhook_deliveries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_webhook_subscriptions' AND policyname = 'Owners can view own webhook subscriptions'
  ) THEN
    CREATE POLICY "Owners can view own webhook subscriptions"
      ON agent_webhook_subscriptions FOR SELECT
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_webhook_subscriptions' AND policyname = 'Owners can insert own webhook subscriptions'
  ) THEN
    CREATE POLICY "Owners can insert own webhook subscriptions"
      ON agent_webhook_subscriptions FOR INSERT
      WITH CHECK (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_webhook_subscriptions' AND policyname = 'Owners can update own webhook subscriptions'
  ) THEN
    CREATE POLICY "Owners can update own webhook subscriptions"
      ON agent_webhook_subscriptions FOR UPDATE
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_webhook_deliveries' AND policyname = 'Owners can view own webhook deliveries'
  ) THEN
    CREATE POLICY "Owners can view own webhook deliveries"
      ON agent_webhook_deliveries FOR SELECT
      USING (
        subscription_id IN (
          SELECT aws.id
          FROM agent_webhook_subscriptions aws
          JOIN agents a ON a.id = aws.agent_id
          WHERE a.owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;
