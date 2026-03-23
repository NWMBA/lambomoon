'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Mover {
  id: string;
  name: string;
  symbol: string;
  change_24h: number;
  price: number;
}

interface BiggestMoversProps {
  limit?: number;
  showViewAll?: boolean;
}

// Mock data for development - top 24h movers
const mockMovers: Mover[] = [
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', change_24h: 25.5, price: 0.0000012 },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', change_24h: 15.2, price: 0.000025 },
  { id: 'virtual-protocol', name: 'Virtual Protocol', symbol: 'VIRTUAL', change_24h: 12.8, price: 1.45 },
  { id: 'ai16z', name: 'ai16z', symbol: 'AI16Z', change_24h: -8.5, price: 0.15 },
  { id: 'pump', name: 'Pump', symbol: 'PUMP', change_24h: -12.3, price: 0.08 },
  { id: 'war', name: 'WAR', symbol: 'WAR', change_24h: -18.7, price: 0.01 },
];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.0001) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(8)}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function SkeletonCard() {
  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-8 bg-[#2d2d4a] rounded-full" />
        <div className="w-16 h-4 bg-[#2d2d4a] rounded" />
      </div>
      <div className="h-5 bg-[#2d2d4a] rounded w-20 mb-2" />
      <div className="h-4 bg-[#2d2d4a] rounded w-24 mb-3" />
      <div className="h-6 bg-[#2d2d4a] rounded w-16" />
    </div>
  );
}

function MoverCard({ mover, rank }: { mover: Mover; rank: number }) {
  const isPositive = mover.change_24h >= 0;

  return (
    <Link
      href={`/project/${mover.id}`}
      data-testid="mover-card"
      className="block bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            rank <= 3 
              ? isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              : 'bg-[#2d2d4a] text-gray-400'
          )}
        >
          {rank}
        </div>
        <span className={cn('text-sm font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
          {isPositive ? <TrendingUp className="inline w-4 h-4 mr-1" /> : <TrendingDown className="inline w-4 h-4 mr-1" />}
          24h
        </span>
      </div>

      <h3 className="text-base font-semibold text-white mb-1">{mover.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{mover.symbol}</p>

      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold text-white">{formatPrice(mover.price)}</span>
        <span className={cn('text-sm font-medium', isPositive ? 'text-green-500' : 'text-red-500')}>
          {formatChange(mover.change_24h)}
        </span>
      </div>
    </Link>
  );
}

export function BiggestMovers({ limit = 6, showViewAll = true }: BiggestMoversProps) {
  const [movers, setMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovers() {
      try {
        // In production, this would fetch from Supabase/CoinGecko
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sort by absolute change (biggest movers first - both up and down)
        const sorted = [...mockMovers]
          .sort((a, b) => Math.abs(b.change_24h) - Math.abs(a.change_24h))
          .slice(0, limit);
        
        setMovers(sorted);
      } catch (err) {
        setError('Failed to load biggest movers');
      } finally {
        setLoading(false);
      }
    }

    fetchMovers();
  }, [limit]);

  if (error) {
    return (
      <section className="w-full max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Biggest Movers 📈
        </h2>
        <p className="text-gray-400">Coins with the biggest 24h price changes</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
          : movers.map((mover, index) => (
              <MoverCard key={mover.id} mover={mover} rank={index + 1} />
            ))}
      </div>

      {/* View All Link */}
      {showViewAll && !loading && (
        <div className="text-center mt-10">
          <Link
            href="/movers"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}