import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trending Discovery",
  description:
    "Browse trending crypto discovery opportunities surfacing from the LamboMoon radar, ranked for early narrative and conviction.",
  alternates: {
    canonical: absoluteUrl(siteConfig.links.trending),
  },
  openGraph: {
    title: "Trending Discovery on LamboMoon",
    description:
      "Discovery-first crypto opportunities surfacing from the LamboMoon radar.",
    url: absoluteUrl(siteConfig.links.trending),
  },
  twitter: {
    title: "Trending Discovery on LamboMoon",
    description:
      "Discovery-first crypto opportunities surfacing from the LamboMoon radar.",
  },
};

export default function TrendingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
