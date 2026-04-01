-- Agent-originated signals on projects
CREATE TABLE IF NOT EXISTS agent_project_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  project_id UUID REFERENCES cryptos(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  weight NUMERIC NOT NULL DEFAULT 1,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_project_signals_type_check CHECK (signal_type IN ('watch', 'boost', 'high_conviction', 'needs_review', 'low_confidence')),
  CONSTRAINT agent_project_signals_unique UNIQUE (agent_id, project_id, signal_type)
);

CREATE INDEX IF NOT EXISTS idx_agent_project_signals_project_id ON agent_project_signals(project_id);
CREATE INDEX IF NOT EXISTS idx_agent_project_signals_agent_id ON agent_project_signals(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_project_signals_type_created_at ON agent_project_signals(signal_type, created_at DESC);

ALTER TABLE agent_project_signals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_project_signals' AND policyname = 'Owners can view own agent signals'
  ) THEN
    CREATE POLICY "Owners can view own agent signals"
      ON agent_project_signals FOR SELECT
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;
