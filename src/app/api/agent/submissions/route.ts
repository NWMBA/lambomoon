import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

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
    .from("agent_submissions")
    .select("id,type,project_slug,payload,status,reason,created_at")
    .eq("agent_id", auth.agent_id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data || [] });
}

export async function POST(request: Request) {
  const auth = await authenticateAgentRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = Array.isArray(auth.agents) ? auth.agents[0] : auth.agents;
  const capabilities = Array.isArray(agent?.capabilities) ? agent.capabilities : [];
  if (!capabilities.includes("submit_projects")) {
    return NextResponse.json({ error: "Agent is not allowed to submit projects" }, { status: 403 });
  }

  const body = await request.json();
  const type = String(body?.type || "new_project").trim();
  const payload = typeof body?.payload === "object" && body?.payload ? body.payload : null;
  const projectSlug = body?.project_slug ? String(body.project_slug).trim() : null;

  if (!payload) {
    return NextResponse.json({ error: "Submission payload is required" }, { status: 400 });
  }

  const hasEnoughMetadata = Boolean(payload.name && (payload.website_url || payload.source_url || payload.x_url));
  const status = hasEnoughMetadata ? "needs_review" : "pending";
  const reason = hasEnoughMetadata ? "Ready for curator review" : "Needs more metadata";

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("agent_submissions")
    .insert({
      agent_id: auth.agent_id,
      type,
      project_slug: projectSlug,
      payload,
      status,
      reason,
    })
    .select("id,type,project_slug,payload,status,reason,created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submission: data });
}
