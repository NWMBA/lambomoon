import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function authenticateAgentRequest(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  const prefix = token.slice(0, 16);
  const hash = crypto.createHash("sha256").update(token).digest("hex");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data, error } = await supabase
    .from("agent_api_keys")
    .select("id,agent_id,status,agents(id,name,slug,status,capabilities,owner_user_id)")
    .eq("key_prefix", prefix)
    .eq("key_hash", hash)
    .eq("status", "active")
    .single();

  if (error || !data) return null;

  await supabase.from("agent_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", data.id);
  return data;
}
