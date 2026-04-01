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
  source?: string;
  status?: string;
}

interface TrendingAlphaProps {
  limit?: number;
  showViewAll?: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString()}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price > 0) return `$${price.toFixed(4)}`;
  return 'Early';
}

function formatMarketCap(cap: number): string {
  if (!cap) return 'Pre-market';
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

      <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
      <p className="text-sm text-gray-400 mb-2">{project.symbol}</p>
      <p className="text-xs text-[#ff6b35] mb-3 uppercase tracking-wide">{project.status || project.source || 'discovery'}</p>

      <div className="mb-2">
        <span className="text-xl font-bold text-white">{formatPrice(project.price)}</span>
      </div>

      <div className={cn('text-sm font-medium mb-3', isPositive ? 'text-green-500' : 'text-red-500')}>
        {project.price > 0 ? (
          <>
            {isPositive ? <TrendingUp className="inline w-4 h-4 mr-1" /> : null}
            {formatChange(project.change_24h)} (24h)
          </>
        ) : (
          'Awaiting live market data'
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
        <span>MCap: {formatMarketCap(project.market_cap)}</span>
      </div>

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
        const response = await fetch('/api/projects/discovery');
        if (!response.ok) throw new Error('Failed to load discovery feed');
        const data = await response.json();
        setProjects((data.projects || []).slice(0, limit));
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
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Trending Alpha 🔥
        </h2>
        <p className="text-gray-400">Discovery-first projects from the LamboMoon radar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)
          : projects.map((project, index) => (
              <AlphaCard key={project.id} project={project} rank={index + 1} />
            ))}
      </div>

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
