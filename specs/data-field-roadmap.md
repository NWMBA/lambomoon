# LamboMoon Data Field Roadmap

## Goal
Make LamboMoon more valuable than a plain price directory by combining market data, community curation, freshness, and narrative context.

---

## Recommended Field Schema

### Market / Core
These are mostly sourced from CoinGecko or similar APIs.

- `price_usd`
- `market_cap`
- `fdv`
- `volume_24h`
- `price_change_24h`
- `price_change_7d`
- `market_cap_rank`
- `circulating_supply`
- `total_supply`
- `max_supply`

### Community / Curation
These are the core LamboMoon differentiators.

- `boost_count`
- `trending_score`
- `boost_velocity_24h`
- `boost_velocity_7d`
- `watchlist_count`
- `comment_count`
- `first_seen_at`
- `submitted_at`
- `recent_activity_score`

### Narrative / Discovery
These help users understand *why* the project matters.

- `project_stage` (`live`, `prelaunch`, `testnet`, `presale`)
- `thesis`
- `risk_level`
- `category`
- `subcategory`
- `tags`
- `ecosystem`
- `token_type`
- `use_case`
- `launch_date`

### Trust / Social
- `website_url`
- `x_url`
- `telegram_url`
- `discord_url`
- `docs_url`
- `github_url`
- `team_public`
- `backers`
- `launchpad`
- `audit_status`
- `auditor_name`

### Tokenomics / On-chain (later)
- `unlock_date`
- `unlock_schedule_summary`
- `vesting_summary`
- `insider_allocation`
- `community_allocation`
- `treasury_allocation`
- `emission_rate`
- `staking_available`
- `staking_yield`
- `holder_count`
- `whale_wallet_count`
- `top_10_holder_pct`
- `dex_liquidity_usd`
- `smart_money_inflow_score`

---

## Source Map

### CoinGecko
Best for:
- `price_usd`
- `market_cap`
- `fdv`
- `volume_24h`
- `price_change_24h`
- `price_change_7d`
- `market_cap_rank`
- `circulating_supply`
- `total_supply`
- `max_supply`
- `website_url`
- some social links

### LamboMoon Database / Community
Best for:
- `boost_count`
- `trending_score`
- `boost_velocity_24h`
- `boost_velocity_7d`
- `watchlist_count`
- `comment_count`
- `first_seen_at`
- `submitted_at`
- `thesis`
- `risk_level`
- `project_stage`
- `tags`
- `category`
- `ecosystem`

### Manual Curation / Admin
Best for:
- `thesis`
- `risk_level`
- `project_stage`
- `subcategory`
- `token_type`
- `use_case`
- `backers`
- `launchpad`
- `audit_status`
- `auditor_name`

### Later Integrations
Potential later sources:
- DefiLlama
- Dune
- Arkham / Nansen-like wallet intelligence
- Token unlock datasets
- launchpad APIs

---

## Priority Order

### Phase 1 — Highest Value / Lowest Complexity
Implement first.

1. `boost_count`
2. `trending_score`
3. `comment_count`
4. `price_change_7d`
5. `fdv`
6. `market_cap_rank`
7. `first_seen_at`

### Phase 2 — Discovery Context

1. `project_stage`
2. `thesis`
3. `risk_level`
4. `tags`
5. `ecosystem`
6. `website_url`
7. `x_url`
8. `contract_address`

### Phase 3 — Serious Research Layer

1. `unlock_date`
2. `audit_status`
3. `holder_count`
4. `liquidity_usd`
5. `smart_money_inflow_score`

---

## Implementation Notes

### Prefer Derived Metrics Where Possible
Do not store everything.

Derived at query time where possible:
- `boost_count`
- `trending_score`
- `comment_count`
- `boost_velocity_24h`
- `boost_velocity_7d`

### Trending Formula
Current recommended formula:

`trending_score = boost_count / POWER(hours_since_created + 2, 1.5)`

Later upgrade path:
Per-boost time decay using vote timestamps.

### Product Positioning
The product should feel like:
- Product Hunt for crypto
- but with market context
- and community conviction
- not just a CoinGecko clone

That means the most important long-term fields are:
- `boost_count`
- `trending_score`
- `first_seen_at`
- `project_stage`
- `thesis`
- `risk_level`
- `comment_count`
- `watchlist_count`
