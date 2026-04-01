import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { generateAgentApiKey } from "@/lib/agents";

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

async function assertOwnership(agentId: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Missing Supabase env vars" };
  const { data, error } = await supabase.from("agents").select("id").eq("id", agentId).eq("owner_user_id", userId).single();
  if (error || !data) return { ok: false, error: "Agent not found" };
  return { ok: true, supabase };
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const { data, error } = await ownership.supabase!
    .from("agent_api_keys")
    .select("id,name,key_prefix,status,last_used_at,created_at")
    .eq("agent_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data || [] });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const name = String(body?.name || "Default key").trim();
  const keyMaterial = generateAgentApiKey();

  const { data, error } = await ownership.supabase!
    .from("agent_api_keys")
    .insert({
      agent_id: id,
      name,
      key_prefix: keyMaterial.prefix,
      key_hash: keyMaterial.hash,
      status: "active",
    })
    .select("id,name,key_prefix,status,last_used_at,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data, raw_key: keyMaterial.raw });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const keyId = body?.key_id;
  if (!keyId) return NextResponse.json({ error: "Missing key_id" }, { status: 400 });

  const { data, error } = await ownership.supabase!
    .from("agent_api_keys")
    .update({ status: "revoked" })
    .eq("id", keyId)
    .eq("agent_id", id)
    .select("id,name,key_prefix,status,last_used_at,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data });
}
