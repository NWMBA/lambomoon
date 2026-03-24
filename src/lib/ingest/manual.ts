import type { NormalizedCryptoRecord } from "./schema.ts";
import { normalizeUrl, slugify } from "./normalize.ts";

export interface ManualProjectRecord {
  name: string;
  symbol?: string;
  status?: "listed" | "upcoming" | "prelaunch" | "airdrop" | "testnet" | "watching" | "archived";
  category?: string;
  ecosystem?: string;
  tags?: string[];
  website_url?: string;
  x_url?: string;
  telegram_url?: string;
  discord_url?: string;
  docs_url?: string;
  contract_address?: string;
  launch_date?: string | null;
  notes?: string;
  confidence_score?: number;
}

export function mapManualProjectToNormalized(project: ManualProjectRecord): NormalizedCryptoRecord {
  return {
    source: "manual",
    coingecko_id: null,
    name: project.name,
    symbol: project.symbol?.toUpperCase(),
    slug: slugify(project.name),
    status: project.status || "watching",
    category: project.category,
    ecosystem: project.ecosystem,
    tags: project.tags || [],
    website_url: normalizeUrl(project.website_url),
    x_url: normalizeUrl(project.x_url),
    telegram_url: normalizeUrl(project.telegram_url),
    discord_url: normalizeUrl(project.discord_url),
    docs_url: normalizeUrl(project.docs_url),
    contract_address: project.contract_address,
    launch_date: project.launch_date || null,
    first_seen_at: new Date().toISOString(),
    confidence_score: project.confidence_score ?? 0.9,
    notes: project.notes,
  };
}
