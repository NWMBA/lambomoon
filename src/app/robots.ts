import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/agents", "/how-it-works", "/movers", "/project/", "/submit", "/trending"],
        disallow: ["/api/", "/auth/", "/curator", "/dashboard", "/login", "/profile"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "CCBot",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "OAI-SearchBot",
          "Meta-ExternalAgent",
          "meta-externalagent",
          "Bytespider",
        ],
        allow: ["/", "/about", "/agents", "/how-it-works", "/movers", "/project/", "/trending", "/llms.txt", "/llms-full.txt", "/sitemap.xml"],
        disallow: ["/api/", "/auth/", "/curator", "/dashboard", "/login", "/profile"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
