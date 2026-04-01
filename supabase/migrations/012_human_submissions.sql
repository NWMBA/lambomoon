-- Human-originated discovery submissions, unified with moderation workflow
CREATE TABLE IF NOT EXISTS human_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'new_project',
  project_slug TEXT,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT human_submissions_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review'))
);

CREATE INDEX IF NOT EXISTS idx_human_submissions_user_id ON human_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_human_submissions_status_created_at ON human_submissions(status, created_at DESC);

ALTER TABLE human_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'human_submissions' AND policyname = 'Users can view own human submissions'
  ) THEN
    CREATE POLICY "Users can view own human submissions"
      ON human_submissions FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'human_submissions' AND policyname = 'Users can insert own human submissions'
  ) THEN
    CREATE POLICY "Users can insert own human submissions"
      ON human_submissions FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
