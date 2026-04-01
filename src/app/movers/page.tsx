"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Mover = {
  id: string;
  name: string;
  symbol: string;
  change_24h: number;
  price: number;
  market_cap: number;
};

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
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

export default function MoversPage() {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/projects/movers');
        const data = await response.json();
        setMovers(data.projects || []);
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
          <h1 className="text-4xl font-bold mb-3 text-foreground">Biggest Movers 📈</h1>
          <p className="text-muted-foreground">Listed market names with the biggest 24h price changes</p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading movers…</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Symbol</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Price</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">24h Change</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Market Cap</th>
                <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((mover, index) => (
                <tr key={mover.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground font-medium">{index + 1}</td>
                  <td className="py-3 px-4 font-medium">{mover.name}</td>
                  <td className="py-3 px-4 font-mono text-primary">{mover.symbol}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatPrice(mover.price)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${mover.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatChange(mover.change_24h)}
                  </td>
                  <td className="py-3 px-4 text-right text-muted-foreground">{formatMarketCap(mover.market_cap)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/project/${mover.id}`}>
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
