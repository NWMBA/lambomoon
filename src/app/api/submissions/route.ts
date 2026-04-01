import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getHumanSubmissionSlug, normalizeHumanSubmissionPayload, validateHumanSubmissionPayload } from "@/lib/human-submissions";

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

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });

  const { data, error } = await supabase
    .from("human_submissions")
    .select("id,type,project_slug,payload,status,reason,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data || [] });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const rawPayload = typeof body?.payload === "object" && body?.payload ? body.payload : null;
  if (!rawPayload) {
    return NextResponse.json({ error: "Submission payload is required" }, { status: 400 });
  }

  const payload = normalizeHumanSubmissionPayload(rawPayload);
  const validationError = validateHumanSubmissionPayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const projectSlug = getHumanSubmissionSlug(body?.project_slug, payload);
  const status = "needs_review";
  const reason = payload.contract_address
    ? "Ready for curator review as a watching candidate"
    : "Ready for curator review as a prelaunch candidate";

  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });

  const { data, error } = await supabase
    .from("human_submissions")
    .insert({
      user_id: user.id,
      type: "new_project",
      project_slug: projectSlug,
      payload,
      status,
      reason,
    })
    .select("id,type,project_slug,payload,status,reason,created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submission: data });
}
