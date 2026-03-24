import Link from "next/link";
import { readFileSync } from "fs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UniverseRecord = {
  name: string;
  symbol?: string;
  slug: string;
  status: string;
  source: string;
  category?: string;
  ecosystem?: string;
  confidence_score: number;
  website_url?: string;
  x_url?: string;
  launch_date?: string | null;
  notes?: string;
};

function loadUniverse(): UniverseRecord[] {
  try {
    const raw = readFileSync(process.cwd() + "/data/imports/universe-merged.json", "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function getHealth(record: UniverseRecord) {
  let score = 0;
  if (record.website_url) score++;
  if (record.category) score++;
  if (record.symbol) score++;
  if (record.source) score++;
  if (record.status) score++;
  if (record.confidence_score >= 0.8) score++;

  if (score >= 5) return { label: "Strong", color: "text-green-400" };
  if (score >= 3) return { label: "Okay", color: "text-yellow-400" };
  return { label: "Thin", color: "text-red-400" };
}

export default function CuratorPage() {
  const universe = loadUniverse();
  const strong = universe.filter((r) => getHealth(r).label === "Strong").length;
  const thin = universe.filter((r) => getHealth(r).label === "Thin").length;

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Curator Preview</h1>
            <p className="text-muted-foreground mt-2">Inspect the merged crypto universe before deeper import and curation.</p>
          </div>
          <Link href="/" className="text-primary hover:underline">← Back home</Link>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader><CardTitle>Total Records</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{universe.length}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Strong Records</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-green-400">{strong}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Thin Records</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold text-red-400">{thin}</CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {universe.map((record) => {
            const health = getHealth(record);
            return (
              <Card key={`${record.source}-${record.slug}`}>
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{record.name}</h2>
                        {record.symbol && <span className="font-mono text-primary">{record.symbol}</span>}
                        <span className={`text-xs ${health.color}`}>{health.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 rounded-full bg-secondary text-muted-foreground">{record.status}</span>
                        <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{record.source}</span>
                        {record.category && <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{record.category}</span>}
                        {record.ecosystem && <span className="px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground">{record.ecosystem}</span>}
                      </div>
                      {record.notes && <p className="text-sm text-muted-foreground">{record.notes}</p>}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm min-w-[320px]">
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-medium">{record.confidence_score}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Launch</p>
                        <p className="font-medium">{record.launch_date ? new Date(record.launch_date).toLocaleDateString() : "TBD"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Website</p>
                        <p className="font-medium">{record.website_url ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">X</p>
                        <p className="font-medium">{record.x_url ? "Yes" : "No"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Slug</p>
                        <p className="font-medium">{record.slug}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
