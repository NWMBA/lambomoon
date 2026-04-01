import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  type CryptoRow,
  isDiscoveryEligible,
  isMajorOrStable,
  isStrongFallbackDiscovery,
  sortDiscovery,
  getSourceLabel,
  getStatusLabel,
} from "@/lib/discovery";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ generated_at: new Date().toISOString(), total: 0, projects: [] });
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("cryptos")
    .select("coingecko_id,name,symbol,slug,status,source,category,ecosystem,tags,website_url,x_url,telegram_url,discord_url,docs_url,source_url,launch_date,first_seen_at,confidence_score,price_usd,market_cap,price_change_24h,market_cap_rank,notes,is_featured,is_discoverable,is_hidden,listing_tier")
    .limit(500);

  if (error || !data) {
    return NextResponse.json({ generated_at: new Date().toISOString(), total: 0, projects: [] });
  }

  const allRows = (data as CryptoRow[]).filter((record) => !isMajorOrStable(record));

  const discoveryRows = allRows.filter(isDiscoveryEligible);
  const fallbackListedRows = allRows.filter(isStrongFallbackDiscovery);

  const records = discoveryRows.length >= 6
    ? discoveryRows
    : [
        ...discoveryRows,
        ...fallbackListedRows.filter(
          (record) => !discoveryRows.some((existing) => (existing.coingecko_id || existing.slug) === (record.coingecko_id || record.slug))
        ),
      ];

  const projects = sortDiscovery(records).slice(0, 24).map((record) => ({
    id: record.coingecko_id || record.slug,
    name: record.name,
    symbol: record.symbol || "—",
    category: record.category || record.ecosystem || "Uncategorized",
    description: record.notes || `${record.source || "Discovery"} project on the LamboMoon radar.`,
    price: record.price_usd || 0,
    change_24h: record.price_change_24h || 0,
    market_cap: record.market_cap || 0,
    launch_date: record.launch_date || record.first_seen_at || new Date().toISOString(),
    upvotes: 0,
    featured: (record.source || "").toLowerCase() === "manual",
    source: getSourceLabel(record),
    status: getStatusLabel(record),
  }));

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total: projects.length,
    projects,
  });
}
