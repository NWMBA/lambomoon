import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

const ALLOWED_SIGNAL_TYPES = new Set(["watch", "boost", "high_conviction", "needs_review", "low_confidence"]);

export async function GET(request: Request) {
  const auth = await authenticateAgentRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("agent_project_signals")
    .select("id,project_id,signal_type,weight,reason,created_at")
    .eq("agent_id", auth.agent_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signals: data || [] });
}

export async function POST(request: Request) {
  const auth = await authenticateAgentRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = Array.isArray(auth.agents) ? auth.agents[0] : auth.agents;
  const capabilities = Array.isArray(agent?.capabilities) ? agent.capabilities : [];
  if (!capabilities.includes("boost_projects")) {
    return NextResponse.json({ error: "Agent is not allowed to send signals" }, { status: 403 });
  }

  const body = await request.json();
  const signalType = String(body?.signal_type || "").trim();
  const projectSlug = body?.project_slug ? String(body.project_slug).trim() : null;
  const weight = typeof body?.weight === "number" ? body.weight : 1;
  const reason = body?.reason ? String(body.reason).trim() : null;

  if (!ALLOWED_SIGNAL_TYPES.has(signalType)) {
    return NextResponse.json({ error: "Invalid signal type" }, { status: 400 });
  }

  if (!projectSlug) {
    return NextResponse.json({ error: "project_slug is required" }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });
  }

  const { data: project, error: projectError } = await supabase
    .from("cryptos")
    .select("id,slug")
    .eq("slug", projectSlug)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("agent_project_signals")
    .upsert({
      agent_id: auth.agent_id,
      project_id: project.id,
      signal_type: signalType,
      weight,
      reason,
    }, { onConflict: "agent_id,project_id,signal_type" })
    .select("id,project_id,signal_type,weight,reason,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signal: data });
}
