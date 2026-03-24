"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CoinData = {
  id: string;
  name: string;
  symbol: string;
  description?: { en?: string };
  image?: { large?: string };
  links?: { homepage?: string[]; blockchain_site?: string[] };
  market_data?: {
    current_price?: { usd?: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    market_cap_rank?: number;
  };
};

function formatMoney(value?: number) {
  if (value == null) return "N/A";
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  if (value >= 1) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(6)}`;
}

function getBoostMilestone(count: number) {
  if (count >= 500) return "🌕 Moonshot";
  if (count >= 250) return "🚀 Orbit";
  if (count >= 100) return "🔥 Ignition";
  if (count >= 25) return "⚡ Lift-off";
  return "🌱 Early";
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const coinId = params.id as string;

  const [coinData, setCoinData] = useState<CoinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvoteLoading, setUpvoteLoading] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  async function refreshSocial(userId?: string) {
    const { count } = await supabase
      .from("crypto_upvotes")
      .select("id", { count: "exact", head: true })
      .eq("coingecko_id", coinId);
    setUpvoteCount(count || 0);

    const { data: commentRows } = await supabase
      .from("crypto_comments")
      .select(`
        *,
        profiles (
          username,
          avatar_id
        )
      `)
      .eq("coingecko_id", coinId)
      .order("created_at", { ascending: false });
    setComments(commentRows || []);

    if (userId) {
      const { data: tracked } = await supabase
        .from("tracked_cryptos")
        .select("id")
        .eq("user_id", userId)
        .eq("coingecko_id", coinId)
        .maybeSingle();
      setIsTracking(!!tracked);

      const { data: upvoted } = await supabase
        .from("crypto_upvotes")
        .select("id")
        .eq("user_id", userId)
        .eq("coingecko_id", coinId)
        .maybeSingle();
      setHasUpvoted(!!upvoted);
    } else {
      setIsTracking(false);
      setHasUpvoted(false);
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await refreshSocial(session.user.id);
      } else {
        await refreshSocial();
      }
    };
    initAuth();
  }, [coinId]);

  useEffect(() => {
    const fetchCoinData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`);
        if (!response.ok) throw new Error("Failed to fetch coin data");
        const data = await response.json();
        setCoinData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    fetchCoinData();
  }, [coinId]);

  async function toggleTrack() {
    if (!user) {
      router.push("/login");
      return;
    }
    setTrackingLoading(true);
    try {
      if (isTracking) {
        await supabase
          .from("tracked_cryptos")
          .delete()
          .eq("user_id", user.id)
          .eq("coingecko_id", coinId);
        setIsTracking(false);
      } else {
        await supabase
          .from("tracked_cryptos")
          .insert({ user_id: user.id, coingecko_id: coinId });
        setIsTracking(true);
      }
    } finally {
      setTrackingLoading(false);
    }
  }

  async function toggleUpvote() {
    if (!user) {
      router.push("/login");
      return;
    }
    setUpvoteLoading(true);
    try {
      if (hasUpvoted) {
        await supabase
          .from("crypto_upvotes")
          .delete()
          .eq("user_id", user.id)
          .eq("coingecko_id", coinId);
        setHasUpvoted(false);
        setUpvoteCount((v) => Math.max(0, v - 1));
      } else {
        await supabase
          .from("crypto_upvotes")
          .insert({ user_id: user.id, coingecko_id: coinId });
        setHasUpvoted(true);
        setUpvoteCount((v) => v + 1);
      }
    } finally {
      setUpvoteLoading(false);
    }
  }

  async function submitComment() {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await supabase.from("crypto_comments").insert({
        user_id: user.id,
        coingecko_id: coinId,
        content: commentText.trim(),
      });
      setCommentText("");
      await refreshSocial(user.id);
    } finally {
      setCommentLoading(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading coin…</p></div>;
  }

  if (error || !coinData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Couldn’t load coin</h1>
          <p className="text-muted-foreground mb-4">{error || "Unknown error"}</p>
          <Link href="/"><Button>Back Home</Button></Link>
        </div>
      </div>
    );
  }

  const change = coinData.market_data?.price_change_percentage_24h ?? 0;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">← Back to browse</Link>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-card border border-border flex items-center justify-center">
            {coinData.image?.large ? (
              <img src={coinData.image.large} alt={coinData.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold uppercase">{coinData.symbol?.[0]}</span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">{coinData.name}</h1>
            <p className="text-xl text-muted-foreground font-mono uppercase mb-3">{coinData.symbol}</p>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xl font-bold ${change >= 0 ? "text-green-400" : "text-red-400"}`}>
                {change >= 0 ? "+" : ""}{change.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">24h</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={toggleUpvote}
                disabled={upvoteLoading}
                className={hasUpvoted ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}
              >
                {upvoteLoading ? "…" : hasUpvoted ? `🚀 Boosted (${upvoteCount})` : `🚀 Boost (${upvoteCount})`}
              </Button>
              <span className="text-xs text-amber-400">{getBoostMilestone(upvoteCount)}</span>
              <Button
                onClick={toggleTrack}
                disabled={trackingLoading}
                className={isTracking ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600 text-black"}
              >
                {trackingLoading ? "…" : isTracking ? "✓ Tracked" : "Track"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardHeader><CardTitle className="text-sm">Price</CardTitle></CardHeader><CardContent>{formatMoney(coinData.market_data?.current_price?.usd)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Market Cap</CardTitle></CardHeader><CardContent>{formatMoney(coinData.market_data?.market_cap?.usd)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">24h Volume</CardTitle></CardHeader><CardContent>{formatMoney(coinData.market_data?.total_volume?.usd)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Rank</CardTitle></CardHeader><CardContent>#{coinData.market_data?.market_cap_rank ?? "N/A"}</CardContent></Card>
        </div>

        {coinData.description?.en && (
          <Card className="mb-8">
            <CardHeader><CardTitle>About {coinData.name}</CardTitle></CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: coinData.description.en }} />
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardHeader><CardTitle>Boost Comments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none resize-none"
                  placeholder={user ? "Why are you bullish on this one?" : "Sign in to comment"}
                  disabled={!user || commentLoading}
                />
                <Button onClick={submitComment} disabled={!user || commentLoading || !commentText.trim()}>
                  {commentLoading ? "Posting..." : "Post Comment"}
                </Button>
              </div>
              <div className="space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No comments yet.</p>
                ) : comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border border-border p-3 bg-card/40">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {comment.profiles?.avatar_id || "🚀"}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{comment.profiles?.username || "Anon"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Official Links</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {coinData.links?.homepage?.[0] && (
                <a href={coinData.links.homepage[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-lg transition-colors">Website</a>
              )}
              {coinData.links?.blockchain_site?.[0] && (
                <a href={coinData.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors">Block Explorer</a>
              )}
              <a href={`https://www.coingecko.com/en/coins/${coinData.id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors">CoinGecko</a>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
