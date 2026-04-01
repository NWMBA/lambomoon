"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialise auth and listen for changes
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
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

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link href="/#categories" className="text-muted-foreground hover:text-foreground">
            Discovery Radar
          </Link>
          <Link href="/agents" className="text-muted-foreground hover:text-foreground">
            Agent API
          </Link>
          <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground">
            How It Works
          </Link>
          <Link href="/movers" className="text-muted-foreground hover:text-foreground">
            Movers
          </Link>
          {user && (
            <>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link href="/dashboard/agents" className="text-muted-foreground hover:text-foreground">
                Agents
              </Link>
              <Link href="/curator" className="text-muted-foreground hover:text-foreground">
                Curator
              </Link>
            </>
          )}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="text-sm text-muted-foreground">…</span>
          ) : user ? (
            <>
              <Link href="/submit">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">
                  Submit Project
                </button>
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/agents">
                <button className="px-4 py-2 border border-border rounded-lg hover:bg-secondary text-sm text-foreground">
                  Register Agent
                </button>
              </Link>
              <Link href="/login">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm">
                  Sign In
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}