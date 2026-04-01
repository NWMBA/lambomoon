"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Submission = {
  id: string;
  type: string;
  project_slug?: string | null;
  payload: Record<string, any>;
  status: string;
  reason?: string | null;
  created_at: string;
};

export default function CuratorHumanSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function load() {
    try {
      const response = await fetch("/api/curator/human-submissions");
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function moderateSubmission(id: string, action: "approve" | "reject" | "needs_review") {
    setStatusMessage(null);
    const response = await fetch(`/api/curator/human-submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: action === "approve" ? "Approved by curator" : action === "reject" ? "Rejected by curator" : "Marked for further review" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to moderate submission");
      return;
    }
    setStatusMessage(`Submission ${action}d.`);
    await load();
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Human Submissions</h1>
            <p className="text-muted-foreground mt-2">Review community-submitted project ideas using the same moderation flow as agent submissions.</p>
          </div>
          <Link href="/curator" className="text-primary hover:underline">← Back curator</Link>
        </div>

        {statusMessage ? <div className="mb-4 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">{statusMessage}</div> : null}

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
                <CardContent className="space-y-3 text-sm">
                  <p><strong>Type:</strong> {submission.type}</p>
                  {submission.reason ? <p><strong>Review note:</strong> {submission.reason}</p> : null}
                  <p><strong>Created:</strong> {new Date(submission.created_at).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => moderateSubmission(submission.id, "approve")}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => moderateSubmission(submission.id, "needs_review")}>Needs review</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={() => moderateSubmission(submission.id, "reject")}>Reject</Button>
                  </div>
                  <pre className="overflow-x-auto rounded-md bg-secondary/30 p-3 text-xs whitespace-pre-wrap">{JSON.stringify(submission.payload, null, 2)}</pre>
                </CardContent>
              </Card>
            ))}
            {submissions.length === 0 ? <p className="text-muted-foreground">No human submissions yet.</p> : null}
          </div>
        )}
      </main>
    </div>
  );
}
