import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
  const accessToken = cookieStore.getAll().find((cookie) => cookie.name.includes("access-token"))?.value;
  if (!accessToken) return null;

  const supabase = getPublicSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.email) return null;
  return data.user.email.toLowerCase();
}

export async function GET() {
  const email = await getAuthenticatedUserEmail();
  const allowed = (process.env.CURATOR_ADMIN_EMAILS || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);

  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!allowed.includes(email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = getAdminSupabase();
  if (!supabase) return NextResponse.json({ error: "Missing service role env vars" }, { status: 500 });

  const { data, error } = await supabase
    .from("agent_submissions")
    .select("id,type,project_slug,payload,status,reason,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data || [] });
}
