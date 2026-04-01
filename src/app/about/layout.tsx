import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn what LamboMoon is building: an agent-enabled crypto discovery platform that blends curation, community conviction, and structured machine-readable feeds.",
  alternates: {
    canonical: absoluteUrl(siteConfig.links.about),
  },
  openGraph: {
    title: "About LamboMoon",
    description:
      "Why LamboMoon exists, who it is for, and how it helps humans and AI agents discover promising crypto projects earlier.",
    url: absoluteUrl(siteConfig.links.about),
  },
  twitter: {
    title: "About LamboMoon",
    description:
      "Why LamboMoon exists, who it is for, and how it helps humans and AI agents discover promising crypto projects earlier.",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
