import { mkdirSync, writeFileSync } from "fs";
import { fetchCoinGeckoMarkets, mapCoinGeckoCoinToNormalized } from "../src/lib/ingest/coingecko.ts";
import { dedupeKey, mergeRecords } from "../src/lib/ingest/normalize.ts";
import type { NormalizedCryptoRecord } from "../src/lib/ingest/schema.ts";

async function main() {
  const totalPages = Number(process.env.COINGECKO_PAGES || 4);
  const perPage = Number(process.env.COINGECKO_PER_PAGE || 250);

  const merged = new Map<string, NormalizedCryptoRecord>();

  for (let page = 1; page <= totalPages; page++) {
    console.log(`Fetching CoinGecko page ${page}/${totalPages}...`);
    const marketCoins = await fetchCoinGeckoMarkets(page, perPage);
    for (const coin of marketCoins) {
      const normalized = mapCoinGeckoCoinToNormalized(coin);
      const key = dedupeKey(normalized);
      merged.set(key, mergeRecords(merged.get(key), normalized));
    }
  }

  const output = Array.from(merged.values());
  mkdirSync("data/imports", { recursive: true });
  writeFileSync("data/imports/coingecko-normalized.json", JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} normalized records to data/imports/coingecko-normalized.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
