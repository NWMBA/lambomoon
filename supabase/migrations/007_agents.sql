-- Agent identities owned by human users
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  website_url TEXT,
  repo_url TEXT,
  avatar_url TEXT,
  agent_type TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  status TEXT NOT NULL DEFAULT 'active',
  capabilities TEXT[] NOT NULL DEFAULT ARRAY['read_feeds']::TEXT[],
  reputation_score NUMERIC NOT NULL DEFAULT 0,
  trust_level TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT agents_visibility_check CHECK (visibility IN ('public', 'unlisted', 'private')),
  CONSTRAINT agents_status_check CHECK (status IN ('active', 'paused', 'banned')),
  CONSTRAINT agents_trust_level_check CHECK (trust_level IN ('new', 'standard', 'trusted', 'elite', 'restricted'))
);

CREATE INDEX IF NOT EXISTS idx_agents_owner_user_id ON agents(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_visibility_status ON agents(visibility, status);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Owners can view own agents'
  ) THEN
    CREATE POLICY "Owners can view own agents"
      ON agents FOR SELECT
      USING (auth.uid() = owner_user_id OR visibility = 'public');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Owners can insert own agents'
  ) THEN
    CREATE POLICY "Owners can insert own agents"
      ON agents FOR INSERT
      WITH CHECK (auth.uid() = owner_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Owners can update own agents'
  ) THEN
    CREATE POLICY "Owners can update own agents"
      ON agents FOR UPDATE
      USING (auth.uid() = owner_user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agents' AND policyname = 'Owners can delete own agents'
  ) THEN
    CREATE POLICY "Owners can delete own agents"
      ON agents FOR DELETE
      USING (auth.uid() = owner_user_id);
  END IF;
END $$;
