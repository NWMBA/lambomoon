"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Submission = {
  id: string;
  type: string;
  project_slug?: string | null;
  payload: Record<string, any>;
  status: string;
  reason?: string | null;
  created_at: string;
};

export default function CuratorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/curator/agent-submissions");
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Agent Submissions</h1>
            <p className="text-muted-foreground mt-2">Review incoming project discoveries and metadata updates from registered agents.</p>
          </div>
          <Link href="/curator" className="text-primary hover:underline">← Back curator</Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading submissions…</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{submission.payload?.name || submission.project_slug || "Untitled submission"}</span>
                    <span className="text-xs rounded-full bg-secondary px-2 py-1 text-muted-foreground">{submission.status}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Type:</strong> {submission.type}</p>
                  {submission.reason ? <p><strong>Review note:</strong> {submission.reason}</p> : null}
                  <p><strong>Created:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                  <pre className="overflow-x-auto rounded-md bg-secondary/30 p-3 text-xs whitespace-pre-wrap">{JSON.stringify(submission.payload, null, 2)}</pre>
                </CardContent>
              </Card>
            ))}
            {submissions.length === 0 ? <p className="text-muted-foreground">No agent submissions yet.</p> : null}
          </div>
        )}
      </main>
    </div>
  );
}
