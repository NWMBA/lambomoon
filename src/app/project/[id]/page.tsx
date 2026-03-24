"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CoinGecko API response types
interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  description: {
    en: string;
  };
  image: {
    large: string;
    small: string;
    thumb: string;
  };
  market_data: {
    current_price: {
      usd: number;
    };
    price_change_percentage_24h: number;
    market_cap: {
      usd: number;
    };
    market_cap_rank: number;
    total_volume: {
      usd: number;
    };
    ath: {
      usd: number;
    };
    ath_date: {
      usd: string;
    };
    fully_diluted_valuation: {
      usd: number | null;
    };
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
  };
  genesis_date: string | null;
  links: {
    homepage: string[];
    blockchain_site: string[];
  };
}

// LamboMoon curation data - hardcoded for now
const lamboMoonData: Record<string, { whyItCouldMoon: string; riskLevel: "Low" | "Medium" | "High" }> = {
  bitcoin: {
    whyItCouldMoon: "Digital gold narrative, institutional adoption growing",
    riskLevel: "Low",
  },
  ethereum: {
    whyItCouldMoon: "DeFi ecosystem dominance, ETF inflows",
    riskLevel: "Medium",
  },
  solana: {
    whyItCouldMoon: "High-speed, low-cost transactions, meme coin boom",
    riskLevel: "High",
  },
  dogecoin: {
    whyItCouldMoon: "Elon tweets, community strength",
    riskLevel: "High",
  },
  "shiba-inu": {
    whyItCouldMoon: "Massive holder base, token burns",
    riskLevel: "High",
  },
};

// Get LamboMoon curation data for a coin
function getLamboMoonData(coinId: string) {
  return lamboMoonData[coinId] || {
    whyItCouldMoon: "Undervalued gem with strong community potential",
    riskLevel: "Medium" as const,
  };
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-4"></div>
      <div className="h-6 w-24 bg-muted rounded mb-8"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded"></div>
        ))}
      </div>
      <div className="h-64 bg-muted rounded"></div>
    </div>
  );
}

// Error component
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">😢</div>
      <h2 className="text-2xl font-bold mb-2">Oops!</h2>
      <p className="text-muted-foreground mb-4">{message}</p>
      <Button onClick={onRetry} className="bg-primary hover:bg-primary/90">
        Try Again
      </Button>
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coinId = params.id as string;
  
  const [coinData, setCoinData] = useState<CoinGeckoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Check auth and tracking status
  useEffect(() => {
    checkAuth();
  }, [coinId]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      // Check if tracking this coin
      const { data } = await supabase
        .from("tracked_cryptos")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("coingecko_id", coinId)
        .single();
      setIsTracking(!!data);
    }
  }

  async function toggleTrack() {
    if (!user) {
      router.push("/login");
      return;
    }
    setTrackingLoading(true);
    if (isTracking) {
      await supabase.from("tracked_cryptos").delete().eq("user_id", user.id).eq("coingecko_id", coinId);
      setIsTracking(false);
    } else {
      await supabase.from("tracked_cryptos").insert({ user_id: user.id, coingecko_id: coinId });
      setIsTracking(true);
    }
    setTrackingLoading(false);
  }

  const fetchCoinData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Coin not found. Make sure the coin ID is correct.");
        }
        throw new Error("Failed to fetch coin data. Please try again.");
      }
      
      const data = await response.json();
      setCoinData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinData();
  }, [coinId]);

  // Format numbers with commas and proper decimals
  const formatPrice = (price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    }
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    }
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error || !coinData) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <ErrorState message={error || "Failed to load coin data"} onRetry={fetchCoinData} />
        </div>
      </div>
    );
  }

  const { 
    price_change_percentage_24h, 
    current_price, 
    market_cap, 
    total_volume, 
    ath, 
    ath_date,
    fully_diluted_valuation,
    circulating_supply,
    total_supply,
    max_supply,
    market_cap_rank
  } = coinData.market_data;
  const changeColor = price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400";
  const changeIcon = price_change_percentage_24h >= 0 ? "📈" : "📉";

  const lamboData = getLamboMoonData(coinData.id);
  const launchDate = coinData.genesis_date;

  // Calculate age
  const getAge = () => {
    if (!launchDate) return "Unknown";
    const genesis = new Date(launchDate);
    const now = new Date();
    const years = now.getFullYear() - genesis.getFullYear();
    const months = now.getMonth() - genesis.getMonth();
    const totalMonths = years * 12 + months;
    if (totalMonths < 1) return "Just launched!";
    if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
    const y = Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    return `${y}y ${m}m`;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Coin Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-card border-2 border-primary/30">
            <img
              src={coinData.image.large}
              alt={coinData.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{coinData.name}</h1>
            <p className="text-xl text-muted-foreground font-mono uppercase mb-2">{coinData.symbol}</p>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold ${changeColor}`}>
                {changeIcon} {price_change_percentage_24h >= 0 ? "+" : ""}{price_change_percentage_24h?.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">24h</span>
            </div>
            <div className="mt-4">
              <Button 
                onClick={toggleTrack}
                disabled={trackingLoading}
                className={isTracking ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}
              >
                {trackingLoading ? "..." : isTracking ? "✓ Tracked" : "Track"}
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Current Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(current_price.usd)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(market_cap.usd)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">24h Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(total_volume.usd)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">All-Time High</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(ath.usd)}</div>
              <div className="text-xs text-muted-foreground">{formatDate(ath_date.usd)}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Market Cap Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{market_cap_rank}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">FDV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fully_diluted_valuation?.usd ? formatNumber(fully_diluted_valuation.usd) : "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Launch Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{launchDate ? new Date(launchDate).toLocaleDateString() : "Unknown"}</div>
              <div className="text-xs text-muted-foreground">{getAge()}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Circulating Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{circulating_supply ? formatNumber(circulating_supply) : "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Total Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total_supply ? formatNumber(total_supply) : "N/A"}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Max Supply</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{max_supply ? formatNumber(max_supply) : "Unlimited"}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Why It Could Moon 🚀</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-medium text-amber-400">{lamboData?.whyItCouldMoon || "High potential based on market trends"}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal">Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                lamboData?.riskLevel === 'Low' ? 'bg-green-500/20 text-green-400' :
                lamboData?.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {lamboData?.riskLevel || "High"} Risk
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {coinData.description?.en && (
          <Card className="bg-card/50 border-border/50 mb-8">
            <CardHeader>
              <CardTitle>About {coinData.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-invert prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: coinData.description.en }}
              />
            </CardContent>
          </Card>
        )}

        {/* Official Links */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Official Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {coinData.links.homepage?.[0] && (
                <a
                  href={coinData.links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Website
                </a>
              )}
              {coinData.links.blockchain_site?.[0] && (
                <a
                  href={coinData.links.blockchain_site[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Block Explorer
                </a>
              )}
              <a
                href={`https://www.coingecko.com/en/coins/${coinData.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                CoinGecko
              </a>
            </div>
          </CardContent>
        </Card>
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