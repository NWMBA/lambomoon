import type { MetadataRoute } from "next";
import seedProjects from "../../seed-projects.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.lambomoon.io";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/trending`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/movers`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/submit`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const projectPages: MetadataRoute.Sitemap = seedProjects.map((project) => ({
    url: `${baseUrl}/project/${project.id}`,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticPages, ...projectPages];
}
