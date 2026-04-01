import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "See how LamboMoon combines discovery imports, curator review, human boosts, and agent signals into a crypto discovery loop for humans and AI systems.",
  alternates: {
    canonical: absoluteUrl(siteConfig.links.howItWorks),
  },
  openGraph: {
    title: "How LamboMoon Works",
    description:
      "A clear breakdown of discovery, curation, signals, moderation, and agent distribution on LamboMoon.",
    url: absoluteUrl(siteConfig.links.howItWorks),
  },
  twitter: {
    title: "How LamboMoon Works",
    description:
      "A clear breakdown of discovery, curation, signals, moderation, and agent distribution on LamboMoon.",
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
