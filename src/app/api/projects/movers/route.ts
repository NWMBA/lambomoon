import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { type CryptoRow, isMarketEligible, isMajorOrStable } from "@/lib/discovery";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ generated_at: new Date().toISOString(), total: 0, projects: [] });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("cryptos")
    .select("coingecko_id,name,symbol,slug,status,category,price_usd,market_cap,price_change_24h,market_cap_rank")
    .eq("status", "listed")
    .not("price_change_24h", "is", null)
    .limit(500);

  if (error || !data) {
    return NextResponse.json({ generated_at: new Date().toISOString(), total: 0, projects: [] });
  }

  const projects = (data as CryptoRow[])
    .filter(isMarketEligible)
    .filter((record) => !isMajorOrStable(record))
    .sort((a, b) => Math.abs((b.price_change_24h || 0)) - Math.abs((a.price_change_24h || 0)))
    .slice(0, 24)
    .map((record) => ({
      id: record.coingecko_id || record.slug,
      name: record.name,
      symbol: record.symbol || "—",
      price: record.price_usd || 0,
      change_24h: record.price_change_24h || 0,
      market_cap: record.market_cap || 0,
      category: record.category || "Listed",
    }));

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total: projects.length,
    projects,
  });
}
