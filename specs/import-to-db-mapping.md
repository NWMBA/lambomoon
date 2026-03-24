# Import to Database Mapping

## Goal
Take `data/imports/universe-merged.json` and map it cleanly into Supabase so LamboMoon can store a broad indexed universe while preserving community features on top.

---

## Recommended Table Strategy

### Primary table: `cryptos`
This should become the canonical indexed project universe.

Recommended columns:
- `id` UUID PK
- `coingecko_id` TEXT NULL UNIQUE
- `name` TEXT NOT NULL
- `symbol` TEXT
- `slug` TEXT UNIQUE
- `status` TEXT
- `source` TEXT
- `source_url` TEXT
- `category` TEXT
- `ecosystem` TEXT
- `tags` TEXT[]
- `website_url` TEXT
- `x_url` TEXT
- `telegram_url` TEXT
- `discord_url` TEXT
- `docs_url` TEXT
- `contract_address` TEXT
- `launch_date` TIMESTAMPTZ NULL
- `first_seen_at` TIMESTAMPTZ
- `confidence_score` NUMERIC
- `notes` TEXT
- `price_usd` NUMERIC NULL
- `market_cap` NUMERIC NULL
- `fdv` NUMERIC NULL
- `volume_24h` NUMERIC NULL
- `price_change_24h` NUMERIC NULL
- `price_change_7d` NUMERIC NULL
- `market_cap_rank` INTEGER NULL
- `circulating_supply` NUMERIC NULL
- `total_supply` NUMERIC NULL
- `max_supply` NUMERIC NULL
- `created_at` TIMESTAMPTZ DEFAULT NOW()
- `updated_at` TIMESTAMPTZ DEFAULT NOW()

---

## Upsert Rules

### Unique identity priority
Use this logic when importing:
1. `coingecko_id` if present
2. else `slug`
3. optionally later: website / x_url based duplicate detection before import

### Upsert behavior
- do not wipe richer existing values with empty incoming values
- prefer incoming market data for numeric market fields
- prefer existing manually curated fields if they already exist later (thesis, risk, etc.)
- merge tags instead of replacing blindly

---

## Field Mapping

From `NormalizedCryptoRecord` to `cryptos`:

- `source` -> `source`
- `source_url` -> `source_url`
- `coingecko_id` -> `coingecko_id`
- `name` -> `name`
- `symbol` -> `symbol`
- `slug` -> `slug`
- `status` -> `status`
- `category` -> `category`
- `ecosystem` -> `ecosystem`
- `tags` -> `tags`
- `website_url` -> `website_url`
- `x_url` -> `x_url`
- `telegram_url` -> `telegram_url`
- `discord_url` -> `discord_url`
- `docs_url` -> `docs_url`
- `contract_address` -> `contract_address`
- `launch_date` -> `launch_date`
- `first_seen_at` -> `first_seen_at`
- `confidence_score` -> `confidence_score`
- `notes` -> `notes`
- `market.price_usd` -> `price_usd`
- `market.market_cap` -> `market_cap`
- `market.fdv` -> `fdv`
- `market.volume_24h` -> `volume_24h`
- `market.price_change_24h` -> `price_change_24h`
- `market.price_change_7d` -> `price_change_7d`
- `market.market_cap_rank` -> `market_cap_rank`
- `market.circulating_supply` -> `circulating_supply`
- `market.total_supply` -> `total_supply`
- `market.max_supply` -> `max_supply`

---

## Import Flow

1. generate `coingecko-normalized.json`
2. generate / refresh upcoming source files
3. run `merge:universe`
4. validate merged records
5. upsert into `cryptos`
6. later derive app views from `cryptos` + community tables

---

## Validation Checks

Before insert:
- `name` required
- `slug` required
- `status` required
- `confidence_score` required

Soft warnings:
- missing symbol
- missing website
- missing category
- missing source_url

---

## Why this structure works

This keeps:
- ingestion broad
- source provenance visible
- status visible (`listed`, `upcoming`, etc.)
- community systems separate (`crypto_upvotes`, comments, tracked_cryptos)

That separation is important:
- `cryptos` = indexed universe
- `boosts/comments/tracking` = community layer
