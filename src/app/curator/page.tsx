"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CurationProject = {
  coingecko_id?: string | null;
  name: string;
  symbol?: string | null;
  slug: string;
  status?: string | null;
  source?: string | null;
  category?: string | null;
  ecosystem?: string | null;
  confidence_score?: number | null;
  launch_date?: string | null;
  website_url?: string | null;
  x_url?: string | null;
  is_featured?: boolean | null;
  is_discoverable?: boolean | null;
  is_hidden?: boolean | null;
  listing_tier?: string | null;
  notes?: string | null;
  market_cap_rank?: number | null;
};

const listingTierOptions = ["prelaunch", "emerging", "midcap", "major"];

export default function CuratorPage() {
  const [projects, setProjects] = useState<CurationProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"error" | "success" | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/projects/curation");
        const data = await response.json();
        setProjects(data.projects || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function patchProject(slug: string, patch: Partial<CurationProject>) {
    setSavingSlug(slug);
    setStatusMessage(null);
    setStatusType(null);
    try {
      const response = await fetch("/api/projects/curation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...patch }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save curation settings");
      setProjects((prev) => prev.map((project) => (project.slug === slug ? data.project : project)));
      setStatusType("success");
      setStatusMessage(`Saved curator settings for ${data.project.name}.`);
    } catch (error: any) {
      console.error(error);
      setStatusType("error");
      setStatusMessage(error?.message || "Failed to save curation settings.");
    } finally {
      setSavingSlug(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((project) =>
      [project.name, project.symbol, project.slug, project.category, project.source, project.listing_tier]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [projects, query]);

  const featured = projects.filter((p) => p.is_featured).length;
  const hidden = projects.filter((p) => p.is_hidden).length;
  const discoverable = projects.filter((p) => p.is_discoverable !== false && !p.is_hidden).length;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Curator Controls</h1>
            <p className="text-muted-foreground mt-2">Review and edit featured, discoverable, hidden, and listing-tier settings directly from the indexed crypto universe.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/curator/submissions" className="text-primary hover:underline">Agent submissions</Link>
            <Link href="/" className="text-primary hover:underline">← Back home</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader><CardTitle>Total Loaded</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{projects.length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Featured</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-amber-400">{featured}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Discoverable</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-green-400">{discoverable}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Hidden</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-red-400">{hidden}</CardContent>
          </Card>
        </div>

        <div className="mb-6 max-w-md">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, symbol, slug, category..."
          />
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-muted-foreground">
            Editing requires a signed-in admin account listed in <code className="rounded bg-secondary px-1 py-0.5">CURATOR_ADMIN_EMAILS</code>.
          </p>
          {statusMessage ? (
            <div className={`rounded-md border px-3 py-2 text-sm ${statusType === "error" ? "border-red-500/40 bg-red-500/10 text-red-300" : "border-green-500/40 bg-green-500/10 text-green-300"}`}>
              {statusMessage}
            </div>
          ) : null}
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading curator data…</p>
        ) : (
          <div className="space-y-4">
            {filtered.map((project) => (
              <Card key={project.slug}>
                <CardContent className="p-4">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{project.name}</h2>
                        {project.symbol && <span className="font-mono text-primary">{project.symbol}</span>}
                        {project.is_featured ? <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">Featured</span> : null}
                        {project.is_hidden ? <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Hidden</span> : null}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {project.status && <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">{project.status}</span>}
                        {project.source && <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{project.source}</span>}
                        {project.category && <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{project.category}</span>}
                        {project.listing_tier && <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{project.listing_tier}</span>}
                      </div>
                      {project.notes ? <p className="text-sm text-muted-foreground">{project.notes}</p> : null}
                      <p className="text-xs text-muted-foreground">Slug: {project.slug}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-[340px] text-sm">
                      <label className="flex flex-col gap-2">
                        <span className="text-muted-foreground">Featured</span>
                        <Button
                          size="sm"
                          variant={project.is_featured ? "default" : "outline"}
                          className={project.is_featured ? "bg-amber-500 hover:bg-amber-600 text-black" : "border-border"}
                          onClick={() => patchProject(project.slug, { is_featured: !project.is_featured })}
                          disabled={savingSlug === project.slug}
                        >
                          {project.is_featured ? "Yes" : "No"}
                        </Button>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-muted-foreground">Discoverable</span>
                        <Button
                          size="sm"
                          variant={project.is_discoverable !== false ? "default" : "outline"}
                          className={project.is_discoverable !== false ? "bg-green-600 hover:bg-green-700" : "border-border"}
                          onClick={() => patchProject(project.slug, { is_discoverable: !(project.is_discoverable !== false) })}
                          disabled={savingSlug === project.slug}
                        >
                          {project.is_discoverable !== false ? "Yes" : "No"}
                        </Button>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-muted-foreground">Hidden</span>
                        <Button
                          size="sm"
                          variant={project.is_hidden ? "default" : "outline"}
                          className={project.is_hidden ? "bg-red-600 hover:bg-red-700" : "border-border"}
                          onClick={() => patchProject(project.slug, { is_hidden: !project.is_hidden })}
                          disabled={savingSlug === project.slug}
                        >
                          {project.is_hidden ? "Yes" : "No"}
                        </Button>
                      </label>

                      <label className="flex flex-col gap-2">
                        <span className="text-muted-foreground">Listing Tier</span>
                        <select
                          value={project.listing_tier || "emerging"}
                          onChange={(e) => patchProject(project.slug, { listing_tier: e.target.value })}
                          disabled={savingSlug === project.slug}
                          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
                        >
                          {listingTierOptions.map((option) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
