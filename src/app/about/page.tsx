"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Header - Same as main page */}
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