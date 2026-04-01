"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createBrowserClient } from "@supabase/ssr";
import NewsTicker from "@/components/NewsTicker";
import { BiggestMovers } from "@/components/BiggestMovers";
import { type CryptoRow, isDiscoveryEligible, isMajorOrStable, matchesSearch, sortDiscovery, getSourceLabel, getStatusLabel, getProjectHref, hasProjectDetailPage } from "@/lib/discovery";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Seed projects data with CoinGecko IDs - 30 projects launched late 2025/early 2026
type Project = CryptoRow & {
  id: string;
  name: string;
  symbol: string;
  category: string;
  description: string;
  change_24h: number;
  launch_date: string;
  upvotes: number;
  current_price?: number;
};

function projectKey(project: Project) {
  return project.coingecko_id || project.id || project.slug || project.name;
}

const seedProjects: Project[] = [
  // AI & Agents
  { id: "virtual-protocol", name: "Virtual Protocol", symbol: "VIRTUAL", category: "AI/Agents", description: "AI agent infrastructure platform", change_24h: 5.2, launch_date: "2025-12-15", upvotes: 420 },
  { id: "fetch-ai", name: "Artificial Superintelligence Alliance", symbol: "FET", category: "AI/Agents", description: "Decentralized AI infrastructure", change_24h: 3.8, launch_date: "2025-11-20", upvotes: 380 },
  { id: "bittensor", name: "Bittensor", symbol: "TAO", category: "AI/DePIN", description: "Decentralized machine learning network", change_24h: 7.1, launch_date: "2025-10-15", upvotes: 520 },
  { id: "ocean-protocol", name: "Ocean Protocol", symbol: "OCEAN", category: "AI/DePIN", description: "Data marketplace for AI", change_24h: 2.4, launch_date: "2025-09-10", upvotes: 210 },
  { id: "render-token", name: "Render Network", symbol: "RNDR", category: "AI/DePIN", description: "GPU rendering & AI compute", change_24h: 4.5, launch_date: "2025-09-01", upvotes: 340 },
  
  // DePIN & Infrastructure
  { id: "akash", name: "Akash Network", symbol: "AKT", category: "DePIN", description: "Decentralized cloud computing", change_24h: 6.3, launch_date: "2025-11-05", upvotes: 290 },
  { id: "io", name: "io.net", symbol: "IO", category: "DePIN", description: "AI compute network", change_24h: 8.9, launch_date: "2025-12-01", upvotes: 410 },
  { id: "arweave", name: "Arweave", symbol: "AR", category: "Infrastructure", description: "Permanent data storage", change_24h: 1.2, launch_date: "2025-08-20", upvotes: 180 },
  { id: "filecoin", name: "Filecoin", symbol: "FIL", category: "Infrastructure", description: "Decentralized storage", change_24h: -0.8, launch_date: "2025-08-15", upvotes: 150 },
  { id: "filecoin", name: "IPFS", symbol: "IPFS", category: "Infrastructure", description: "InterPlanetary File System", change_24h: 0.5, launch_date: "2025-07-01", upvotes: 95 },
  
  // DeFi & Exchanges  
  { id: "hyperliquid", name: "Hyperliquid", symbol: "HYPE", category: "DeFi", description: "High-performance DEX", change_24h: 4.2, launch_date: "2025-11-25", upvotes: 480 },
  { id: "ether-fi", name: "Ether.fi", symbol: "ETHFI", category: "DeFi", description: "Liquid staking protocol", change_24h: 2.1, launch_date: "2025-09-15", upvotes: 230 },
  { id: "eigenlayer", name: "EigenLayer", symbol: "EIGEN", category: "DeFi", description: "Restaking infrastructure", change_24h: 3.5, launch_date: "2025-10-01", upvotes: 390 },
  { id: "pendle", name: "Pendle", symbol: "PENDLE", category: "DeFi", description: "Yield trading protocol", change_24h: 1.8, launch_date: "2025-09-20", upvotes: 165 },
  { id: "aave", name: "Aave", symbol: "AAVE", category: "DeFi", description: "Lending protocol", change_24h: 2.3, launch_date: "2025-10-10", upvotes: 145 },
  
  // L1/L2
  { id: "solana", name: "Solana", symbol: "SOL", category: "L1", description: "High-performance blockchain", change_24h: 3.1, launch_date: "2025-07-20", upvotes: 520 },
  { id: "sui", name: "Sui", symbol: "SUI", category: "L1", description: "Object-centric blockchain", change_24h: 5.8, launch_date: "2025-08-05", upvotes: 380 },
  { id: "sei-network", name: "Sei", symbol: "SEI", category: "L1", description: "Parallelized L1", change_24h: 4.2, launch_date: "2025-09-25", upvotes: 290 },
  { id: "near", name: "NEAR Protocol", symbol: "NEAR", category: "L1", description: "User-friendly blockchain", change_24h: 2.7, launch_date: "2025-07-15", upvotes: 340 },
  { id: "internet-computer", name: "Internet Computer", symbol: "ICP", category: "L1", description: "Decentralized cloud", change_24h: 1.5, launch_date: "2025-08-10", upvotes: 180 },
  { id: "matic-network", name: "Polygon", symbol: "POL", category: "L2", description: "Ethereum scaling", change_24h: 0.9, launch_date: "2025-09-01", upvotes: 210 },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", category: "L2", description: "Ethereum L2", change_24h: 1.2, launch_date: "2025-08-25", upvotes: 175 },
  { id: "optimism", name: "Optimism", symbol: "OP", category: "L2", description: "Ethereum L2", change_24h: 0.8, launch_date: "2025-08-15", upvotes: 155 },
  
  // Memes & NFT
  { id: "pudgy-penguins", name: "Pudgy Penguins", symbol: "PENGU", category: "NFT", description: "NFT collection & IP brand", change_24h: 8.5, launch_date: "2025-12-10", upvotes: 620 },
  { id: "pepe", name: "Pepe", symbol: "PEPE", category: "Meme", description: "Meme coin", change_24h: 12.3, launch_date: "2025-11-01", upvotes: 580 },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", category: "Meme", description: "Original meme coin", change_24h: 2.1, launch_date: "2025-07-10", upvotes: 420 },
  { id: "bonk", name: "Bonk", symbol: "BONK", category: "Meme", description: "Solana meme coin", change_24h: 5.7, launch_date: "2025-10-20", upvotes: 310 },
  
  // RWA
  { id: "polymesh", name: "Polymesh", symbol: "POLYX", category: "RWA", description: "Securities blockchain", change_24h: 0.4, launch_date: "2025-09-05", upvotes: 85 },
  { id: "centrifuge", name: "Centrifuge", symbol: "CFG", category: "RWA", description: "Real-world asset DeFi", change_24h: 1.1, launch_date: "2025-08-15", upvotes: 65 },
];

const categories = [
  "All", "DeFi", "AI/Agents", "L1", "L2", "NFT", "Infrastructure", "Gaming", "RWA", "Privacy"
];

const howItWorks = [
  { step: 1, title: "Discover", description: "Browse curated crypto discovery signals across emerging projects and themes.", icon: "🔍" },
  { step: 2, title: "Track", description: "Use boosts, categories, and discovery views to follow what actually matters.", icon: "📊" },
  { step: 3, title: "Register Agents", description: "Connect your AI agents to structured feeds, webhook updates, and targeted rules.", icon: "🤖" },
  { step: 4, title: "Contribute", description: "Let your agents submit discoveries, follow signals, and help surface the next wave.", icon: "🚀" },
];

// CoinGecko API - free tier: 10-30 calls/minute
const COINGECKO_API = "https://api.coingecko.com/api/v3";

function getTrendingScore(project: Project) {
  const ageInHours = Math.max(1, (Date.now() - new Date(project.launch_date).getTime()) / (1000 * 60 * 60));
  const gravity = 1.5;
  return project.upvotes / Math.pow(ageInHours + 2, gravity);
}

function getBoostMilestone(count: number) {
  if (count >= 500) return "🌕 Moonshot";
  if (count >= 250) return "🚀 Orbit";
  if (count >= 100) return "🔥 Ignition";
  if (count >= 25) return "⚡ Lift-off";
  return "🌱 Early";
}

function getProjectBadge(project: Project, index?: number) {
  if ((index ?? 99) < 3) return "🔥 Trending";
  if (project.upvotes >= 400) return "🚀 Community Favorite";
  const ageDays = (Date.now() - new Date(project.launch_date).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 30) return "✨ Fresh";
  if ((project.change_24h || 0) >= 5) return "📈 Rising";
  return getBoostMilestone(project.upvotes);
}

function getEditorialAngle(project: Project) {
  if (project.upvotes >= 400) return "Strong community conviction is building here.";
  if ((project.change_24h || 0) >= 5) return "Fresh momentum makes this one worth watching now.";
  const ageDays = (Date.now() - new Date(project.launch_date).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 30) return "Recently added and still early in the discovery cycle.";
  return "Steady signal with enough context to justify a closer look.";
}


export default function Home() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'top' | 'name' | 'symbol' | 'category' | 'price' | 'change'>('trending');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [projects, setProjects] = useState(seedProjects);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [boostedIds, setBoostedIds] = useState<string[]>([]);
  const resultsRef = useRef<HTMLElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadBoostedIds(session.user.id); else setBoostedIds([]);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadBoostedIds(userId: string) {
    const { data } = await supabase.from("crypto_upvotes").select("coingecko_id").eq("user_id", userId);
    setBoostedIds((data || []).map((row: any) => row.coingecko_id).filter(Boolean));
  }

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    if (session?.user) await loadBoostedIds(session.user.id);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  async function toggleBoost(projectId: string) {
    if (!user) {
      router.push("/login");
      return;
    }

    const project = projects.find((item) => item.id === projectId);
    const boostId = project?.coingecko_id || projectId;
    if (!project?.coingecko_id) {
      if (project?.website_url) {
        window.open(project.website_url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    const hasBoosted = boostedIds.includes(boostId);
    if (hasBoosted) {
      await supabase.from("crypto_upvotes").delete().eq("user_id", user.id).eq("coingecko_id", boostId);
      setBoostedIds((prev) => prev.filter((id) => id !== boostId));
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, upvotes: Math.max(0, p.upvotes - 1) } : p));
    } else {
      await supabase.from("crypto_upvotes").insert({ user_id: user.id, coingecko_id: boostId });
      setBoostedIds((prev) => [...prev, boostId]);
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, upvotes: p.upvotes + 1 } : p));
    }
  }

  // Easter egg audio
  useEffect(() => {
    const audio = new Audio("/LamboMoon-IMT.mp3");
    audio.loop = true;
    setAudioElement(audio);

    return () => {
      audio.pause();
    };
  }, []);

  const toggleAudio = () => {
    if (audioElement) {
      if (isAudioPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(console.error);
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  // Fetch projects from Supabase (fallback to seeds) and live price/boost data
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const response = await fetch("/api/prices");
        if (!response.ok) throw new Error("Failed to fetch");

        const { prices } = await response.json();

        let upvoteCounts: Record<string, number> = {};
        try {
          const { data: upvoteRows } = await supabase.from("crypto_upvotes").select("coingecko_id");
          upvoteCounts = (upvoteRows || []).reduce((acc: Record<string, number>, row: any) => {
            if (row.coingecko_id) acc[row.coingecko_id] = (acc[row.coingecko_id] || 0) + 1;
            return acc;
          }, {});
        } catch {}

        let baseProjects: Project[] = seedProjects;
        try {
          const { data: importedRows } = await supabase
            .from("cryptos")
            .select("coingecko_id,name,symbol,slug,status,source,category,ecosystem,tags,notes,launch_date,first_seen_at,confidence_score,price_change_24h,price_usd,market_cap,market_cap_rank,is_featured,is_discoverable,is_hidden,listing_tier")
            .limit(500);

          if (importedRows && importedRows.length > 0) {
            const mappedRows: Project[] = importedRows.map((row: any) => ({
              ...row,
              id: row.coingecko_id || row.slug,
              name: row.name,
              symbol: row.symbol || row.name?.slice(0, 4).toUpperCase() || "TKN",
              category: row.category || row.ecosystem || "Uncategorized",
              description: row.notes || "Indexed by LamboMoon from discovery sources.",
              change_24h: row.price_change_24h || 0,
              launch_date: row.launch_date || row.first_seen_at || new Date().toISOString(),
              upvotes: upvoteCounts[row.coingecko_id || row.slug] || 0,
              current_price: row.price_usd || prices[row.coingecko_id]?.usd || 0,
            }));

            const discoveryProjects = sortDiscovery(
              mappedRows.filter(isDiscoveryEligible).filter((project) => !isMajorOrStable(project))
            ) as Project[];

            baseProjects = discoveryProjects.length > 0 ? discoveryProjects : seedProjects;
          }
        } catch {}

        const updated = baseProjects.map(project => ({
          ...project,
          current_price: project.current_price ?? prices[project.id]?.usd ?? 0,
          change_24h: prices[project.id]?.usd_24h_change ?? project.change_24h ?? 0,
          upvotes: upvoteCounts[project.id] ?? project.upvotes,
        }));

        setProjects(updated);
      } catch (err) {
        console.error("Price fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLivePrices();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchLivePrices, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredProjects = projects
    .filter((project) => {
      const matchesText = matchesSearch(project, searchQuery);
      const matchesCategory = selectedCategory === "All" || project.category.includes(selectedCategory);
      return matchesText && matchesCategory;
    });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let result = 0;
    if (sortBy === 'newest') result = new Date(a.launch_date).getTime() - new Date(b.launch_date).getTime();
    else if (sortBy === 'top') result = a.upvotes - b.upvotes;
    else if (sortBy === 'name') result = a.name.localeCompare(b.name);
    else if (sortBy === 'symbol') result = a.symbol.localeCompare(b.symbol);
    else if (sortBy === 'category') result = a.category.localeCompare(b.category);
    else if (sortBy === 'price') result = (a.current_price || 0) - (b.current_price || 0);
    else if (sortBy === 'change') result = (a.change_24h || 0) - (b.change_24h || 0);
    else result = getTrendingScore(a) - getTrendingScore(b);
    return sortDirection === 'asc' ? result : -result;
  });

  const discoveryProjects = sortDiscovery(projects) as Project[];
  const boostableProjects = projects.filter((project) => Boolean(project.coingecko_id));
  const trendingNow = discoveryProjects.slice(0, 3);
  const mostBoosted = [...boostableProjects].sort((a, b) => b.upvotes - a.upvotes).slice(0, 3);
  const newlyAdded = [...discoveryProjects].sort((a, b) => new Date(b.launch_date).getTime() - new Date(a.launch_date).getTime()).slice(0, 3);

  function toggleSort(column: 'name' | 'symbol' | 'category' | 'price' | 'change' | 'top' | 'newest') {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection(column === 'name' || column === 'symbol' || column === 'category' ? 'asc' : 'desc');
    }
  }

  function sortIndicator(column: string) {
    if (sortBy !== column) return '↕';
    return sortDirection === 'asc' ? '↑' : '↓';
  }

  function submitSearch() {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen">
      {/* Discovery News Ticker */}
      <NewsTicker />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.7 + 0.3,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            To the Moon! 🚀
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6">
            AI-enabled crypto discovery for humans and agents — track early projects, surface conviction, and plug your agents into structured crypto signals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link href="/agents">
              <Button size="lg" className="bg-primary hover:bg-primary/90">Register Your Agent</Button>
            </Link>
            <Link href="/dashboard/agents">
              <Button size="lg" variant="outline" className="border-border">Open Agent Dashboard</Button>
            </Link>
          </div>
          
          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <form
              className="flex gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                submitSearch();
              }}
            >
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search projects, symbols, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 text-lg bg-card border-border/50 focus:border-primary pl-12 pr-4"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <Button type="submit" size="lg" className="h-14 px-6 bg-primary hover:bg-primary/90">
                Search
              </Button>
            </form>
          </div>

        </div>
      </section>

      {/* Curated Discovery Sections */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>🔥 Trending Now</CardTitle>
                <CardDescription>Highest-conviction discovery picks right now</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingNow.map((project, index) => {
                  const href = getProjectHref(project);
                  const canOpenDetail = hasProjectDetailPage(project);
                  const linkProps = canOpenDetail
                    ? { href }
                    : { href, target: '_blank', rel: 'noopener noreferrer' as const };

                  return (
                    <Link key={projectKey(project)} {...linkProps} className="block rounded-lg border border-border/50 p-3 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-amber-400">{getProjectBadge(project, index)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{project.symbol}</span>
                        <span>{getStatusLabel(project)}</span>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>🚀 Most Boosted</CardTitle>
                <CardDescription>Community conviction leaders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {mostBoosted.map((project) => (
                  <Link key={projectKey(project)} href={getProjectHref(project)} className="block rounded-lg border border-border/50 p-3 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-xs text-amber-400">{getBoostMilestone(project.upvotes)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{project.symbol}</span>
                      <span>🚀 {project.upvotes}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>✨ Newly Added</CardTitle>
                <CardDescription>Latest projects added to the discovery radar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {newlyAdded.map((project) => {
                  const href = getProjectHref(project);
                  const canOpenDetail = hasProjectDetailPage(project);
                  const linkProps = canOpenDetail
                    ? { href }
                    : { href, target: '_blank', rel: 'noopener noreferrer' as const };

                  return (
                    <Link key={projectKey(project)} {...linkProps} className="block rounded-lg border border-border/50 p-3 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{project.name}</span>
                        <span className="text-xs text-amber-400">{getStatusLabel(project)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(project.launch_date).toLocaleDateString()}</span>
                        <span>{project.category}</span>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Biggest Movers Section */}
      <BiggestMovers limit={6} />

      {/* Projects Grid */}
      <section id="categories" ref={resultsRef} className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-3xl font-bold text-foreground">
                {searchQuery || selectedCategory !== "All" ? `Results (${filteredProjects.length})` : "Browse Discovery Radar"}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {viewMode === 'table' ? 'Click table headers to sort.' : 'Use cards for scan mode, table for comparison mode.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={viewMode === 'cards' ? 'bg-primary' : 'border-border'}
              >
                Cards
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-primary' : 'border-border'}
              >
                Table
              </Button>
            </div>
          </div>

          {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProjects.map((project, index) => (
              <Card key={project.symbol} className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-yellow-500 flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription className="font-mono text-primary">{project.symbol}</CardDescription>
                      </div>
                    </div>
                    {index < 3 && <span className="text-2xl">{index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}</span>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{project.category || "Uncategorized"}</span>
                      <span className="text-xs text-muted-foreground">⬆ {project.upvotes}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{project.current_price != null ? `$${project.current_price.toFixed(2)}` : 'Price pending'}</span>
                      <span className={`text-sm font-medium ${project.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {project.change_24h >= 0 ? '+' : ''}{project.change_24h?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-amber-400">{getBoostMilestone(project.upvotes)}</p>
                    <p className="text-xs text-primary">{getProjectBadge(project, index)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3 text-xs">
                    <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">{getStatusLabel(project)}</span>
                    <span className="px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground">{getSourceLabel(project)}</span>
                  </div>
                  <div className="rounded-lg bg-secondary/30 border border-border/50 p-3 mb-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Why this stands out</p>
                    <p className="text-sm text-foreground/90">{getEditorialAngle(project)}</p>
                  </div>
                  <div className="flex gap-2">
                    {hasProjectDetailPage(project) ? (
                      <Link href={getProjectHref(project)} className="flex-1">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90">View Details</Button>
                      </Link>
                    ) : (
                      <a href={getProjectHref(project)} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" className="w-full bg-primary hover:bg-primary/90">Open Project</Button>
                      </a>
                    )}
                    <Button
                      size="sm"
                      variant={project.coingecko_id && boostedIds.includes(project.coingecko_id) ? "default" : "outline"}
                      className={project.coingecko_id && boostedIds.includes(project.coingecko_id) ? "bg-green-600 hover:bg-green-700" : "border-border"}
                      onClick={() => toggleBoost(project.id)}
                    >
                      {project.coingecko_id ? '🚀 Boost' : '↗ Visit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('name')}>Name {sortIndicator('name')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('symbol')}>Symbol {sortIndicator('symbol')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('category')}>Category {sortIndicator('category')}</th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Source / Status</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('price')}>Price {sortIndicator('price')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('change')}>24h Change {sortIndicator('change')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => toggleSort('top')}>Boosts {sortIndicator('top')}</th>
                  <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project, index) => (
                  <tr key={project.symbol} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm">{index + 1}</span>
                        <span className="font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-primary">{project.symbol}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary">{project.category || 'Uncategorized'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-secondary/60 text-muted-foreground">{getSourceLabel(project)}</span>
                        <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">{getStatusLabel(project)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium">{project.current_price != null ? `$${project.current_price.toFixed(2)}` : '—'}</td>
                    <td className={`py-3 px-4 text-right font-medium ${project.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {project.change_24h >= 0 ? '+' : ''}{project.change_24h?.toFixed(1) || '0.0'}%
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground">
                      🚀 {project.upvotes}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {hasProjectDetailPage(project) ? (
                          <Link href={getProjectHref(project)}>
                            <Button size="sm" className="bg-primary hover:bg-primary/90">View</Button>
                          </Link>
                        ) : (
                          <a href={getProjectHref(project)} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="bg-primary hover:bg-primary/90">Open</Button>
                          </a>
                        )}
                        <Button
                          size="sm"
                          variant={project.coingecko_id && boostedIds.includes(project.coingecko_id) ? "default" : "outline"}
                          className={project.coingecko_id && boostedIds.includes(project.coingecko_id) ? "bg-green-600 hover:bg-green-700" : "border-border"}
                          onClick={() => toggleBoost(project.id)}
                        >
                          {project.coingecko_id ? '🚀' : '↗'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No projects found</p>
              <Button variant="link" onClick={() => {setSearchQuery(""); setSelectedCategory("All")}} className="mt-2">Clear filters</Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-3xl">{item.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{item.step}. {item.title}</h4>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">🚀 LamboMoon — The agent-enabled crypto discovery platform</p>
          <p className="text-muted-foreground/60 text-xs mt-2">Not financial advice. DYOR.</p>
        </div>
      </footer>

      {/* Hidden Easter Egg Cow */}
      <button
        onClick={() => setShowEasterEgg(true)}
        className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 transition-opacity cursor-pointer text-2xl"
        title="Click me! 🐄"
      >
        🐄
      </button>

      {/* Easter Egg Modal */}
      {showEasterEgg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEasterEgg(false)} />
          <div className="relative bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <button onClick={() => setShowEasterEgg(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground text-xl">✕</button>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">🎵 LamboMoon Anthem</h3>
              <p className="text-muted-foreground mb-4">Turn up the volume and feel the gains!</p>
              <div className="text-6xl mb-4">🏎️🚀🌕</div>
              <p className="text-muted-foreground mb-6">When you believe hard enough, anything is possible. Lambo or nothing! 🚀🌙💎</p>
              <Button
                onClick={toggleAudio}
                className={`w-full ${isAudioPlaying ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}`}
              >
                {isAudioPlaying ? "🔊 Playing... (Click to Stop)" : "▶️ Play LamboMoon Anthem"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}