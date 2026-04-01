import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const discoveryExample = `curl -H "Authorization: Bearer lm_agent_xxx" \
  https://lambomoon.io/api/agent/feed/discovery`;

const featuredExample = `curl -H "Authorization: Bearer lm_agent_xxx" \
  https://lambomoon.io/api/agent/feed/featured`;

const meExample = `curl -H "Authorization: Bearer lm_agent_xxx" \
  https://lambomoon.io/api/agent/me`;

export default function AgentsPage() {
  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 space-y-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold">Agent API</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Register your AI agent with Lambomoon to access structured crypto discovery feeds, featured picks, upcoming launches, and market movers.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/how-it-works" className="text-primary hover:underline">Platform explainer</Link>
            <Link href="/dashboard/agents" className="text-primary hover:underline">Manage your agents →</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>1. Register Agent</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Create an agent in your dashboard and generate an API key.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>2. Authenticate</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Pass the API key as a bearer token in the <code>Authorization</code> header.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>3. Consume Feeds</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use the discovery, featured, upcoming, and movers feeds to power your agent workflows.
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Available Endpoints</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium">GET /api/agent/me</p>
              <p className="text-muted-foreground">Returns the authenticated agent identity.</p>
            </div>
            <div>
              <p className="font-medium">GET /api/agent/feed/discovery</p>
              <p className="text-muted-foreground">Discovery-first feed of emerging and curated crypto projects.</p>
            </div>
            <div>
              <p className="font-medium">GET /api/agent/feed/featured</p>
              <p className="text-muted-foreground">Featured editorial picks and high-conviction projects.</p>
            </div>
            <div>
              <p className="font-medium">GET /api/agent/feed/upcoming</p>
              <p className="text-muted-foreground">Upcoming and prelaunch projects ordered by launch timing.</p>
            </div>
            <div>
              <p className="font-medium">GET /api/agent/feed/movers</p>
              <p className="text-muted-foreground">Listed projects with the biggest market moves.</p>
            </div>
            <div>
              <p className="font-medium">POST /api/agent/signals</p>
              <p className="text-muted-foreground">Let an authenticated agent send watch, boost, conviction, or review signals for a project slug.</p>
            </div>
            <div>
              <p className="font-medium">Operator webhooks</p>
              <p className="text-muted-foreground">Configure webhook subscriptions from the agent dashboard and send signed test deliveries.</p>
            </div>
            <div>
              <p className="font-medium">Targeted subscription rules</p>
              <p className="text-muted-foreground">Create category, ecosystem, status, source, and tag rules so your webhooks focus on what your agent actually cares about.</p>
            </div>
            <div>
              <p className="font-medium">Agent signals</p>
              <p className="text-muted-foreground">Registered agents can send watch, boost, conviction, and review signals on projects using the authenticated signal API.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Who am I?</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap rounded-md bg-secondary/40 p-3">{meExample}</pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Discovery Feed</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap rounded-md bg-secondary/40 p-3">{discoveryExample}</pre>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Featured Feed</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap rounded-md bg-secondary/40 p-3">{featuredExample}</pre>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Response Notes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>All feed endpoints return machine-friendly JSON.</p>
            <p>Projects include identifiers, category data, launch timing, market fields when available, and editorial discovery fields such as <code>is_featured</code> and <code>listing_tier</code>.</p>
            <p>Authentication currently uses bearer API keys created from <Link href="/dashboard/agents" className="text-primary hover:underline">the agent dashboard</Link>.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
