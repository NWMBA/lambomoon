-- Upvotes only: one upvote per user per crypto
CREATE TABLE IF NOT EXISTS crypto_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coingecko_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, coingecko_id)
);

ALTER TABLE crypto_upvotes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'crypto_upvotes' AND policyname = 'Anyone can read upvotes'
    ) THEN
        CREATE POLICY "Anyone can read upvotes" ON crypto_upvotes FOR SELECT USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'crypto_upvotes' AND policyname = 'Users manage own upvotes'
    ) THEN
        CREATE POLICY "Users manage own upvotes" ON crypto_upvotes FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;
