# LamboMoon Population Strategy

## Goal
Build a crypto universe that is broad enough to feel comprehensive, but curated enough to feel valuable.

Core principle:
**Index broadly, curate selectively.**

---

## Two-Layer Model

### 1. Indexed Universe
This is the broad dataset.

Contains:
- listed cryptos
- recently launched cryptos
- upcoming / prelaunch projects
- lower-confidence discoveries

Purpose:
- searchable coverage
- large inventory
- basis for claiming broad tracking coverage

### 2. Curated Layer
This is the high-signal layer.

Contains:
- boosted projects
- featured projects
- manually curated projects
- projects with thesis / tags / risk level
- projects with strong community activity

Purpose:
- discovery
- differentiation
- trust
- Product Hunt for crypto feel

---

## Population Phases

### Phase 1 — Fast Scale
Goal: get enough breadth to make the directory feel alive.

Sources:
- CoinGecko bulk coin list
- CoinGecko market endpoints

Target:
- 1000–2500 indexed listed coins

Output:
- searchable universe
- basic price + market metadata
- enough breadth for homepage claims like "thousands indexed"

### Phase 2 — Discovery Layer
Goal: go beyond listed assets.

Sources:
- CryptoRank
- CoinLaunch
- launchpad sites
- airdrop calendars
- ecosystem watchlists

Target:
- 100–300 upcoming / prelaunch projects

Output:
- future-facing discovery layer
- better "find it before it runs" positioning

### Phase 3 — Curation Flywheel
Goal: let product behavior determine what matters.

Signals:
- boosts
- comments
- watchlists
- recent momentum
- curator picks

Output:
- trending score
- featured lists
- community-led relevance

---

## Dedupe Strategy

Deduplicate in this order:
1. `coingecko_id`
2. exact website URL
3. exact X/Twitter URL
4. exact Telegram URL
5. slugified name + symbol

If multiple sources disagree:
- prefer CoinGecko for market fields
- prefer discovery sources for upcoming / launch metadata
- prefer manual curation for thesis / risk / tags

---

## Status Taxonomy

Recommended statuses:
- `listed`
- `upcoming`
- `prelaunch`
- `airdrop`
- `testnet`
- `watching`
- `archived`

These matter more than just category.

---

## Product Claims We Can Safely Use

Until ingestion is complete, avoid claiming all projects are deeply curated.

Safe wording:
- "Thousands of cryptos indexed"
- "Community-curated crypto discovery"
- "Track new and upcoming tokens"
- "Find early signals before they break out"

Avoid:
- "2500+ curated cryptos"
- anything implying deep manual review for the whole universe

---

## Recommended Next Implementation Order

1. bulk listed-coin ingest
2. upcoming/prelaunch ingest
3. dedupe pipeline
4. source confidence scoring
5. curated overlays (thesis, risk, tags)
6. community ranking layers
