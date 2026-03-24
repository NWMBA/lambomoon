-- Profile, Crypto, and Tracking tables for LamboMoon

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- All cryptocurrencies (both listed + pre-launch)
CREATE TABLE IF NOT EXISTS cryptos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT, -- DeFi, AI/Agents, L1, L2, Meme, NFT, Gaming, RWA, Infrastructure
  description TEXT,
  website_url TEXT,
  discord_url TEXT,
  twitter_url TEXT,
  expected_launch DATE,
  launch_status TEXT DEFAULT 'pre-launch' CHECK (launch_status IN ('pre-launch', 'launched', 'dead')),
  tokenomics TEXT,
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  interested_categories TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's tracked cryptocurrencies (any crypto, listed or unlisted)
CREATE TABLE IF NOT EXISTS tracked_cryptos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  crypto_id UUID REFERENCES cryptos(id) ON DELETE CASCADE NOT NULL,
  entry_price NUMERIC,
  quantity NUMERIC,
  date_bought DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, crypto_id)
);

-- Enable RLS
ALTER TABLE cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_cryptos ENABLE ROW LEVEL SECURITY;

-- RLS policies for cryptos (public read, auth write)
CREATE POLICY "Anyone can view cryptos" ON cryptos FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert cryptos" ON cryptos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update cryptos they added" ON cryptos FOR UPDATE USING (auth.uid() = added_by);
CREATE POLICY "Users can delete their cryptos" ON cryptos FOR DELETE USING (auth.uid() = added_by);

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS policies for tracked_cryptos
CREATE POLICY "Users can view their own tracked cryptos" ON tracked_cryptos FOR SELECT USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));
CREATE POLICY "Users can insert their own tracked cryptos" ON tracked_cryptos FOR INSERT WITH CHECK (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));
CREATE POLICY "Users can update their own tracked cryptos" ON tracked_cryptos FOR UPDATE USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));
CREATE POLICY "Users can delete their own tracked cryptos" ON tracked_cryptos FOR DELETE USING (user_id IN (SELECT id FROM profiles WHERE auth.uid() = id));

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, interested_categories)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cryptos_category ON cryptos(category);
CREATE INDEX IF NOT EXISTS idx_cryptos_status ON cryptos(launch_status);
CREATE INDEX IF NOT EXISTS idx_cryptos_slug ON cryptos(slug);
CREATE INDEX IF NOT EXISTS idx_tracked_cryptos_user_id ON tracked_cryptos(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_cryptos_crypto_id ON tracked_cryptos(crypto_id);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);