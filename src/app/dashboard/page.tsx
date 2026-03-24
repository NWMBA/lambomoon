"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackedCryptos, setTrackedCryptos] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);

  async function fetchDashboardData(userId: string) {
    // Fetch tracked cryptos
    const { data: tracked } = await supabase
      .from("tracked_cryptos")
      .select(`
        *,
        cryptos (
          name,
          symbol,
          logo_url,
          category,
          coingecko_id
        )
      `)
      .eq("user_id", userId);

    // Fetch votes
    const { data: userVotes } = await supabase
      .from("crypto_votes")
      .select(`
        *,
        cryptos (
          name,
          symbol,
          logo_url
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    setTrackedCryptos(tracked || []);
    setVotes(userVotes || []);
    setLoading(false);
  }

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchDashboardData(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchDashboardData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function untrack(cryptoId: string) {
    if (!user) return;
    
    await supabase
      .from("tracked_cryptos")
      .delete()
      .eq("user_id", user.id)
      .eq("crypto_id", cryptoId);

    setTrackedCryptos(prev => prev.filter(t => t.crypto_id !== cryptoId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your dashboard</h1>
          <Link href="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="75" cy="25" r="18" fill="#f4f4f5" />
                <circle cx="70" cy="22" r="16" fill="#0a0a0f" />
                <g transform="translate(10, 55)">
                  <path d="M5 20 L15 10 L35 10 L45 20 L50 25 L50 30 L5 30 Z" fill="#22c55e" />
                  <path d="M18 10 L25 5 L38 5 L42 10" fill="#22c55e" />
                </g>
              </svg>
            </div>
            <span className="text-xl font-bold">LamboMoon</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-primary hover:underline">
              Profile
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">My Dashboard</h1>

        {/* Tracked Cryptos */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Tracked Cryptos</h2>
            <Link href="/" className="text-primary hover:underline text-sm">
              Discover more →
            </Link>
          </div>

          {trackedCryptos.length === 0 ? (
            <div className="bg-card rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">You haven't tracked any cryptos yet</p>
              <Link 
                href="/" 
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Discover Cryptos
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {trackedCryptos.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between bg-card rounded-lg p-4 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {item.cryptos?.logo_url ? (
                        <img src={item.cryptos.logo_url} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <span className="font-bold">{item.cryptos?.symbol?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <Link href={`/project/${item.cryptos?.coingecko_id}`} className="font-medium hover:text-primary">
                        {item.cryptos?.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.cryptos?.symbol}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {item.entry_price && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Entry</p>
                        <p className="font-medium">${item.entry_price}</p>
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-right max-w-xs">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm truncate">{item.notes}</p>
                      </div>
                    )}
                    <button
                      onClick={() => untrack(item.coingecko_id)}
                      className="text-muted-foreground hover:text-red-400 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Votes */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Votes</h2>
          
          {votes.length === 0 ? (
            <p className="text-muted-foreground">You haven't voted on any cryptos yet</p>
          ) : (
            <div className="space-y-2">
              {votes.map((vote) => (
                <div 
                  key={vote.id}
                  className="flex items-center justify-between bg-card rounded-lg p-4 border border-border"
                >
                  <div className="flex items-center gap-4">
                    <span className={vote.vote_type === "up" ? "text-green-400" : "text-red-400"}>
                      {vote.vote_type === "up" ? "👍" : "👎"}
                    </span>
                    <Link 
                      href={`/project/${vote.cryptos?.coingecko_id}`}
                      className="font-medium hover:text-primary"
                    >
                      {vote.cryptos?.name}
                    </Link>
                    <span className="text-muted-foreground">({vote.cryptos?.symbol})</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(vote.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}