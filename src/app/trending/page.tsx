"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data - trending alpha projects
const trending = [
  { id: 'virtual-protocol', name: 'Virtual Protocol', symbol: 'VIRTUAL', category: 'AI Agents', price: 1.45, change_24h: 12.8, market_cap: 1450000000, upvotes: 8500 },
  { id: 'pippin', name: 'Pippin', symbol: 'PIPPIN', category: 'AI Meme', price: 0.08, change_24h: 25.2, market_cap: 80000000, upvotes: 6200 },
  { id: 'plume', name: 'Plume', symbol: 'PLUME', category: 'RWA L1', price: 0.35, change_24h: 8.7, market_cap: 350000000, upvotes: 4800 },
  { id: 'war', name: 'WAR', symbol: 'WAR', category: 'Meme', price: 0.02, change_24h: 45.8, market_cap: 20000000, upvotes: 2800 },
  { id: 'ai16z', name: 'ai16z', symbol: 'AI16Z', category: 'AI Agents', price: 0.12, change_24h: 18.3, market_cap: 120000000, upvotes: 5100 },
  { id: 'pump', name: 'Pump', symbol: 'PUMP', category: 'Platform', price: 0.15, change_24h: -3.2, market_cap: 150000000, upvotes: 3200 },
  { id: 'fetch-ai', name: 'Artificial Superintelligence Alliance', symbol: 'FET', category: 'AI/Agents', price: 0.85, change_24h: 5.2, market_cap: 700000000, upvotes: 4200 },
  { id: 'bittensor', name: 'Bittensor', symbol: 'TAO', category: 'AI/DePIN', price: 280, change_24h: 7.1, market_cap: 2100000000, upvotes: 5800 },
  { id: 'render-token', name: 'Render Network', symbol: 'RNDR', category: 'AI/DePIN', price: 6.2, change_24h: 4.5, market_cap: 2300000000, upvotes: 3900 },
  { id: 'io', name: 'io.net', symbol: 'IO', category: 'DePIN', price: 3.5, change_24h: 8.9, market_cap: 3500000000, upvotes: 4500 },
];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(1)}%`;
}

export default function TrendingPage() {
  // Sort by upvotes (most popular first)
  const sortedTrending = [...trending].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Trending Alpha 🔥</h1>
          <p className="text-muted-foreground">Top opportunities from the community</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Symbol</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Category</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">24h Change</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Market Cap</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Upvotes</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedTrending.map((project, index) => (
                <tr key={project.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{project.name}</td>
                  <td className="py-3 px-4 font-mono text-primary">{project.symbol}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary">{project.category}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-medium">{formatPrice(project.price)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${project.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatChange(project.change_24h)}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{formatMarketCap(project.market_cap)}</td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{project.upvotes.toLocaleString()}</td>
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
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">🚀 LamboMoon — Discover the next big thing before it moons</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Not financial advice. DYOR.</p>
        </div>
      </footer>
    </div>
  );
}