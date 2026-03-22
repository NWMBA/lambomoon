'use client';

import { useState, useEffect } from 'react';
import { Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  name: string;
  symbol: string;
  category: string;
  description: string;
  price: number;
  change_24h: number;
  market_cap: number;
  launch_date: string;
  upvotes: number;
  featured: boolean;
}

interface TrendingAlphaProps {
  limit?: number;
  showViewAll?: boolean;
}

// Mock data for development
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Bitcoin',
    symbol: 'BTC',
    category: 'Layer 1',
    description: 'Digital gold and store of value',
    price: 67000,
    change_24h: 2.5,
    market_cap: 1300000000000,
    launch_date: '2009-01-03',
    upvotes: 15000,
    featured: true,
  },
  {
    id: '2',
    name: 'Ethereum',
    symbol: 'ETH',
    category: 'Smart Contracts',
    description: 'World computer',
    price: 3500,
    change_24h: -1.2,
    market_cap: 420000000000,
    launch_date: '2015-07-30',
    upvotes: 12000,
    featured: false,
  },
  {
    id: '3',
    name: 'Solana',
    symbol: 'SOL',
    category: 'Layer 1',
    description: 'Fast blockchain',
    price: 180,
    change_24h: 5.8,
    market_cap: 80000000000,
    launch_date: '2020-03-16',
    upvotes: 8000,
    featured: true,
  },
  {
    id: '4',
    name: 'Cardano',
    symbol: 'ADA',
    category: 'Layer 1',
    description: 'Proof of stake blockchain',
    price: 0.65,
    change_24h: 3.2,
    market_cap: 23000000000,
    launch_date: '2017-09-01',
    upvotes: 6500,
    featured: false,
  },
  {
    id: '5',
    name: 'Polkadot',
    symbol: 'DOT',
    category: 'Interoperability',
    description: 'Cross-chain protocol',
    price: 8.5,
    change_24h: -0.5,
    market_cap: 12000000000,
    launch_date: '2020-05-26',
    upvotes: 5500,
    featured: false,
  },
  {
    id: '6',
    name: 'Avalanche',
    symbol: 'AVAX',
    category: 'Layer 1',
    description: 'High-speed blockchain',
    price: 42,
    change_24h: 4.1,
    market_cap: 16000000000,
    launch_date: '2020-09-21',
    upvotes: 4800,
    featured: true,
  },
];

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(4)}`;
}

function formatMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(1)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(1)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(1)}M`;
  return `$${cap.toLocaleString()}`;
}

function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

function SkeletonCard() {
  return (
    <div className="bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 bg-[#2d2d4a] rounded-full" />
        <div className="w-16 h-5 bg-[#2d2d4a] rounded-full" />
      </div>
      <div className="h-5 bg-[#2d2d4a] rounded w-24 mb-2" />
      <div className="h-4 bg-[#2d2d4a] rounded w-16 mb-4" />
      <div className="h-6 bg-[#2d2d4a] rounded w-20 mb-2" />
      <div className="h-4 bg-[#2d2d4a] rounded w-32" />
    </div>
  );
}

function AlphaCard({ project, rank }: { project: Project; rank: number }) {
  const [upvotes, setUpvotes] = useState(project.upvotes);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
    } else {
      setUpvotes(prev => prev + 1);
    }
    setHasUpvoted(!hasUpvoted);
  };

  const isPositive = project.change_24h >= 0;

  return (
    <div
      data-testid="alpha-card"
      className="group bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6b35]/50 hover:shadow-lg hover:shadow-[#ff6b35]/10"
    >
      {/* Rank Badge */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
            rank <= 3 ? 'bg-[#ff6b35] text-white' : 'bg-[#2d2d4a] text-gray-300'
          )}
        >
          {rank}
        </div>
        <span className="text-xs px-2 py-1 bg-[#2d2d4a] rounded-full text-gray-300">
          {project.category}
        </span>
      </div>

      {/* Project Info */}
      <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
      <p className="text-sm text-gray-400 mb-3">{project.symbol}</p>

      {/* Price */}
      <div className="mb-2">
        <span className="text-xl font-bold text-white">{formatPrice(project.price)}</span>
      </div>

      {/* 24h Change */}
      <div className={cn('text-sm font-medium mb-3', isPositive ? 'text-green-500' : 'text-red-500')}>
        {isPositive ? <TrendingUp className="inline w-4 h-4 mr-1" /> : null}
        {formatChange(project.change_24h)} (24h)
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>MCap: {formatMarketCap(project.market_cap)}</span>
      </div>

      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
          hasUpvoted
            ? 'bg-red-500/20 text-red-500'
            : 'bg-[#2d2d4a] text-gray-400 hover:bg-[#2d2d4a]/80'
        )}
      >
        <Heart className={cn('w-4 h-4', hasUpvoted && 'fill-current')} />
        <span>{upvotes.toLocaleString()}</span>
      </button>
    </div>
  );
}

export function TrendingAlpha({ limit = 6, showViewAll = true }: TrendingAlphaProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        // In production, this would fetch from Supabase
        // For now, use mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setProjects(mockProjects.slice(0, limit));
      } catch (err) {
        setError('Failed to load trending projects');
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [limit]);

  if (error) {
    return (
      <section className="w-full max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#ff6b35] text-white rounded-lg hover:bg-[#ff6b35]/90 transition-colors"
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
          Trending Alpha 🔥
        </h2>
        <p className="text-gray-400">Top opportunities from the community</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
          : projects.map((project, index) => (
              <AlphaCard key={project.id} project={project} rank={index + 1} />
            ))}
      </div>

      {/* View All Link */}
      {showViewAll && !loading && (
        <div className="text-center mt-10">
          <a
            href="/trending"
            className="inline-flex items-center gap-2 text-[#ff6b35] hover:text-[#ff6b35]/80 transition-colors font-medium"
          >
            View All <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </section>
  );
}