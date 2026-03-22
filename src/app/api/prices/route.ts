import { NextResponse } from "next/server";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

// CoinGecko IDs - these should match seedProjects in page.tsx
const COIN_IDS = [
  "virtual-protocol", "fetch-ai", "bittensor", "ocean-protocol", "render-token",
  "akash", "io", "arweave", "filecoin", "filecoin",
  "hyperliquid", "ether-fi", "eigenlayer", "pendle", "aave",
  "solana", "sui", "sei-network", "near", "internet-computer",
  "matic-network", "arbitrum", "optimism",
  "pudgy-penguins", "pepe", "dogecoin", "bonk",
  "polymesh", "centrifuge"
];

export async function GET() {
  try {
    const ids = COIN_IDS.join(",");
    
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&sparkline=false`,
      { 
        // Cache at Vercel edge for 60 seconds
        next: { revalidate: 60 } 
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      prices: data,
      updated_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Price fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}