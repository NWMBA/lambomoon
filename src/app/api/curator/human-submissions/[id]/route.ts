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

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.getAll().find((cookie) => cookie.name.includes("access-token"))?.value;
  if (!accessToken) return null;

  const supabase = getPublicSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

async function requireCuratorAdmin() {
  const user = await getAuthenticatedUser();
  if (!user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const allowed = (process.env.CURATOR_ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (!allowed.includes(user.email.toLowerCase())) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, user };
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const authz = await requireCuratorAdmin();
  if (!authz.ok) return authz.response;

  const supabase = getAdminSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const action = String(body?.action || "").trim();
  const reason = body?.reason ? String(body.reason).trim() : null;

  const mappedStatus = action === "approve"
    ? "approved"
    : action === "reject"
      ? "rejected"
      : action === "needs_review"
        ? "needs_review"
        : null;

  if (!mappedStatus) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { data: submission, error: fetchError } = await supabase
    .from("human_submissions")
    .select("id,type,project_slug,payload,status")
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (mappedStatus === "approved") {
    const payload = submission.payload || {};
    const slug = submission.project_slug || payload.slug || payload.name?.toLowerCase?.().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    if (submission.type === "new_project" && payload.name && slug) {
      await supabase.from("cryptos").upsert({
        slug,
        name: payload.name,
        symbol: payload.symbol || payload.name.slice(0, 4).toUpperCase(),
        status: payload.status || "watching",
        source: "human_submission",
        source_url: payload.source_url || null,
        category: payload.category || null,
        ecosystem: payload.ecosystem || null,
        tags: payload.tags || [],
        website_url: payload.website_url || null,
        x_url: payload.x_url || null,
        telegram_url: payload.telegram_url || null,
        docs_url: payload.docs_url || null,
        contract_address: payload.contract_address || null,
        notes: payload.notes || payload.description || "Submitted by community user.",
        launch_date: payload.launch_date || null,
        first_seen_at: new Date().toISOString(),
        confidence_score: payload.confidence_score || 0.5,
        is_discoverable: true,
        is_hidden: false,
        listing_tier: payload.status === "listed" ? "emerging" : "prelaunch",
        updated_at: new Date().toISOString(),
      }, { onConflict: "slug" });
    }
  }

  const { data, error } = await supabase
    .from("human_submissions")
    .update({
      status: mappedStatus,
      reason,
      reviewed_by: authz.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id,type,project_slug,payload,status,reason,created_at,reviewed_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submission: data });
}
