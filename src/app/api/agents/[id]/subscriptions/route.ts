import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

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
    .from("agent_subscriptions")
    .select("id,subscription_type,filters,delivery_mode,status,created_at")
    .eq("agent_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscriptions: data || [] });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const subscriptionType = String(body?.subscription_type || "category").trim();
  const filters = typeof body?.filters === "object" && body?.filters ? body.filters : {};
  const deliveryMode = body?.delivery_mode === "poll_only" ? "poll_only" : "webhook";

  const { data, error } = await ownership.supabase!
    .from("agent_subscriptions")
    .insert({
      agent_id: id,
      subscription_type: subscriptionType,
      filters,
      delivery_mode: deliveryMode,
      status: "active",
    })
    .select("id,subscription_type,filters,delivery_mode,status,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const subscriptionId = body?.subscription_id;
  if (!subscriptionId) return NextResponse.json({ error: "Missing subscription_id" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (typeof body?.status === "string") patch.status = body.status;
  if (typeof body?.subscription_type === "string") patch.subscription_type = body.subscription_type;
  if (typeof body?.filters === "object" && body?.filters) patch.filters = body.filters;
  if (typeof body?.delivery_mode === "string") patch.delivery_mode = body.delivery_mode;

  const { data, error } = await ownership.supabase!
    .from("agent_subscriptions")
    .update(patch)
    .eq("id", subscriptionId)
    .eq("agent_id", id)
    .select("id,subscription_type,filters,delivery_mode,status,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subscription: data });
}
