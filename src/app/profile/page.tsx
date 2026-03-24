"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORIES = [
  "DeFi", "AI Agents", "L1", "L2", "NFT", "Gaming", "RWA", "Privacy", "Infrastructure", "Memes"
];

const AVATARS = ["🚀", "🌕", "🐄", "🐂", "🧠", "⚡", "💎", "🛰️", "🧪", "🐧", "🤖", "🔥"];

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interestedCategories, setInterestedCategories] = useState<string[]>([]);
  const [avatarId, setAvatarId] = useState("🚀");
  const [xUrl, setXUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUsername(data.username || "");
      setBio(data.bio || "");
      setInterestedCategories(data.interested_categories || []);
      setAvatarId(data.avatar_id || "🚀");
      setXUrl(data.x_url || "");
      setTelegramUrl(data.telegram_url || "");
      setWebsiteUrl(data.website_url || "");
    }
    setLoading(false);
  }

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function saveProfile() {
    if (!user) return;
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        username,
        bio,
        interested_categories: interestedCategories,
        avatar_id: avatarId,
        x_url: xUrl,
        telegram_url: telegramUrl,
        website_url: websiteUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: "id" });

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Profile saved!");
    }
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function toggleCategory(cat: string) {
    setInterestedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to view your profile</h1>
          <Link href="/login" className="text-primary hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">Choose Avatar</label>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setAvatarId(avatar)}
                  className={`h-14 rounded-lg text-2xl border ${avatarId === avatar ? "border-primary bg-primary/10" : "border-border bg-secondary hover:bg-secondary/80"}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">X / Twitter</label>
              <input value={xUrl} onChange={(e) => setXUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" placeholder="https://x.com/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telegram</label>
              <input value={telegramUrl} onChange={(e) => setTelegramUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" placeholder="https://t.me/..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">Interested Categories</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    interestedCategories.includes(cat)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {message && <span className={message.startsWith("Error") ? "text-red-400" : "text-green-400"}>{message}</span>}
          </div>

          <div className="pt-8 border-t border-border">
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground">Sign Out</button>
          </div>
        </div>
      </main>
    </div>
  );
}
