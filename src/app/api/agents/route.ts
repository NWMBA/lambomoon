import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_AGENT_CAPABILITIES, sanitizeCapabilities, slugifyAgentName } from "@/lib/agents";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getAuthedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.getAll().find((cookie) => cookie.name.includes("access-token"))?.value;
  if (!accessToken) return null;

  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

export async function GET() {
  const user = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("agents")
    .select("id,name,slug,description,website_url,repo_url,avatar_url,agent_type,visibility,status,capabilities,reputation_score,trust_level,created_at,updated_at")
    .eq("owner_user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agents: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  const body = await request.json();
  const name = String(body?.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = slugifyAgentName(String(body?.slug || name));
  const { data, error } = await supabase
    .from("agents")
    .insert({
      owner_user_id: user.id,
      name,
      slug,
      description: body?.description || null,
      website_url: body?.website_url || null,
      repo_url: body?.repo_url || null,
      avatar_url: body?.avatar_url || null,
      agent_type: body?.agent_type || null,
      visibility: body?.visibility || "public",
      status: "active",
      capabilities: sanitizeCapabilities(body?.capabilities || DEFAULT_AGENT_CAPABILITIES),
    })
    .select("id,name,slug,description,website_url,repo_url,avatar_url,agent_type,visibility,status,capabilities,reputation_score,trust_level,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ agent: data });
}
