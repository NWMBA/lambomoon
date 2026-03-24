-- LamboMoon Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add columns to existing profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interested_categories TEXT[];

-- Create cryptos table (if not exists)
CREATE TABLE IF NOT EXISTS cryptos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coingecko_id TEXT UNIQUE,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    contract_address TEXT,
    category TEXT,
    launch_date TIMESTAMPTZ,
    is_listed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tracked_cryptos table (uses coingecko_id for simplicity)
CREATE TABLE IF NOT EXISTS tracked_cryptos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    coingecko_id TEXT NOT NULL,
    entry_price NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, coingecko_id)
);

-- Create crypto_votes table
CREATE TABLE IF NOT EXISTS crypto_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crypto_id UUID REFERENCES cryptos(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vote_type TEXT CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crypto_id, user_id)
);

-- Enable RLS on new tables
ALTER TABLE cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read cryptos" ON cryptos FOR SELECT USING (true);
CREATE POLICY "Users manage own tracked" ON tracked_cryptos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own votes" ON crypto_votes FOR ALL USING (auth.uid() = user_id);