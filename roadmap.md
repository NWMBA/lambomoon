# LamboMoon Roadmap

Updated 2026-03-24.

LamboMoon is becoming:
**Index broadly. Curate selectively. Boost the best.**

---

## Current State

### Live / Working
- Shared global navbar
- Homepage with curated discovery sections
- Boost system (Boost wording, milestones, trending logic)
- Crypto detail pages with editorial framing
- Dashboard with tracked crypto market data
- Profile page scaffold with avatar/social support in UI
- Comments UI on crypto pages (pending SQL activation)
- Multi-source ingestion scaffolding:
  - CoinGecko
  - CryptoRank upcoming
  - CoinLaunch
  - manual watchlist
- Merge pipeline for unified universe
- Import-to-database mapping prepared

### Pending batched Supabase work
- `003_profile_socials.sql`
- `004_crypto_comments.sql`
- `005_crypto_ingest_fields.sql`

---

## Immediate Priority Order

### 1. UI resilience for imported / incomplete records
Goal: make the product handle larger, messier real-world datasets gracefully.

Tasks:
- better fallback labels for missing category / source / status
- graceful missing description handling on detail pages
- clearer "still early / metadata coming" states
- resilient links block when websites / docs are missing
- imported-project-safe cards and detail page layouts

Status: **IN PROGRESS**

### 2. Curator / admin preview page
Goal: inspect merged universe before or alongside import.

Tasks:
- show source
- show status
- show confidence score
- show key links
- show whether record is thin / needs enrichment

Status: **NEXT**

### 3. More homepage discovery sections
Goal: make discovery feel richer and more intentional.

Tasks:
- Fresh Discovery
- Community Favorites
- Early But Rising
- Upcoming to Watch

Status: **QUEUED**

### 4. Cron prep
Goal: prepare background refresh jobs without enabling full automation too early.

Tasks:
- define source refresh cadence
- define merge cadence
- define import cadence
- prep job commands / outputs

Status: **QUEUED**

### 5. Copy / onboarding polish
Goal: clarify product positioning and user understanding.

Tasks:
- explain Boost clearly
- explain indexed vs curated
- tighten hero support copy
- improve trust framing

Status: **QUEUED**

---

## Ingestion Roadmap

### Foundation — Complete
- normalized schema
- dedupe helpers
- CoinGecko adapter
- CryptoRank adapter
- CoinLaunch adapter
- manual adapter
- merged universe output
- import mapping spec

### Next ingestion steps
1. improve confidence scoring
2. expand source metadata
3. enrich upcoming records
4. prepare DB import validation
5. test one-shot import after SQL batch
6. evaluate cron after import succeeds

---

## Product Direction

LamboMoon should feel like:
- Product Hunt for crypto
- with market context
- with community conviction
- with early discovery signals

Not:
- a CoinGecko clone
- a generic market tracker
- a social feed without signal

---

## Success Signals

We’re moving in the right direction if LamboMoon increasingly has:
- stronger editorial framing
- better community signal visibility
- broader indexed coverage
- clear source/status transparency
- smoother path from discovery to conviction
