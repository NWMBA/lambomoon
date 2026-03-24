export type CryptoStatus =
  | "listed"
  | "upcoming"
  | "prelaunch"
  | "airdrop"
  | "testnet"
  | "watching"
  | "archived";

export type IngestSource =
  | "coingecko"
  | "cryptorank"
  | "coinlaunch"
  | "manual"
  | "scout";

export interface NormalizedCryptoRecord {
  source: IngestSource;
  source_url?: string;
  coingecko_id?: string | null;
  name: string;
  symbol?: string;
  slug: string;
  status: CryptoStatus;
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
  first_seen_at: string;
  confidence_score: number;
  notes?: string;
  market?: {
    price_usd?: number;
    market_cap?: number;
    fdv?: number;
    volume_24h?: number;
    price_change_24h?: number;
    price_change_7d?: number;
    market_cap_rank?: number;
    circulating_supply?: number;
    total_supply?: number;
    max_supply?: number;
  };
}
