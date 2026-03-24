import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { dedupeKey, mergeRecords } from "../src/lib/ingest/normalize.ts";
import type { NormalizedCryptoRecord } from "../src/lib/ingest/schema.ts";
import {
  mapCryptoRankUpcomingToNormalized,
  type CryptoRankUpcomingRecord,
} from "../src/lib/ingest/cryptorank.ts";

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8"));
}

async function main() {
  const listed = loadJson<NormalizedCryptoRecord[]>("data/imports/coingecko-normalized.json");
  const upcomingRaw = loadJson<CryptoRankUpcomingRecord[]>("data/imports/upcoming-projects.json");
  const upcoming = upcomingRaw.map(mapCryptoRankUpcomingToNormalized);

  const merged = new Map<string, NormalizedCryptoRecord>();

  for (const record of [...listed, ...upcoming]) {
    const key = dedupeKey(record);
    merged.set(key, mergeRecords(merged.get(key), record));
  }

  const output = Array.from(merged.values()).sort((a, b) => {
    if (a.status === b.status) return a.name.localeCompare(b.name);
    if (a.status === "listed") return -1;
    if (b.status === "listed") return 1;
    return a.name.localeCompare(b.name);
  });

  mkdirSync("data/imports", { recursive: true });
  writeFileSync("data/imports/universe-merged.json", JSON.stringify(output, null, 2));
  console.log(`Merged ${listed.length} listed + ${upcoming.length} upcoming into ${output.length} normalized records.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
