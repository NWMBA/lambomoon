import type { NormalizedCryptoRecord } from "./schema.ts";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeUrl(url?: string | null) {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  return trimmed.replace(/\/$/, "");
}

export function dedupeKey(record: NormalizedCryptoRecord) {
  return [
    record.coingecko_id || "",
    normalizeUrl(record.website_url) || "",
    normalizeUrl(record.x_url) || "",
    normalizeUrl(record.telegram_url) || "",
    `${slugify(record.name)}:${(record.symbol || "").toLowerCase()}`,
  ].join("|");
}

export function mergeRecords(
  existing: NormalizedCryptoRecord | undefined,
  incoming: NormalizedCryptoRecord
): NormalizedCryptoRecord {
  if (!existing) return incoming;

  return {
    ...existing,
    ...incoming,
    tags: Array.from(new Set([...(existing.tags || []), ...(incoming.tags || [])])),
    market: {
      ...existing.market,
      ...incoming.market,
    },
    confidence_score: Math.max(existing.confidence_score, incoming.confidence_score),
  };
}

export function getThinRecordReasons(record: NormalizedCryptoRecord) {
  const reasons: string[] = [];
  if (!record.website_url) reasons.push("missing website");
  if (!record.symbol) reasons.push("missing symbol");
  if (!record.category) reasons.push("missing category");
  if (!record.source_url) reasons.push("missing source url");
  if (!record.launch_date && record.status !== "listed") reasons.push("missing launch date");
  return reasons;
}

export function getRecordHealth(record: NormalizedCryptoRecord) {
  const reasons = getThinRecordReasons(record);
  if (reasons.length <= 1 && record.confidence_score >= 0.8) return { label: "Strong", reasons };
  if (reasons.length <= 3 && record.confidence_score >= 0.6) return { label: "Okay", reasons };
  return { label: "Thin", reasons };
}
