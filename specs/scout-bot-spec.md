# Scout Bot Spec

## Mission
Scout discovers, normalizes, and ranks crypto projects for LamboMoon.

It should not try to fully curate every project.
It should maximize signal collection and clean ingestion.

---

## Inputs

### Source Inputs

#### Listed Coin Sources
- CoinGecko `/coins/list`
- CoinGecko `/coins/markets`
- CoinGecko per-coin metadata for selected assets

#### Discovery Sources
- CryptoRank
- CoinLaunch
- launchpad calendars
- airdrop trackers
- ecosystem grant / watch pages

#### Manual / Admin Inputs
- curated additions
- tag overrides
- thesis overrides
- risk overrides

---

## Output Schema

Each discovered project should normalize into this shape:

```ts
{
  source: string,
  source_url?: string,
  coingecko_id?: string | null,
  name: string,
  symbol?: string,
  slug: string,
  status: "listed" | "upcoming" | "prelaunch" | "airdrop" | "testnet" | "watching",
  category?: string,
  ecosystem?: string,
  tags?: string[],
  website_url?: string,
  x_url?: string,
  telegram_url?: string,
  discord_url?: string,
  docs_url?: string,
  contract_address?: string,
  launch_date?: string | null,
  first_seen_at: string,
  confidence_score: number,
  notes?: string,
}
```

---

## Required Responsibilities

### 1. Discover
Fetch from all configured sources.

### 2. Normalize
Normalize:
- names
- symbols
- URLs
- categories
- status labels

### 3. Dedupe
Deduplicate using:
1. `coingecko_id`
2. website URL
3. x_url
4. telegram_url
5. slugified name + symbol

### 4. Assign Confidence
Suggested rough scoring:
- 1.0 = CoinGecko listed asset
- 0.8 = reputable discovery source with strong metadata
- 0.6 = partial source with good links
- 0.4 = weak / incomplete signal
- 0.2 = rumor / low confidence

### 5. Flag Curatable Projects
Scout should flag projects that are especially worth human/community attention:
- recent discovery
- high social proof
- unusual category
- strong ecosystem narrative
- upcoming launch

---

## Non-Goals

Scout should **not**:
- invent token data
- overwrite curated thesis without human intent
- assume every discovery is high quality
- assume every coin is worth surfacing equally

---

## Success Criteria

Scout is successful if it produces:
- large indexed universe
- clean normalized records
- deduplicated project list
- useful source metadata
- good candidates for community boosting and curation

---

## Recommended Future Enhancements

- source weighting by trust
- auto-tagging by NLP / rules
- duplicate merge suggestions
- launch-date confidence levels
- ecosystem clustering
- anomaly detection for suspicious projects
