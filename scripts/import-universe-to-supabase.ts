import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import type { NormalizedCryptoRecord } from "../src/lib/ingest/schema.ts";

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8"));
}

function mapRecordToRow(record: NormalizedCryptoRecord) {
  return {
    coingecko_id: record.coingecko_id,
    name: record.name,
    symbol: record.symbol,
    slug: record.slug,
    status: record.status,
    source: record.source,
    source_url: record.source_url,
    category: record.category,
    ecosystem: record.ecosystem,
    tags: record.tags || [],
    website_url: record.website_url,
    x_url: record.x_url,
    telegram_url: record.telegram_url,
    discord_url: record.discord_url,
    docs_url: record.docs_url,
    contract_address: record.contract_address,
    launch_date: record.launch_date,
    first_seen_at: record.first_seen_at,
    confidence_score: record.confidence_score,
    notes: record.notes,
    price_usd: record.market?.price_usd,
    market_cap: record.market?.market_cap,
    fdv: record.market?.fdv,
    volume_24h: record.market?.volume_24h,
    price_change_24h: record.market?.price_change_24h,
    price_change_7d: record.market?.price_change_7d,
    market_cap_rank: record.market?.market_cap_rank,
    circulating_supply: record.market?.circulating_supply,
    total_supply: record.market?.total_supply,
    max_supply: record.market?.max_supply,
    updated_at: new Date().toISOString(),
  };
}

function inferListingTier(row: ReturnType<typeof mapRecordToRow>) {
  const status = (row.status || "").toLowerCase();
  const rank = row.market_cap_rank ?? Number.POSITIVE_INFINITY;
  if (status !== "listed") return "prelaunch";
  if (rank <= 20) return "major";
  if (rank <= 100) return "midcap";
  return "emerging";
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  const supabase = createClient(url, key);
  const records = loadJson<NormalizedCryptoRecord[]>("data/imports/universe-merged.json");
  const dedupedBySlug = new Map<string, ReturnType<typeof mapRecordToRow>>();

  for (const record of records) {
    const row = mapRecordToRow(record);
    const key = row.slug;
    if (!key) continue;
    if (!dedupedBySlug.has(key)) {
      dedupedBySlug.set(key, row);
    } else {
      const existing = dedupedBySlug.get(key)!;
      dedupedBySlug.set(key, {
        ...existing,
        ...row,
        tags: Array.from(new Set([...(existing.tags || []), ...(row.tags || [])])),
      });
    }
  }

  const rows = Array.from(dedupedBySlug.values());

  const existingRowsBySlug = new Map<string, any>();
  const existingRowsByCoinGeckoId = new Map<string, any>();
  try {
    const { data: existingRows } = await supabase
      .from("cryptos")
      .select("slug,coingecko_id,is_featured,is_discoverable,is_hidden,listing_tier");

    for (const row of existingRows || []) {
      if (row.slug) existingRowsBySlug.set(row.slug, row);
      if (row.coingecko_id) existingRowsByCoinGeckoId.set(row.coingecko_id, row);
    }
  } catch (error) {
    console.warn("Could not preload existing editorial fields; continuing with inferred defaults.");
  }

  const preparedRows = rows.map((row) => {
    const existing = existingRowsBySlug.get(row.slug) || (row.coingecko_id ? existingRowsByCoinGeckoId.get(row.coingecko_id) : null);
    const inferredTier = inferListingTier(row);

    return {
      ...row,
      is_featured: existing?.is_featured ?? false,
      is_discoverable: existing?.is_discoverable ?? inferredTier !== "major",
      is_hidden: existing?.is_hidden ?? false,
      listing_tier: existing?.listing_tier ?? inferredTier,
    };
  });

  const chunkSize = 100;
  for (let i = 0; i < preparedRows.length; i += chunkSize) {
    const chunk = preparedRows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("cryptos")
      .upsert(chunk, { onConflict: "slug" });

    if (error) {
      console.error(`Chunk ${i / chunkSize + 1} failed`, error);
      throw error;
    }

    console.log(`Imported chunk ${i / chunkSize + 1}`);
  }

  console.log(`Imported ${preparedRows.length} crypto records into Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
