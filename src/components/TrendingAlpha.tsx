'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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

// Mock data for development - Real projects from Scout's research (CoinGecko IDs)
const mockProjects: Project[] = [
  {
    id: 'virtual-protocol',
    name: 'Virtual Protocol',
    symbol: 'VIRTUAL',
    category: 'AI Agents',
    description: 'Decentralized AI agent infrastructure',
    price: 1.25,
    change_24h: 12.5,
    market_cap: 1250000000,
    launch_date: '2024-06-15',
    upvotes: 8500,
    featured: true,
  },
  {
    id: 'pippin',
    name: 'Pippin',
    symbol: 'PIPPIN',
    category: 'AI Meme',
    description: 'AI-powered meme coin',
    price: 0.08,
    change_24h: 25.2,
    market_cap: 80000000,
    launch_date: '2024-11-20',
    upvotes: 6200,
    featured: false,
  },
  {
    id: 'plume',
    name: 'Plume',
    symbol: 'PLUME',
    category: 'RWA L1',
    description: 'Real world assets Layer 1',
    price: 0.35,
    change_24h: 8.7,
    market_cap: 350000000,
    launch_date: '2024-09-01',
    upvotes: 4800,
    featured: true,
  },
  {
    id: 'pump',
    name: 'Pump',
    symbol: 'PUMP',
    category: 'Platform',
    description: 'Crypto launch platform',
    price: 0.15,
    change_24h: -3.2,
    market_cap: 150000000,
    launch_date: '2024-10-10',
    upvotes: 3200,
    featured: false,
  },
  {
    id: 'war',
    name: 'WAR',
    symbol: 'WAR',
    category: 'Meme',
    description: 'War-themed meme coin',
    price: 0.02,
    change_24h: 45.8,
    market_cap: 20000000,
    launch_date: '2024-12-05',
    upvotes: 2800,
    featured: true,
  },
  {
    id: 'ai16z',
    name: 'ai16z',
    symbol: 'AI16Z',
    category: 'AI Agents',
    description: 'AI-powered DeFi agent protocol',
    price: 0.12,
    change_24h: 18.3,
    market_cap: 120000000,
    launch_date: '2024-08-22',
    upvotes: 5100,
    featured: false,
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

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
    } else {
      setUpvotes(prev => prev + 1);
    }
    setHasUpvoted(!hasUpvoted);
  };

  const isPositive = project.change_24h >= 0;

  return (
    <Link
      href={`/project/${project.id}`}
      data-testid="alpha-card"
      className="block bg-[#1a1a2e] border border-[#2d2d4a] rounded-xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6b35]/50 hover:shadow-lg hover:shadow-[#ff6b35]/10"
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
    </Link>
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
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 text-[#ff6b35] hover:text-[#ff6b35]/80 transition-colors font-medium"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}