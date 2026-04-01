import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";
import { type CryptoRow, isDiscoveryEligible, isMajorOrStable, isStrongFallbackDiscovery, sortDiscovery } from "@/lib/discovery";

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
    .select("id,coingecko_id,name,symbol,slug,status,source,category,ecosystem,tags,launch_date,first_seen_at,confidence_score,price_usd,market_cap,price_change_24h,market_cap_rank,is_featured,is_discoverable,is_hidden,listing_tier,website_url,x_url,telegram_url,discord_url,docs_url,source_url,notes,updated_at")
    .limit(500);

  if (error || !data) {
    return NextResponse.json({ cursor: null, projects: [] });
  }

  const allRows = (data as CryptoRow[]).filter((record) => !isMajorOrStable(record));
  const discoveryRows = allRows.filter(isDiscoveryEligible);
  const fallbackRows = allRows.filter(isStrongFallbackDiscovery);
  const records = discoveryRows.length >= 12
    ? discoveryRows
    : [...discoveryRows, ...fallbackRows.filter((record) => !discoveryRows.some((existing) => (existing.coingecko_id || existing.slug) === (record.coingecko_id || record.slug)))];

  const projects = sortDiscovery(records).slice(0, 50).map((record: any) => ({
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
    launch_date: record.launch_date,
    price_usd: record.price_usd,
    market_cap: record.market_cap,
    market_cap_rank: record.market_cap_rank,
    price_change_24h: record.price_change_24h,
    confidence_score: record.confidence_score,
    is_featured: record.is_featured,
    is_discoverable: record.is_discoverable,
    listing_tier: record.listing_tier,
    notes: record.notes,
    links: {
      website_url: record.website_url,
      x_url: record.x_url,
      telegram_url: record.telegram_url,
      discord_url: record.discord_url,
      docs_url: record.docs_url,
      source_url: record.source_url,
    },
    updated_at: record.updated_at || new Date().toISOString(),
  }));

  const agent = Array.isArray(auth.agents) ? auth.agents[0] : auth.agents;
  return NextResponse.json({ cursor: null, projects, agent: agent?.slug || null });
}
