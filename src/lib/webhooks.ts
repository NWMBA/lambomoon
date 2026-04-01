import crypto from "crypto";

export const DEFAULT_WEBHOOK_EVENTS = [
  "project.created",
  "project.updated",
  "project.featured",
  "project.status_changed",
] as const;

export function generateWebhookSecret() {
  return `lm_whsec_${crypto.randomBytes(24).toString("hex")}`;
}

export function signWebhookPayload(secret: string, payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}
