export type CryptoRow = {
  coingecko_id?: string | null;
  name: string;
  symbol?: string | null;
  slug?: string | null;
  id?: string | null;
  agent_watch_count?: number | null;
  agent_boost_count?: number | null;
  agent_conviction_count?: number | null;
  status?: string | null;
  source?: string | null;
  category?: string | null;
  ecosystem?: string | null;
  tags?: string[] | null;
  website_url?: string | null;
  x_url?: string | null;
  telegram_url?: string | null;
  discord_url?: string | null;
  docs_url?: string | null;
  source_url?: string | null;
  launch_date?: string | null;
  first_seen_at?: string | null;
  confidence_score?: number | null;
  price_usd?: number | null;
  market_cap?: number | null;
  price_change_24h?: number | null;
  market_cap_rank?: number | null;
  notes?: string | null;
  is_featured?: boolean | null;
  is_discoverable?: boolean | null;
  is_hidden?: boolean | null;
  listing_tier?: "major" | "midcap" | "emerging" | "prelaunch" | string | null;
};

const MAJOR_IDS = new Set([
  "bitcoin",
  "ethereum",
  "tether",
  "usd-coin",
  "binancecoin",
  "ripple",
  "solana",
  "tron",
  "dogecoin",
  "staked-ether",
  "wrapped-bitcoin",
]);

const MAJOR_SYMBOLS = new Set([
  "BTC",
  "ETH",
  "USDT",
  "USDC",
  "BNB",
  "XRP",
  "SOL",
  "TRX",
  "DOGE",
  "STETH",
  "WBTC",
]);

const DISCOVERY_STATUSES = new Set(["upcoming", "prelaunch", "watching", "airdrop", "testnet"]);
const DISCOVERY_SOURCES = new Set(["manual", "scout", "cryptorank", "coinlaunch"]);

export function getListingTier(record: CryptoRow) {
  const explicitTier = record.listing_tier?.toLowerCase();
  if (explicitTier === "major" || explicitTier === "midcap" || explicitTier === "emerging" || explicitTier === "prelaunch") {
    return explicitTier;
  }

  const status = (record.status || "").toLowerCase();
  const rank = record.market_cap_rank ?? Number.POSITIVE_INFINITY;
  if (status !== "listed") return "prelaunch";
  if (rank <= 20) return "major";
  if (rank <= 100) return "midcap";
  return "emerging";
}

export function isMajorOrStable(record: CryptoRow) {
  const id = record.coingecko_id?.toLowerCase();
  const symbol = record.symbol?.toUpperCase();
  const rank = record.market_cap_rank ?? Number.POSITIVE_INFINITY;
  const tier = getListingTier(record);

  return Boolean(
    (id && MAJOR_IDS.has(id)) ||
    (symbol && MAJOR_SYMBOLS.has(symbol)) ||
    tier === "major" ||
    rank <= 20
  );
}

export function getRecordHealth(record: CryptoRow) {
  let score = 0;
  if (record.category) score += 1;
  if (record.source_url) score += 1;
  if (record.website_url || record.x_url || record.telegram_url || record.discord_url || record.docs_url) score += 1;
  if (record.launch_date || record.status === "listed") score += 1;
  if ((record.confidence_score ?? 0) >= 0.8) score += 1;
  return score;
}

export function isDiscoveryEligible(record: CryptoRow) {
  if (record.is_hidden) return false;
  if (record.is_discoverable === false) return false;
  if (record.is_featured) return true;

  const status = (record.status || "").toLowerCase();
  const source = (record.source || "").toLowerCase();
  const tier = getListingTier(record);

  if (DISCOVERY_SOURCES.has(source)) return true;
  if (DISCOVERY_STATUSES.has(status)) return true;
  if (tier === "emerging" && !isMajorOrStable(record)) return true;
  return false;
}

export function getAgentSignalScore(record: CryptoRow) {
  const watch = record.agent_watch_count ?? 0;
  const boost = record.agent_boost_count ?? 0;
  const conviction = record.agent_conviction_count ?? 0;
  return watch * 2 + boost * 4 + conviction * 8;
}

export function discoveryScore(record: CryptoRow) {
  const status = (record.status || "").toLowerCase();
  const source = (record.source || "").toLowerCase();
  const now = Date.now();
  const firstSeen = record.first_seen_at ? new Date(record.first_seen_at).getTime() : 0;
  const launchDate = record.launch_date ? new Date(record.launch_date).getTime() : 0;
  const daysSinceSeen = firstSeen ? Math.max(0, (now - firstSeen) / (1000 * 60 * 60 * 24)) : 999;
  const daysUntilLaunch = launchDate ? (launchDate - now) / (1000 * 60 * 60 * 24) : null;

  let score = 0;
  if (record.is_featured) score += 120;
  if (source === "manual" || source === "scout") score += 100;
  if (status === "watching") score += 65;
  if (status === "upcoming") score += 60;
  if (status === "prelaunch") score += 50;
  if (status === "airdrop" || status === "testnet") score += 40;
  score += Math.round((record.confidence_score ?? 0) * 20);
  score += getRecordHealth(record) * 5;
  if (daysSinceSeen <= 7) score += 20;
  else if (daysSinceSeen <= 30) score += 10;
  if (daysUntilLaunch !== null && daysUntilLaunch >= 0 && daysUntilLaunch <= 30) score += 15;
  if (daysUntilLaunch !== null && daysUntilLaunch > 30 && daysUntilLaunch <= 90) score += 8;
  score += getAgentSignalScore(record);
  return score;
}

export function sortDiscovery(records: CryptoRow[]) {
  return [...records].sort((a, b) => discoveryScore(b) - discoveryScore(a));
}

export function matchesSearch(record: CryptoRow, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    record.name,
    record.symbol,
    record.category,
    record.ecosystem,
    ...(record.tags || []),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q));
}

export function isMarketEligible(record: CryptoRow) {
  return (record.status || "").toLowerCase() === "listed" && typeof record.price_change_24h === "number";
}

export function isStrongFallbackDiscovery(record: CryptoRow) {
  if (record.is_hidden) return false;
  if (record.is_discoverable === false) return false;
  if (record.is_featured) return true;

  const status = (record.status || "").toLowerCase();
  const rank = record.market_cap_rank ?? Number.POSITIVE_INFINITY;
  const category = (record.category || record.ecosystem || "").trim();
  const tier = getListingTier(record);

  if (status !== "listed") return false;
  if (tier !== "emerging") return false;
  if (rank <= 20 || rank > 300) return false;
  if (!category || category.toLowerCase() === "uncategorized") return false;
  if (getRecordHealth(record) < 3) return false;
  return true;
}

export function getSourceLabel(record: CryptoRow) {
  const source = (record.source || "").toLowerCase();
  if (source === "manual") return "Manual";
  if (source === "scout") return "Scout";
  if (source === "cryptorank") return "CryptoRank";
  if (source === "coinlaunch") return "CoinLaunch";
  if (source === "coingecko") return "CoinGecko";
  return "LamboMoon";
}

export function getStatusLabel(record: CryptoRow) {
  const status = (record.status || "").toLowerCase();
  if (status === "upcoming") return "Upcoming";
  if (status === "prelaunch") return "Prelaunch";
  if (status === "watching") return "Watching";
  if (status === "airdrop") return "Airdrop";
  if (status === "testnet") return "Testnet";
  if (status === "listed") return "Listed";
  return "Radar";
}

export function hasProjectDetailPage(record: CryptoRow) {
  return Boolean(record.coingecko_id);
}

export function getProjectHref(record: CryptoRow) {
  if (record.coingecko_id) return `/project/${record.coingecko_id}`;
  const fallbackUrl = record.website_url || record.docs_url || record.x_url || record.telegram_url || record.source_url;
  return fallbackUrl || '#';
}
