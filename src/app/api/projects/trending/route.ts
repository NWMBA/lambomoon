import { NextResponse } from "next/server";
import seedProjects from "../../../../../seed-projects.json";

function getTrendingScore(project: any) {
  const ageInHours = Math.max(1, (Date.now() - new Date(project.launch_date).getTime()) / (1000 * 60 * 60));
  return project.upvotes / Math.pow(ageInHours + 2, 1.5);
}

export async function GET() {
  const projects = [...seedProjects]
    .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
    .slice(0, 25)
    .map((project) => ({
      id: project.id,
      name: project.name,
      symbol: project.symbol,
      category: project.category,
      description: project.description,
      upvotes: project.upvotes,
      launch_date: project.launch_date,
      source: "CoinGecko + Community",
      status: "listed",
    }));

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total: projects.length,
    projects,
  });
}
