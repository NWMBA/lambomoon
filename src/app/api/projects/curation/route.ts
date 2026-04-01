import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function getPublicSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

async function getAuthenticatedUserEmail() {
  const cookieStore = await cookies();
  const accessToken = cookieStore
    .getAll()
    .find((cookie) => cookie.name.includes("access-token"))?.value;

  if (!accessToken) return null;

  const supabase = getPublicSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.email) return null;
  return data.user.email.toLowerCase();
}

async function requireCuratorAdmin() {
  const email = await getAuthenticatedUserEmail();
  if (!email) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const allowed = (process.env.CURATOR_ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!allowed.includes(email)) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, email };
}

export async function GET() {
  const supabase = getPublicSupabase();
  if (!supabase) {
    return NextResponse.json({ total: 0, projects: [] });
  }

  const { data, error } = await supabase
    .from("cryptos")
    .select("coingecko_id,name,symbol,slug,status,source,category,ecosystem,confidence_score,launch_date,website_url,x_url,is_featured,is_discoverable,is_hidden,listing_tier,notes,market_cap_rank")
    .order("is_featured", { ascending: false })
    .order("confidence_score", { ascending: false, nullsFirst: false })
    .limit(200);

  if (error || !data) {
    return NextResponse.json({ total: 0, projects: [] });
  }

  return NextResponse.json({ total: data.length, projects: data });
}

export async function PATCH(request: NextRequest) {
  const authz = await requireCuratorAdmin();
  if (!authz.ok) return authz.response;

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });
  }

  const body = await request.json();
  const { slug, is_featured, is_discoverable, is_hidden, listing_tier } = body || {};

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof is_featured === "boolean") patch.is_featured = is_featured;
  if (typeof is_discoverable === "boolean") patch.is_discoverable = is_discoverable;
  if (typeof is_hidden === "boolean") patch.is_hidden = is_hidden;
  if (typeof listing_tier === "string" || listing_tier === null) patch.listing_tier = listing_tier;

  const { data, error } = await supabase
    .from("cryptos")
    .update(patch)
    .eq("slug", slug)
    .select("coingecko_id,name,symbol,slug,status,source,category,ecosystem,confidence_score,launch_date,website_url,x_url,is_featured,is_discoverable,is_hidden,listing_tier,notes,market_cap_rank")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
