"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data - biggest movers
const movers = [
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', change_24h: 25.5, price: 0.0000012, market_cap: 500000000 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', change_24h: 15.2, price: 0.000025, market_cap: 25000000 },
  { id: 'virtual-protocol', name: 'Virtual Protocol', symbol: 'VIRTUAL', change_24h: 12.8, price: 1.45, market_cap: 1450000000 },
  { id: 'ai16z', name: 'ai16z', symbol: 'AI16Z', change_24h: -8.5, price: 0.15, market_cap: 150000000 },
  { id: 'pump', name: 'Pump', symbol: 'PUMP', change_24h: -12.3, price: 0.08, market_cap: 80000000 },
  { id: 'war', name: 'WAR', symbol: 'WAR', change_24h: -18.7, price: 0.01, market_cap: 10000000 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', change_24h: 5.2, price: 0.12, market_cap: 18000000000 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', change_24h: 3.1, price: 125, market_cap: 55000000000 },
  { id: 'bittensor', name: 'Bittensor', symbol: 'TAO', change_24h: 7.1, price: 280, market_cap: 2100000000 },
  { id: 'render-token', name: 'Render Network', symbol: 'RNDR', change_24h: 4.5, price: 6.2, market_cap: 2300000000 },
];

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
  // Sort by absolute change (biggest movers first)
  const sortedMovers = [...movers].sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h));

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Biggest Movers 📈</h1>
          <p className="text-muted-foreground">Coins with the biggest 24h price changes</p>
        </div>

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
              {sortedMovers.map((mover, index) => (
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