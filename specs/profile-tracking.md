# LamboMoon Profile & Crypto Tracking Feature

## Overview

Add user profiles and crypto tracking capabilities to LamboMoon using Supabase.

---

## Database Schema

### Tables

```sql
-- All cryptocurrencies (both listed + pre-launch)
CREATE TABLE cryptos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly (e.g., 'virtual-protocol')
  category TEXT, -- DeFi, AI/Agents, L1, L2, Meme, NFT, Gaming, RWA, Infrastructure
  description TEXT,
  website_url TEXT,
  discord_url TEXT,
  twitter_url TEXT,
  expected_launch DATE, -- for pre-launch tokens
  launch_status TEXT DEFAULT 'pre-launch', -- 'pre-launch', 'launched', 'dead'
  tokenomics TEXT, -- supply, allocation notes
  added_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  interested_categories TEXT[], -- e.g., ['AI/Agents', 'DeFi', 'L1']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User's tracked cryptocurrencies (any crypto, listed or unlisted)
CREATE TABLE tracked_cryptos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  crypto_id UUID REFERENCES cryptos(id) ON DELETE CASCADE NOT NULL,
  entry_price NUMERIC,      -- User's buy price
  quantity NUMERIC,         -- Amount bought
  date_bought DATE,          -- When they bought
  notes TEXT,               -- Personal notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, crypto_id)
);
```

---

## API Endpoints

### Cryptos (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cryptos` | List all cryptos (with optional filters: category, status) |
| POST | `/api/cryptos` | Add a new crypto (any user) |
| GET | `/api/cryptos/[slug]` | Get single crypto details |
| PUT | `/api/cryptos/[slug]` | Update crypto (creator only) |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get current user's profile |
| PUT | `/api/profile` | Update profile (username, display_name, bio, avatar_url, interested_categories) |

### Tracked Cryptos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracked` | Get user's tracked cryptos with live prices |
| POST | `/api/tracked` | Track a crypto (entry_price, quantity, date_bought, notes) |
| PUT | `/api/tracked/[id]` | Update tracking (entry_price, quantity, date_bought, notes) |
| DELETE | `/api/tracked/[id]` | Stop tracking |

---

## UI Wireframe

### Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────┐
│  🔓 Sign Out          👤 nathan_holder                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────────────────┐ │
│  │ 👤 My Profile   │  │ 📈 My Tracked Cryptos (4)    │ │
│  │                 │  │  + Add Crypto                │ │
│  │ Username: nathan│  ├─────────────────────────────┤ │
│  │ Bio: HODLing... │  │ 🟢 BTC  $67,432  +2.3%       │ │
│  │                 │  │    Entry: $65,000  PnL: +3.7% │ │
│  │ Categories:     │  │                             │ │
│  │ [AI] [DeFi]     │  │ 🔵 ETH  $3,521   -1.2%       │ │
│  │                 │  │    Entry: --    Notes: --    │ │
│  │ [Edit Profile]  │  │                             │ │
│  └─────────────────┘  │ [Edit] [X]                   │ │
│                      └───────────────────────────────┘ │
│  Quick Stats:                                       │
│  Total PnL: +$1,243 (+2.1%)                          │
│  24h: +$89  |  Best: PEPE +12%                       │
└─────────────────────────────────────────────────────────┘
```

### Add Crypto Modal

```
┌─────────────────────────────────────┐
│  + Add Crypto to Track        ✕     │
├─────────────────────────────────────┤
│  Search: [________________] 🔍      │
│                                     │
│  Results:                           │
│  ┌───────────────────────────────┐  │
│  │ 🟡 Bitcoin      BTC    $67,432│  │
│  ├───────────────────────────────┤  │
│  │ 🟠 Ethereum     ETH    $3,521 │  │
│  └───────────────────────────────┘  │
│                                     │
│  Entry Price (optional): [________] │
│  Notes: [______________________]    │
│                                     │
│  [Cancel]        [Add to Track]     │
└─────────────────────────────────────┘
```

### Edit Profile Modal

```
┌─────────────────────────────────────┐
│  ✏️ Edit Profile            ✕       │
├─────────────────────────────────────┤
│  Avatar: [Upload or URL]            │
│                                     │
│  Username: [______________] *        │
│  Display Name: [____________]        │
│                                     │
│  Bio:                               │
│  [______________________________]   │
│                                     │
│  Interested Categories:              │
│  ☑ AI/Agents  ☑ DeFi  ☐ L1  ☐ Meme  │
│                                     │
│  [Cancel]        [Save Profile]     │
└─────────────────────────────────────┘
```

---

## User Flows

### 1. First Signup Flow

1. User clicks "Sign Up" on `/login`
2. Enters email/password → submits
3. **New:** After email confirmation (or direct), prompt for username
4. Create profile with username → redirect to `/dashboard`
5. If signup is instant (email confirmation disabled), create profile on first login callback

### 2. Track a Crypto Flow

1. User clicks "+ Add Crypto" on dashboard
2. Search modal opens → search by name/symbol
3. Select crypto → optionally enter entry price & notes
4. Click "Add to Track" → saved to `tracked_cryptos`
5. Dashboard updates with new entry + live price

### 3. View/Edit Tracked Crypto

1. Dashboard shows all tracked cryptos with live prices
2. Click "Edit" → modal opens with entry_price, quantity, date_bought, notes fields
3. Update → saves to database
4. PnL calculated: `((current_price - entry_price) / entry_price) * 100`

### 4. Add Pre-launch Crypto Flow

1. User clicks "+ Add Crypto" on main page or dashboard
2. Form opens:
   - Name (required): "Virtual Protocol"
   - Symbol (required): "VIRTUAL"
   - Category (required): dropdown → "AI/Agents"
   - Description: text area
   - Website/Discord/Twitter: URL fields
   - Expected Launch: date picker
   - Tokenomics: text area
3. Submit → saved as `launch_status = 'pre-launch'`
4. Appears in "Pre-launch" section
5. Creator can update status to 'launched' once live

---

## Launch Status Flow

```
Pre-launch → [Manual update by creator] → Launched
    ↓
  [Admin/creator can mark as] → Dead (if project failed)
```

---

## Implementation Notes

- Use Supabase RLS (Row Level Security): users can only see/edit their own profiles and tracked cryptos
- Enable RLS on both tables
- Add function to auto-create profile on auth.users insert trigger (or handle in signup flow)
- Reuse existing CoinGecko API for live prices (already integrated at `/api/prices`)
- Categories: derive from existing categories in seed data

---

## MVP Scope

**Do first:**
- [ ] Database tables (cryptos, profiles, tracked_cryptos)
- [ ] RLS policies
- [ ] Add new crypto form (pre-launch support)
- [ ] Edit profile UI + API
- [ ] Add/remove tracked crypto UI + API (any crypto)
- [ ] Dashboard page showing tracked cryptos with prices + PnL
- [ ] Update signup to create profile

**Later:**
- Avatar upload to Supabase Storage
- Portfolio totals/PnL aggregation
- Alerts/notifications when tracked crypto launches
- Social profiles (share my tracked list)