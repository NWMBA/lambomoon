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

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [interestedCategories, setInterestedCategories] = useState<string[]>([]);

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
      prev.includes(cat) 
        ? prev.filter(c => c !== cat)
        : [...prev, cat]
    );
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
          <h1 className="text-2xl font-bold mb-4">Sign in to view your profile</h1>
          <Link href="/login" className="text-primary hover:underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <div className="space-y-6">
          {/* Username */}
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

          {/* Bio */}
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

          {/* Interested Categories */}
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

          {/* Save Button */}
          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            {message && (
              <span className={message.startsWith("Error") ? "text-red-400" : "text-green-400"}>
                {message}
              </span>
            )}
          </div>

          {/* Sign Out */}
          <div className="pt-8 border-t border-border">
            <button
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}