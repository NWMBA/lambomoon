CREATE TABLE IF NOT EXISTS crypto_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coingecko_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crypto_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'crypto_comments' AND policyname = 'Anyone can read comments'
    ) THEN
        CREATE POLICY "Anyone can read comments" ON crypto_comments FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'crypto_comments' AND policyname = 'Users manage own comments'
    ) THEN
        CREATE POLICY "Users manage own comments" ON crypto_comments FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
