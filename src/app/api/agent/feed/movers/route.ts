import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";
import { type CryptoRow, isMarketEligible, isMajorOrStable } from "@/lib/discovery";

export async function GET(request: Request) {
  const auth = await authenticateAgentRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ cursor: null, projects: [] });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("cryptos")
    .select("id,coingecko_id,name,symbol,slug,status,source,category,ecosystem,tags,price_usd,market_cap,market_cap_rank,price_change_24h,listing_tier,updated_at")
    .eq("status", "listed")
    .not("price_change_24h", "is", null)
    .limit(300);

  if (error || !data) {
    return NextResponse.json({ cursor: null, projects: [] });
  }

  const projects = (data as CryptoRow[])
    .filter(isMarketEligible)
    .filter((record) => !isMajorOrStable(record))
    .sort((a, b) => Math.abs((b.price_change_24h || 0)) - Math.abs((a.price_change_24h || 0)))
    .slice(0, 50)
    .map((record: any) => ({
      id: record.id || record.slug,
      coingecko_id: record.coingecko_id,
      slug: record.slug,
      name: record.name,
      symbol: record.symbol,
      status: record.status,
      source: record.source,
      category: record.category,
      ecosystem: record.ecosystem,
      tags: record.tags || [],
      price_usd: record.price_usd,
      market_cap: record.market_cap,
      market_cap_rank: record.market_cap_rank,
      price_change_24h: record.price_change_24h,
      listing_tier: record.listing_tier,
      updated_at: record.updated_at || new Date().toISOString(),
    }));

  return NextResponse.json({ cursor: null, projects });
}
