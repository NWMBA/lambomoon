"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Session, User } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const categories = ["DeFi", "AI", "Gaming", "Memecoin", "Infrastructure", "Other"];

export default function SubmitPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check for session from server-rendered data
    const initSession = async () => {
      const stored = (window as any).__supabase_session;
      if (stored) {
        setSession(stored);
        setUser(stored.user);
      }
      
      // Also check with Supabase
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      if (supabaseSession) {
        setSession(supabaseSession);
        setUser(supabaseSession.user);
      }
      setLoading(false);
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session || !user) return;
    
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const submission = {
      user_id: user.id,
      coin_name: formData.get("coinName"),
      symbol: formData.get("symbol"),
      contract_address: formData.get("contractAddress") || null,
      website_url: formData.get("website") || null,
      description: formData.get("description"),
      category: formData.get("category"),
      twitter_url: formData.get("twitter") || null,
      telegram_url: formData.get("telegram") || null,
      status: "pending",
    };

    const { error } = await supabase.from("submissions").insert(submission);
    setSubmitting(false);
    
    if (!error) {
      setSubmitted(true);
    } else {
      alert("Error: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-white mb-2">Submission Received!</h1>
          <p className="text-slate-400">We'll review your gem and get back to you soon.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-2">Sign In Required</h1>
          <p className="text-slate-400 mb-6">You need an account to submit gems to LamboMoon.</p>
          <button 
            onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-6 py-3 rounded-lg"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Submit a Gem 🚀</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">{user?.email}</span>
            <button onClick={handleSignOut} className="text-slate-400 hover:text-white">
              Sign Out
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Coin Name *</label>
              <input name="coinName" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="e.g. Bitcoin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Symbol *</label>
              <input name="symbol" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="e.g. BTC" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contract Address</label>
            <input name="contractAddress" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="0x..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
            <input name="website" type="url" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="https://" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
            <select name="category" required className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white">
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Why should we feature this? *</label>
            <textarea name="description" required rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="Tell us why this coin could moon..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Twitter/X</label>
              <input name="twitter" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="https://x.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telegram</label>
              <input name="telegram" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" placeholder="https://t.me/..." />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-black font-semibold py-3 rounded-lg">
            {submitting ? "Submitting..." : "Submit Gem"}
          </button>
        </form>
      </div>
    </div>
  );
}