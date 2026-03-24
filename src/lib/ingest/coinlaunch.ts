import type { NormalizedCryptoRecord } from "./schema.ts";
import { normalizeUrl, slugify } from "./normalize.ts";

export interface CoinLaunchProjectRecord {
  name: string;
  symbol?: string;
  website_url?: string;
  x_url?: string;
  telegram_url?: string;
  discord_url?: string;
  docs_url?: string;
  category?: string;
  ecosystem?: string;
  tags?: string[];
  launch_date?: string | null;
  notes?: string;
  source_url?: string;
}

export function mapCoinLaunchProjectToNormalized(
  project: CoinLaunchProjectRecord
): NormalizedCryptoRecord {
  return {
    source: "coinlaunch",
    source_url: project.source_url,
    coingecko_id: null,
    name: project.name,
    symbol: project.symbol?.toUpperCase(),
    slug: slugify(project.name),
    status: project.launch_date ? "upcoming" : "prelaunch",
    category: project.category,
    ecosystem: project.ecosystem,
    tags: project.tags || [],
    website_url: normalizeUrl(project.website_url),
    x_url: normalizeUrl(project.x_url),
    telegram_url: normalizeUrl(project.telegram_url),
    discord_url: normalizeUrl(project.discord_url),
    docs_url: normalizeUrl(project.docs_url),
    launch_date: project.launch_date || null,
    first_seen_at: new Date().toISOString(),
    confidence_score: 0.75,
    notes: project.notes,
  };
}
