export type HumanSubmissionInput = {
  name?: unknown;
  symbol?: unknown;
  ecosystem?: unknown;
  contract_address?: unknown;
  website_url?: unknown;
  category?: unknown;
  description?: unknown;
  x_url?: unknown;
  telegram_url?: unknown;
  notes?: unknown;
  source_url?: unknown;
  status?: unknown;
  listing_tier?: unknown;
  tags?: unknown;
  docs_url?: unknown;
  launch_date?: unknown;
  confidence_score?: unknown;
};

export type NormalizedHumanSubmissionPayload = {
  name: string;
  symbol: string;
  ecosystem: string;
  contract_address: string | null;
  website_url: string | null;
  category: string | null;
  description: string | null;
  x_url: string | null;
  telegram_url: string | null;
  notes: string;
  source_url: string | null;
  status: "prelaunch" | "watching" | "listed";
  listing_tier?: "prelaunch" | "emerging";
  tags: string[];
  docs_url: string | null;
  launch_date: string | null;
  confidence_score: number;
};

function cleanString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanUrl(value: unknown) {
  const trimmed = cleanString(value);
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

function cleanContractAddress(value: unknown) {
  const trimmed = cleanString(value);
  return trimmed ? trimmed.toLowerCase() : null;
}

function cleanSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function normalizeHumanSubmissionPayload(input: HumanSubmissionInput): NormalizedHumanSubmissionPayload {
  const name = cleanString(input.name) || "";
  const symbol = (cleanString(input.symbol) || "").toUpperCase();
  const ecosystem = cleanString(input.ecosystem) || "";
  const contractAddress = cleanContractAddress(input.contract_address);
  const websiteUrl = cleanUrl(input.website_url);
  const xUrl = cleanUrl(input.x_url);
  const telegramUrl = cleanUrl(input.telegram_url);
  const docsUrl = cleanUrl(input.docs_url);
  const description = cleanString(input.description);
  const category = cleanString(input.category);
  const tags = Array.isArray(input.tags)
    ? input.tags.map((value) => cleanString(value)).filter((value): value is string => Boolean(value))
    : [];

  const derivedStatus = contractAddress ? "watching" : "prelaunch";
  const requestedStatus = cleanString(input.status)?.toLowerCase();
  const status = requestedStatus === "listed" ? "listed" : derivedStatus;

  return {
    name,
    symbol,
    ecosystem,
    contract_address: contractAddress,
    website_url: websiteUrl,
    category,
    description,
    x_url: xUrl,
    telegram_url: telegramUrl,
    notes: cleanString(input.notes) || description || "Submitted by community user.",
    source_url: cleanUrl(input.source_url) || websiteUrl || xUrl || telegramUrl || docsUrl,
    status,
    listing_tier: status === "listed" ? "emerging" : derivedStatus === "watching" ? "emerging" : "prelaunch",
    tags,
    docs_url: docsUrl,
    launch_date: cleanString(input.launch_date),
    confidence_score: typeof input.confidence_score === "number" && Number.isFinite(input.confidence_score)
      ? input.confidence_score
      : 0.5,
  };
}

export function validateHumanSubmissionPayload(payload: NormalizedHumanSubmissionPayload) {
  if (!payload.name) return "Submission name is required";
  if (!payload.symbol) return "Submission symbol is required";
  if (!payload.ecosystem) return "Network / Chain is required";

  const hasPublicLink = Boolean(payload.website_url || payload.x_url || payload.telegram_url);
  if (!payload.contract_address && !hasPublicLink) {
    return "Prelaunch submissions need at least one public link: website, X, or Telegram";
  }

  return null;
}

export function getHumanSubmissionSlug(projectSlug: unknown, payload: { name: string }) {
  const provided = cleanString(projectSlug);
  return cleanSlug(provided || payload.name);
}
