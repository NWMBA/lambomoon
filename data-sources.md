# LamboMoon Data Sources

Research on APIs and data sources to differentiate from CoinGecko. Last updated: 2026-03-22.

## Why This Matters

CoinGecko has great price/market data. LamboMoon needs *curation + discovery* to be Product Hunt for crypto, not just a reskin. These sources add the "gem hunting" value.

---

## Recommended Data Sources

### 1. CoinGecko (Already)
- **Use for:** Prices, market cap, volume, basic coin metadata
- **Tier:** Free (generous)
- **Status:** Ready to integrate

### 2. On-Chain / Whale Data
| API | What It Gives | Free Tier |
|-----|---------------|-----------|
| Glassnode | Active addresses, TVL, whale transactions | Limited |
| Amberdata | Wallet flows, whale alerts, DeFi metrics | Limited |
| DeFi Llama | TVL by chain, protocol rankings | Full free |

### 3. Social / Sentiment
| API | What It Gives | Free Tier |
|-----|---------------|-----------|
| CoinPaprika | Twitter/X sentiment, social metrics | Limited |
| LunarCrush | Social mentions, influencer tracking | Limited |
| Cryptopanic | News aggregator / sentiment | Generous |

### 4. Launchpads / IDOs / Airdrops
| API | What It Gives | Free Tier |
|-----|---------------|-----------|
| CryptoRank | IDO/IEO calendar, airdrop tracking | Generous |
| CoinLaunch | Launchpad rankings, upcoming sales | Limited |
| AirdropAlert | Airdrop calendar, task guides | Limited |

### 5. Fundamental / Revenue
| API | What It Gives | Free Tier |
|-----|---------------|-----------|
| Token Terminal | Revenue, DAU, tokenomics data | Generous |
| Messari | Fundamental analysis (paid-heavy) | Very limited |
| Nansen | On-chain labels (paid) | None |

---

## Priority for MVP

**Phase 1 (MVP):**
- CoinGecko (already)
- DeFi Llama (TVL data is free and valuable)
- CryptoRank (launchpad/IDO calendar)

**Phase 2 (V2):**
- CoinPaprika (social)
- Token Terminal (fundamentals)

**Phase 3 (Pro):**
- Glassnode or Amberdata
- Custom whale alerts

---

## Notes

- Many APIs require API keys —Nathan will need to sign up
- CryptoRank and DeFi Llama look most promising for free tiers
- The "launchpad/IDO tracking" is what Product Hunt for crypto really needs — that's where the "gem" discovery happens

---

*Task: Research data sources — COMPLETE*