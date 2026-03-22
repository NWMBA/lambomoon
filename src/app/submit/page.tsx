"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, LogOut } from "lucide-react";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const categories = [
  "DeFi",
  "NFT",
  "Gaming",
  "AI",
  "Layer 1",
  "Layer 2",
  "Meme",
  "Utility",
  "Social",
  "Other"
];

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coinName: "",
    symbol: "",
    contractAddress: "",
    website: "",
    category: "",
    description: "",
    twitter: "",
    telegram: ""
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not logged in, redirect to login with return URL
    if (!user) {
      router.push("/login?redirect=/submit");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("projects").insert({
      name: formData.coinName,
      symbol: formData.symbol.toUpperCase(),
      contract_address: formData.contractAddress || null,
      website: formData.website || null,
      category: formData.category,
      description: formData.description,
      twitter: formData.twitter || null,
      telegram: formData.telegram || null,
      user_id: user.id
    });

    setSubmitting(false);

    if (error) {
      alert("Error submitting: " + error.message);
    } else {
      alert("Submitted successfully! We'll review it soon.");
      router.push("/");
      router.refresh();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Submit a Gem 🚀</h1>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-slate-400">{user.email}</span>
              <button onClick={handleSignOut} className="text-slate-400 hover:text-white flex items-center gap-1">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login?redirect=/submit">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
          )}
        </div>

        {!user && (
          <Card className="mb-6 bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-300">
                <Link href="/login?redirect=/submit" className="text-purple-400 hover:underline">Sign in</Link> to submit, or fill out the form below and you'll be prompted to sign in when you submit.
              </p>
            </CardContent>
          </Card>
        )}
        
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Coin Name *</label>
              <input 
                name="coinName" 
                required 
                value={formData.coinName}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
                placeholder="e.g. Bitcoin" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Symbol *</label>
              <input 
                name="symbol" 
                required 
                value={formData.symbol}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
                placeholder="e.g. BTC" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contract Address</label>
            <input 
              name="contractAddress" 
              value={formData.contractAddress}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
              placeholder="0x..." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
            <input 
              name="website" 
              type="url" 
              value={formData.website}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
              placeholder="https://" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Category *</label>
            <select 
              name="category" 
              required 
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Why should we feature this? *</label>
            <textarea 
              name="description" 
              required 
              rows={4} 
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
              placeholder="Tell us why this coin could moon..." 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Twitter/X</label>
              <input 
                name="twitter" 
                value={formData.twitter}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
                placeholder="https://x.com/..." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Telegram</label>
              <input 
                name="telegram" 
                value={formData.telegram}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white" 
                placeholder="https://t.me/..." 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {submitting ? "Submitting..." : user ? "Submit Gem" : "Sign In to Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}