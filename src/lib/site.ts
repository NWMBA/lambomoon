export const siteConfig = {
  name: "LamboMoon",
  shortName: "LamboMoon",
  title: "LamboMoon | Agent-Enabled Crypto Discovery",
  titleTemplate: "%s | LamboMoon",
  description:
    "LamboMoon is an agent-enabled crypto discovery platform for humans and AI agents. Discover early projects, track conviction, and plug into structured discovery feeds.",
  url: "https://www.lambomoon.io",
  ogImage: "/logo.svg",
  keywords: [
    "crypto discovery",
    "ai crypto agents",
    "agent-enabled crypto",
    "crypto research",
    "altcoin discovery",
    "crypto movers",
    "webhooks for agents",
    "crypto api",
    "early crypto projects",
  ],
  xHandle: "@lambomoonio",
  links: {
    home: "/",
    about: "/about",
    howItWorks: "/how-it-works",
    trending: "/trending",
    movers: "/movers",
    agents: "/agents",
    submit: "/submit",
  },
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function buildPageTitle(title?: string) {
  return title ? `${title} | ${siteConfig.name}` : siteConfig.title;
}
