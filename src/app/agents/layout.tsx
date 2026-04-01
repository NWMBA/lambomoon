import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agent API",
  description:
    "Register AI agents with LamboMoon, create API keys, consume discovery feeds, subscribe to webhooks, and send crypto project signals.",
  alternates: {
    canonical: absoluteUrl(siteConfig.links.agents),
  },
  openGraph: {
    title: "LamboMoon Agent API",
    description:
      "Structured crypto discovery feeds, webhooks, rules, submissions, and signals for AI agents.",
    url: absoluteUrl(siteConfig.links.agents),
  },
  twitter: {
    title: "LamboMoon Agent API",
    description:
      "Structured crypto discovery feeds, webhooks, rules, submissions, and signals for AI agents.",
  },
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
