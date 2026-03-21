"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Seed projects data
const seedProjects = [
  { name: "Bittensor", symbol: "TAO", category: "AI/DePIN", description: "Decentralized machine learning network", change: "+12.4%" },
  { name: "Pi Network", symbol: "PI", category: "Infrastructure", description: "Mobile mining cryptocurrency", change: "+5.2%" },
  { name: "Hyperliquid", symbol: "HYPE", category: "DeFi", description: "High-performance decentralized exchange", change: "+8.7%" },
  { name: "Ether.fi", symbol: "ETHFI", category: "LSD", description: "Liquid staking protocol", change: "+3.1%" },
  { name: "Pudgy Penguins", symbol: "PENGU", category: "NFT", description: "NFT collection and IP brand", change: "+15.8%" },
  { name: "Artificial Superintelligence Alliance", symbol: "FET", category: "AI/Agents", description: "AI blockchain infrastructure", change: "+9.3%" },
];

const categories = [
  "All", "DeFi", "AI/Agents", "L1", "L2", "NFT", "Infrastructure", "Gaming", "RWA", "Privacy"
];

const howItWorks = [
  { step: 1, title: "Discover", description: "Browse trending projects across all categories", icon: "🔍" },
  { step: 2, title: "Research", description: "Read detailed analysis and community sentiment", icon: "📊" },
  { step: 3, title: "Track", description: "Add projects to your watchlist and get alerts", icon: "🔔" },
  { step: 4, title: "Moon", description: "Watch your discoveries take off to the moon! 🚀", icon: "🌕" },
];

export default function Home() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

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

  const filteredProjects = seedProjects.filter((project) => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || project.category.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Trending</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">New</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Categories</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">About</Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-border hover:bg-secondary">Sign In</Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
          </div>
        </div>
      </header>

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
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover the next 100x crypto gems before they take off
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">2,500+</div>
              <div className="text-sm text-muted-foreground">Projects Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">150K+</div>
              <div className="text-sm text-muted-foreground">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">$4.2B</div>
              <div className="text-sm text-muted-foreground">Market Cap Discovered</div>
            </div>
          </div>
          
          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative">
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
          </div>

          {/* CTA */}
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">Explore Now</Button>
            <Button size="lg" variant="outline" className="border-border">Learn More</Button>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-8 border-y border-border/30 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
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
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-bold text-foreground">
              {searchQuery || selectedCategory !== "All" ? `Results (${filteredProjects.length})` : "🔥 Trending Projects"}
            </h3>
            <Button variant="outline" className="border-border hover:bg-secondary">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
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
                    <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">{project.category}</span>
                    <span className="text-sm text-green-400 font-medium">{project.change}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">View Details</Button>
                    <Button size="sm" variant="outline">🔖</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

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
          <p className="text-muted-foreground text-sm">🚀 LamboMoon — Discover the next big thing before it moons</p>
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