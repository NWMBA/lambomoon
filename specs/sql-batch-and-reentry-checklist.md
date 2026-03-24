# SQL Batch + Re-entry Checklist

## Goal
When Nathan is back at a computer, run one coordinated Supabase batch, then immediately verify the app features that depend on it.

---

## SQL Batch Order
Run these in this order.

### 1. Profile socials / avatar
File:
- `supabase/migrations/003_profile_socials.sql`

Why:
- enables avatar selection
- enables X / Telegram / Website fields

### 2. Crypto comments
File:
- `supabase/migrations/004_crypto_comments.sql`

Why:
- enables project detail page comments
- enables social discussion layer

### 3. Crypto ingest fields
File:
- `supabase/migrations/005_crypto_ingest_fields.sql`

Why:
- expands `cryptos` table for indexed universe import
- enables source/status/confidence/market fields

---

## After SQL: Immediate Verification

### Profile page
Check:
- avatar selector saves
- X link saves
- Telegram link saves
- Website link saves
- bio + username still save correctly

### Crypto detail page
Check:
- comments can post
- comments render correctly
- avatar / username appear in comments
- Boost still works
- Track still works

### Dashboard
Check:
- tracked cryptos still render
- market data still renders
- recent boosts still render

---

## Import Pipeline Re-entry Steps

### 1. Refresh listed universe
Run:
```bash
npm run import:coingecko
```

### 2. Merge listed + upcoming + manual
Run:
```bash
npm run merge:universe
```

### 3. Import merged universe into Supabase
Run:
```bash
npm run import:universe
```

---

## After Import: App Verification

### Homepage
Check:
- source/status labels still display correctly
- cards still render
- curated sections still render
- no broken layout from larger dataset

### Search / browse
Check:
- search works with larger dataset
- category filtering still works
- sort modes still work (`Trending`, `Newest`, `Most Boosted`)

### Detail pages
Check:
- imported coins have usable pages
- missing fields degrade gracefully

---

## Known Risks to Watch

### 1. Duplicate records
If duplicate projects show up after import:
- review dedupe rules
- compare website/x/slug identity collisions

### 2. Weak category coverage
Some imported records may lack category or ecosystem.
That is acceptable at first, but should be flagged for later enrichment.

### 3. Missing source labels
Upcoming / manual / imported records should retain source metadata after import.

### 4. Sparse detail pages
Imported records without enough metadata may look thin. That is okay initially if the page still loads cleanly.

---

## Post-Re-entry Best Next Steps

Once SQL + import succeed:
1. expand CoinGecko ingest size
2. enrich upcoming source files
3. add another discovery adapter
4. evaluate cron setup
5. surface source/status more broadly in UI

---

## Nice-to-Have Follow-up
Prepare one admin page later for:
- review imported records
- edit status
- add thesis/risk/tags
- promote to curated layer

That would turn the indexed universe into a real curation workflow.
