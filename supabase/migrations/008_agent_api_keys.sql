-- API keys for machine agents
CREATE TABLE IF NOT EXISTS agent_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_api_keys_status_check CHECK (status IN ('active', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_agent_api_keys_agent_id ON agent_api_keys(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_key_prefix ON agent_api_keys(key_prefix);

ALTER TABLE agent_api_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agent_api_keys' AND policyname = 'Owners can view own agent keys'
  ) THEN
    CREATE POLICY "Owners can view own agent keys"
      ON agent_api_keys FOR SELECT
      USING (
        agent_id IN (
          SELECT id FROM agents WHERE owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agent_api_keys' AND policyname = 'Owners can insert own agent keys'
  ) THEN
    CREATE POLICY "Owners can insert own agent keys"
      ON agent_api_keys FOR INSERT
      WITH CHECK (
        agent_id IN (
          SELECT id FROM agents WHERE owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agent_api_keys' AND policyname = 'Owners can update own agent keys'
  ) THEN
    CREATE POLICY "Owners can update own agent keys"
      ON agent_api_keys FOR UPDATE
      USING (
        agent_id IN (
          SELECT id FROM agents WHERE owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;
