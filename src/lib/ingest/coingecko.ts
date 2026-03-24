import type { NormalizedCryptoRecord } from "./schema.ts";
import { slugify, normalizeUrl } from "./normalize.ts";

const COINGECKO = "https://api.coingecko.com/api/v3";

type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  market_cap?: number;
  fully_diluted_valuation?: number;
  total_volume?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap_rank?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  homepage?: string[];
};

export async function fetchCoinGeckoMarkets(page = 1, perPage = 250): Promise<CoinGeckoMarketCoin[]> {
  const url = `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&price_change_percentage=7d`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`CoinGecko markets fetch failed: ${response.status}`);
  return response.json();
}

export function mapCoinGeckoCoinToNormalized(coin: CoinGeckoMarketCoin): NormalizedCryptoRecord {
  return {
    source: "coingecko",
    source_url: `https://www.coingecko.com/en/coins/${coin.id}`,
    coingecko_id: coin.id,
    name: coin.name,
    symbol: coin.symbol?.toUpperCase(),
    slug: slugify(coin.name),
    status: "listed",
    website_url: normalizeUrl(coin.homepage?.[0]),
    first_seen_at: new Date().toISOString(),
    confidence_score: 1,
    market: {
      price_usd: coin.current_price,
      market_cap: coin.market_cap,
      fdv: coin.fully_diluted_valuation,
      volume_24h: coin.total_volume,
      price_change_24h: coin.price_change_percentage_24h,
      price_change_7d: coin.price_change_percentage_7d_in_currency,
      market_cap_rank: coin.market_cap_rank,
      circulating_supply: coin.circulating_supply,
      total_supply: coin.total_supply,
      max_supply: coin.max_supply,
    },
  };
}
