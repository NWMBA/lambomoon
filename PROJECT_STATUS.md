# LamboMoon Project Status

**Last updated:** 2026-03-23 17:03

## Current Status

✅ **DEPLOYED** - https://lambomoon.io

### Completed Features
- Landing page with sorting (Trending/Newest/Most Upvoted)
- Category filters
- Project detail pages with CoinGecko data
- Track button on detail pages
- `/movers` - biggest movers table
- `/trending` - trending projects
- `/about` - about page
- `/submit` - submit project page
- `/profile` - user profile editor
- `/dashboard` - tracked cryptos & votes
- Supabase auth integration

### In Progress
- Database schema - tables partially exist (profiles table already created)

### Next Steps
1. Run ALTER script to add missing columns to existing tables
2. Test auth flow

---

## Database Status

⚠️ **Issue:** Running migration gave error "relation profiles already exists"

**Solution:** Run this ALTER script instead (adds missing columns to existing tables):

```sql
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

-- Create tracked_cryptos table
CREATE TABLE IF NOT EXISTS tracked_cryptos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    crypto_id UUID REFERENCES cryptos(id) ON DELETE CASCADE,
    entry_price NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, crypto_id)
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

-- Enable RLS
ALTER TABLE cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_cryptos ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can read cryptos" ON cryptos FOR SELECT USING (true);
CREATE POLICY "Users manage own tracked" ON tracked_cryptos FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own votes" ON crypto_votes FOR ALL USING (auth.uid() = user_id);
```

---

## Routes

| Route | Status |
|-------|--------|
| / | ✅ Static |
| /about | ✅ Static |
| /movers | ✅ Static |
| /trending | ✅ Static |
| /submit | ✅ Dynamic |
| /profile | ✅ Static |
| /dashboard | ✅ Static |
| /project/[id] | ✅ Dynamic |
| /login | ✅ Static |

---

## Files Created This Session

- `src/app/profile/page.tsx` - Profile editor
- `src/app/dashboard/page.tsx` - User dashboard
- `supabase/migrations/001_initial_schema.sql` - Full schema (use ALTER version above)
---

## Update - 2026-03-24

### Newly Completed
- Global shared navbar deployed across pages
- Homepage curation pass completed
- Detail pages made more editorial
- Boost system added (replacing upvote wording)
- Dashboard improved with tracked crypto market data
- Ingestion scaffolding created:
  - CoinGecko import
  - CryptoRank upcoming adapter
  - CoinLaunch adapter
  - manual watchlist adapter
  - merge pipeline
- Import-to-database mapping prepared
- Re-entry SQL batch checklist prepared

### Pending Supabase Batch
Run when back at computer:
- `supabase/migrations/003_profile_socials.sql`
- `supabase/migrations/004_crypto_comments.sql`
- `supabase/migrations/005_crypto_ingest_fields.sql`

### Ready After SQL
- profile avatars + socials
- crypto comments
- import merged universe into `cryptos`
- verify full import pipeline
