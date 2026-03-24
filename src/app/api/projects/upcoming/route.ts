import { readFileSync } from "fs";
import { NextResponse } from "next/server";

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(process.cwd() + path, "utf8"));
}

export async function GET() {
  const cryptorank = loadJson<any[]>("/data/imports/upcoming-projects.json").map((project) => ({
    ...project,
    source: "CryptoRank",
    status: project.launch_date ? "upcoming" : "prelaunch",
  }));

  const coinlaunch = loadJson<any[]>("/data/imports/coinlaunch-projects.json").map((project) => ({
    ...project,
    source: "CoinLaunch",
    status: project.launch_date ? "upcoming" : "prelaunch",
  }));

  const projects = [...cryptorank, ...coinlaunch];

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    total: projects.length,
    projects,
  });
}
