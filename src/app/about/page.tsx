"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Header - Same as main page */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="75" cy="25" r="18" fill="#f4f4f5" className="drop-shadow-lg" />
                  <circle cx="70" cy="22" r="16" fill="#0a0a0f" />
                  <circle cx="20" cy="15" r="1.5" fill="#f4f4f5" opacity="0.8" />
                  <circle cx="35" cy="30" r="1" fill="#f4f4f5" opacity="0.6" />
                  <circle cx="15" cy="40" r="1.2" fill="#f4f4f5" opacity="0.7" />
                  <circle cx="50" cy="10" r="1" fill="#f4f4f5" opacity="0.5" />
                  <g transform="translate(10, 55)">
                    <path d="M5 20 L15 10 L35 10 L45 20 L50 25 L50 30 L5 30 Z" fill="#22c55e" />
                    <path d="M18 10 L25 5 L38 5 L42 10" fill="#22c55e" />
                    <circle cx="15" cy="32" r="6" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
                    <circle cx="40" cy="32" r="6" fill="#27272a" stroke="#3f3f46" strokeWidth="2" />
                    <ellipse cx="48" cy="22" rx="3" ry="2" fill="#f59e0b" />
                    <line x1="0" y1="25" x2="-8" y2="23" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
                    <line x1="-2" y1="28" x2="-10" y2="28" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />
                  </g>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">LamboMoon</h1>
                <p className="text-xs text-muted-foreground">Crypto Discovery Platform</p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Trending
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                New
              </Button>
            </Link>
            <Link href="/#categories">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Categories
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
              About
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-border hover:bg-secondary">Sign In</Button>
            </Link>
            <Link href="/submit">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* About Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            About LamboMoon 🚀
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your gateway to discovering the next big thing in crypto before it moons.
          </p>
        </div>

        <div className="space-y-12">
          {/* What is LamboMoon */}
          <section className="bg-card/50 rounded-lg p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-4 text-foreground">What is LamboMoon?</h2>
            <p className="text-muted-foreground leading-relaxed">
              LamboMoon is a community-driven crypto discovery platform designed to help you find 
              the next 100x gems before they go mainstream. We aggregate data from across the 
              crypto ecosystem — trending tokens, new launches, AI projects, DeFi protocols, 
              and more — into one beautiful, easy-to-use interface.
            </p>
          </section>

          {/* Our Mission */}
          <section className="bg-card/50 rounded-lg p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-4 text-foreground">🌙 Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe the next big crypto winners are out there right now — lurking in Discord servers, 
              Telegram groups, and early-stage token launches. Our mission is to surface these 
              opportunities and make them accessible to everyone.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're a degen trader looking for the next 100x or a careful investor researching 
              solid projects, LamboMoon gives you the tools and data you need to make informed decisions.
            </p>
          </section>

          {/* Features */}
          <section className="bg-card/50 rounded-lg p-8 border border-border/50">
            <h2 className="text-2xl font-bold mb-6 text-foreground">✨ Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">🔥 Trending Alpha</h3>
                <p className="text-muted-foreground text-sm">
                  Real-time trending data to spot what's heating up right now.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">📊 Project Discovery</h3>
                <p className="text-muted-foreground text-sm">
                  Browse projects by category: DeFi, AI, L1/L2, NFTs, and more.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-amber-400">💎 Biggest Movers</h3>
                <p className="text-muted-foreground text-sm">
                  Track the biggest gainers and losers in real-time.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">🔔 Watchlists</h3>
                <p className="text-muted-foreground text-sm">
                  Save your favorite projects and get alerts when things move.
                </p>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="bg-amber-500/10 rounded-lg p-8 border border-amber-500/30">
            <h2 className="text-xl font-bold mb-4 text-amber-400">⚠️ Important Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              LamboMoon is for informational purposes only. We are not financial advisors. 
              Cryptocurrency investments are highly volatile and risky. Always do your own 
              research (DYOR) before making any investment decisions. Never invest more than 
              you can afford to lose.
            </p>
            <p className="text-muted-foreground text-sm mt-4">
              🚀 Lambo or nothing — but please invest responsibly! 🌙
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Discovering 🚀
            </Button>
          </Link>
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