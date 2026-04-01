import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Biggest Movers",
  description:
    "Track listed crypto projects with the biggest 24-hour price moves on LamboMoon.",
  alternates: {
    canonical: absoluteUrl(siteConfig.links.movers),
  },
  openGraph: {
    title: "Biggest Movers on LamboMoon",
    description:
      "Listed crypto projects with the strongest 24-hour price movement.",
    url: absoluteUrl(siteConfig.links.movers),
  },
  twitter: {
    title: "Biggest Movers on LamboMoon",
    description:
      "Listed crypto projects with the strongest 24-hour price movement.",
  },
};

export default function MoversLayout({ children }: { children: React.ReactNode }) {
  return children;
}
