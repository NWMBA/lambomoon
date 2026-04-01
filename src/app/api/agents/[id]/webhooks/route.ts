import crypto from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_WEBHOOK_EVENTS, generateWebhookSecret, signWebhookPayload } from "@/lib/webhooks";

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
  const { data, error } = await supabase.from("agents").select("id,name").eq("id", agentId).eq("owner_user_id", userId).single();
  if (error || !data) return { ok: false, error: "Agent not found" };
  return { ok: true, supabase, agent: data };
}

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const { data, error } = await ownership.supabase!
    .from("agent_webhook_subscriptions")
    .select("id,url,event_types,status,last_delivery_at,last_success_at,created_at")
    .eq("agent_id", id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhooks: data || [] });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const url = String(body?.url || "").trim();
  if (!url) return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });

  const eventTypes = Array.isArray(body?.event_types) && body.event_types.length > 0 ? body.event_types : [...DEFAULT_WEBHOOK_EVENTS];
  const secret = generateWebhookSecret();

  const { data, error } = await ownership.supabase!
    .from("agent_webhook_subscriptions")
    .insert({
      agent_id: id,
      url,
      secret,
      event_types: eventTypes,
      status: "active",
    })
    .select("id,url,event_types,status,last_delivery_at,last_success_at,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhook: data, secret });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const ownership = await assertOwnership(id, user.id);
  if (!ownership.ok) return NextResponse.json({ error: ownership.error }, { status: 404 });

  const body = await request.json();
  const webhookId = body?.webhook_id;
  if (!webhookId) return NextResponse.json({ error: "Missing webhook_id" }, { status: 400 });

  if (body?.test === true) {
    const { data: webhook, error: fetchError } = await ownership.supabase!
      .from("agent_webhook_subscriptions")
      .select("id,url,secret,event_types,status")
      .eq("id", webhookId)
      .eq("agent_id", id)
      .single();

    if (fetchError || !webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

    const event = {
      id: crypto.randomUUID(),
      type: "webhook.test",
      created_at: new Date().toISOString(),
      data: {
        agent_id: id,
        agent_name: ownership.agent?.name || "agent",
        message: "LamboMoon webhook test event",
      },
    };

    const payload = JSON.stringify(event);
    const signature = signWebhookPayload(webhook.secret, payload);

    let statusCode: number | null = null;
    let success = false;
    let responseExcerpt: string | null = null;

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-lambomoon-signature": signature,
          "x-lambomoon-event": event.type,
        },
        body: payload,
      });
      statusCode = response.status;
      success = response.ok;
      responseExcerpt = (await response.text()).slice(0, 300);
    } catch (error: any) {
      responseExcerpt = String(error?.message || error).slice(0, 300);
    }

    await ownership.supabase!.from("agent_webhook_deliveries").insert({
      subscription_id: webhook.id,
      event_type: event.type,
      payload: event,
      status_code: statusCode,
      success,
      attempt_count: 1,
      response_excerpt: responseExcerpt,
    });

    await ownership.supabase!
      .from("agent_webhook_subscriptions")
      .update({
        last_delivery_at: new Date().toISOString(),
        last_success_at: success ? new Date().toISOString() : undefined,
        status: success ? "active" : "failing",
      })
      .eq("id", webhook.id);

    return NextResponse.json({ success, status_code: statusCode, response_excerpt: responseExcerpt });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body?.status === "string") patch.status = body.status;
  if (Array.isArray(body?.event_types)) patch.event_types = body.event_types;
  if (typeof body?.url === "string" && body.url.trim()) patch.url = body.url.trim();

  const { data, error } = await ownership.supabase!
    .from("agent_webhook_subscriptions")
    .update(patch)
    .eq("id", webhookId)
    .eq("agent_id", id)
    .select("id,url,event_types,status,last_delivery_at,last_success_at,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ webhook: data });
}
