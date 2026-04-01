import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";
import { type CryptoRow, isDiscoveryEligible, sortDiscovery } from "@/lib/discovery";

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
    .select("id,coingecko_id,name,symbol,slug,status,source,category,ecosystem,tags,launch_date,confidence_score,price_usd,market_cap,price_change_24h,is_featured,is_discoverable,is_hidden,listing_tier,website_url,x_url,docs_url,source_url,notes,updated_at")
    .eq("is_featured", true)
    .limit(100);

  if (error || !data) {
    return NextResponse.json({ cursor: null, projects: [] });
  }

  const projects = sortDiscovery((data as CryptoRow[]).filter(isDiscoveryEligible)).map((record: any) => ({
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
    price_change_24h: record.price_change_24h,
    confidence_score: record.confidence_score,
    is_featured: true,
    listing_tier: record.listing_tier,
    notes: record.notes,
    links: {
      website_url: record.website_url,
      x_url: record.x_url,
      docs_url: record.docs_url,
      source_url: record.source_url,
    },
    updated_at: record.updated_at || new Date().toISOString(),
  }));

  return NextResponse.json({ cursor: null, projects });
}
