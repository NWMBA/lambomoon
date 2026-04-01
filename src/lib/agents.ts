import crypto from "crypto";

export type AgentCapability =
  | "read_feeds"
  | "receive_webhooks"
  | "submit_projects"
  | "boost_projects"
  | "suggest_metadata";

export const DEFAULT_AGENT_CAPABILITIES: AgentCapability[] = ["read_feeds"];

export function slugifyAgentName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function generateAgentApiKey() {
  const raw = `lm_agent_${crypto.randomBytes(24).toString("hex")}`;
  const prefix = raw.slice(0, 16);
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, prefix, hash };
}

export function isValidCapability(value: string): value is AgentCapability {
  return ["read_feeds", "receive_webhooks", "submit_projects", "boost_projects", "suggest_metadata"].includes(value);
}

export function sanitizeCapabilities(values: unknown): AgentCapability[] {
  if (!Array.isArray(values)) return DEFAULT_AGENT_CAPABILITIES;
  const filtered = values.filter((value): value is AgentCapability => typeof value === "string" && isValidCapability(value));
  return filtered.length > 0 ? Array.from(new Set(filtered)) : DEFAULT_AGENT_CAPABILITIES;
}
