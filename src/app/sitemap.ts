import type { MetadataRoute } from "next";
import seedProjects from "../../seed-projects.json";
import { absoluteUrl, siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl(siteConfig.links.home), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl(siteConfig.links.howItWorks), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl(siteConfig.links.agents), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl(siteConfig.links.trending), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl(siteConfig.links.movers), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl(siteConfig.links.about), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl(siteConfig.links.submit), changeFrequency: "weekly", priority: 0.6 },
  ];

  const projectPages: MetadataRoute.Sitemap = seedProjects.map((project) => ({
    url: absoluteUrl(`/project/${project.id}`),
    changeFrequency: "daily",
    priority: project.featured ? 0.9 : 0.7,
  }));

  return [...staticPages, ...projectPages];
}
