"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Project = {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price: number;
  change_24h: number;
  market_cap: number;
  upvotes: number;
  status?: string;
  source?: string;
};

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price > 0) return `$${price.toFixed(4)}`;
  return `Early`;
}

function formatMarketCap(cap: number): string {
  if (!cap) return `Pre-market`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export default function TrendingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/projects/discovery');
        const data = await response.json();
        setProjects(data.projects || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Trending Alpha 🔥</h1>
          <p className="text-muted-foreground">Discovery-first opportunities from the LamboMoon radar</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading discovery feed…</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">24h Change</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Market Cap</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={project.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{project.name}</td>
                  <td className="py-3 px-4 font-mono text-primary">{project.symbol}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary">{project.category}</span>
                  </td>
                  <td className="py-3 px-4 text-xs uppercase text-amber-400">{project.status || project.source || 'discovery'}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatPrice(project.price)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${project.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {project.price > 0 ? formatChange(project.change_24h) : '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{formatMarketCap(project.market_cap)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/project/${project.id}`}>
                      <Button size="sm" className="bg-primary hover:bg-primary/90">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </main>

      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">🚀 LamboMoon — Discover the next big thing before it moons</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Not financial advice. DYOR.</p>
        </div>
      </footer>
    </div>
  );
}
