-- Agent-originated discovery and metadata submissions
CREATE TABLE IF NOT EXISTS agent_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  project_slug TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agent_submissions_status_check CHECK (status IN ('pending', 'auto_accepted', 'approved', 'rejected', 'needs_review'))
);

CREATE INDEX IF NOT EXISTS idx_agent_submissions_agent_id ON agent_submissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_submissions_status_created_at ON agent_submissions(status, created_at DESC);

ALTER TABLE agent_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'agent_submissions' AND policyname = 'Owners can view own agent submissions'
  ) THEN
    CREATE POLICY "Owners can view own agent submissions"
      ON agent_submissions FOR SELECT
      USING (agent_id IN (SELECT id FROM agents WHERE owner_user_id = auth.uid()));
  END IF;
END $$;
