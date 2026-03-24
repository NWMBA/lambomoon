# Source Adapter Template

## Goal
Make it easy for Scout (or future ingestion work) to add new sources without creating one-off ingestion logic each time.

Every source adapter should:
1. fetch or receive source data
2. map it into `NormalizedCryptoRecord`
3. preserve `source` metadata
4. produce stable fields for dedupe + merge

---

## Required Output Shape

All adapters must output `NormalizedCryptoRecord` from:
- `src/lib/ingest/schema.ts`

This keeps CoinGecko, upcoming projects, launchpads, and future sources in one shared format.

---

## Minimal Adapter Pattern

### 1. Define raw source input type
Example:
```ts
export interface SomeSourceProject {
  name: string;
  symbol?: string;
  website_url?: string;
  x_url?: string;
  category?: string;
  launch_date?: string | null;
}
```

### 2. Create a mapper
```ts
export function mapSomeSourceToNormalized(project: SomeSourceProject): NormalizedCryptoRecord {
  return {
    source: "scout",
    coingecko_id: null,
    name: project.name,
    symbol: project.symbol?.toUpperCase(),
    slug: slugify(project.name),
    status: project.launch_date ? "upcoming" : "prelaunch",
    category: project.category,
    website_url: normalizeUrl(project.website_url),
    x_url: normalizeUrl(project.x_url),
    launch_date: project.launch_date || null,
    first_seen_at: new Date().toISOString(),
    confidence_score: 0.7,
  };
}
```

### 3. Run through adapter helper
```ts
const result = runAdapter("some-source", rawProjects, mapSomeSourceToNormalized);
```

---

## Required Adapter Responsibilities

Each adapter should decide:
- `source`
- `status`
- `confidence_score`
- normalized URLs
- canonical `slug`
- what metadata is trustworthy enough to include

---

## Confidence Guidelines

Suggested defaults:
- `1.0` → CoinGecko listed / fully reliable source
- `0.8` → reputable upcoming/discovery source
- `0.6` → decent but incomplete source
- `0.4` → weak metadata / partial discovery
- `0.2` → rumor / unverified / low confidence

---

## Recommended Future Adapters

Priority order:
1. CryptoRank upcoming adapter
2. CoinLaunch adapter
3. launchpad-specific adapter
4. airdrop tracker adapter
5. manual / admin import adapter

---

## Merge Rules Reminder

Adapters do not dedupe themselves.
They produce normalized records.
Dedupe happens later using:
1. `coingecko_id`
2. website
3. x_url
4. telegram_url
5. name + symbol slug combo

---

## Practical Scout Workflow

Scout should be able to:
1. fetch raw source data
2. run source adapter
3. save normalized output
4. merge into universe file
5. inspect confidence + status

That means adapters stay small, composable, and easy to debug.
