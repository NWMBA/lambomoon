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

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  const supabase = createClient(url, key);
  const records = loadJson<NormalizedCryptoRecord[]>("data/imports/universe-merged.json");
  const rows = records.map(mapRecordToRow);

  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase
      .from("cryptos")
      .upsert(chunk, { onConflict: "slug" });

    if (error) {
      console.error(`Chunk ${i / chunkSize + 1} failed`, error);
      throw error;
    }

    console.log(`Imported chunk ${i / chunkSize + 1}`);
  }

  console.log(`Imported ${rows.length} crypto records into Supabase.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
