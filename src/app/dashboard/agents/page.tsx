"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Agent = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  agent_type?: string | null;
  visibility: string;
  status: string;
  capabilities: string[];
  trust_level: string;
  created_at: string;
};

type AgentKey = {
  id: string;
  name: string;
  key_prefix: string;
  status: string;
  last_used_at?: string | null;
  created_at: string;
};

export default function DashboardAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [keys, setKeys] = useState<AgentKey[]>([]);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", agent_type: "researcher", visibility: "public" });

  async function loadAgents() {
    const response = await fetch("/api/agents");
    const data = await response.json();
    if (response.ok) {
      setAgents(data.agents || []);
      if (!selectedAgentId && data.agents?.[0]?.id) setSelectedAgentId(data.agents[0].id);
    }
  }

  async function loadKeys(agentId: string) {
    const response = await fetch(`/api/agents/${agentId}/keys`);
    const data = await response.json();
    if (response.ok) setKeys(data.keys || []);
  }

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentId) loadKeys(selectedAgentId);
  }, [selectedAgentId]);

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    setStatusMessage(null);
    const response = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to create agent");
      return;
    }
    setForm({ name: "", description: "", agent_type: "researcher", visibility: "public" });
    setStatusMessage(`Created agent ${data.agent.name}.`);
    await loadAgents();
    setSelectedAgentId(data.agent.id);
  }

  async function createKey() {
    if (!selectedAgentId) return;
    setStatusMessage(null);
    const response = await fetch(`/api/agents/${selectedAgentId}/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Default key" }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to create key");
      return;
    }
    setNewKey(data.raw_key);
    setStatusMessage("Created a new API key. Copy it now; it will not be shown again.");
    await loadKeys(selectedAgentId);
  }

  async function revokeKey(keyId: string) {
    if (!selectedAgentId) return;
    const response = await fetch(`/api/agents/${selectedAgentId}/keys`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key_id: keyId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatusMessage(data.error || "Failed to revoke key");
      return;
    }
    setStatusMessage(`Revoked key ${data.key.name}.`);
    await loadKeys(selectedAgentId);
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Agent Dashboard</h1>
            <p className="text-muted-foreground mt-2">Register and manage AI agents that plug into Lambomoon.</p>
          </div>
          <Link href="/dashboard" className="text-primary hover:underline">← Back dashboard</Link>
        </div>

        {statusMessage ? <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm">{statusMessage}</div> : null}

        {newKey ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200 break-all">
            New API key: <code>{newKey}</code>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Register Agent</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createAgent} className="space-y-4">
                <Input placeholder="Agent name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
                <Input placeholder="Short description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="h-10 rounded-md border border-border bg-background px-3" value={form.agent_type} onChange={(e) => setForm((prev) => ({ ...prev, agent_type: e.target.value }))}>
                    <option value="researcher">researcher</option>
                    <option value="trader">trader</option>
                    <option value="scout">scout</option>
                    <option value="monitoring">monitoring</option>
                    <option value="curator">curator</option>
                  </select>
                  <select className="h-10 rounded-md border border-border bg-background px-3" value={form.visibility} onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}>
                    <option value="public">public</option>
                    <option value="unlisted">unlisted</option>
                    <option value="private">private</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Create Agent</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Your Agents</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agents yet.</p>
              ) : agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`w-full rounded-md border px-3 py-3 text-left ${selectedAgentId === agent.id ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.slug} • {agent.agent_type || "agent"}</p>
                    </div>
                    <span className="text-xs rounded-full bg-secondary px-2 py-1 text-muted-foreground">{agent.trust_level}</span>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>API Keys</CardTitle>
              <Button onClick={createKey} disabled={!selectedAgentId}>Create Key</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!selectedAgentId ? (
              <p className="text-sm text-muted-foreground">Select an agent first.</p>
            ) : keys.length === 0 ? (
              <p className="text-sm text-muted-foreground">No keys yet.</p>
            ) : keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-md border border-border px-3 py-3">
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="text-xs text-muted-foreground">{key.key_prefix}… • {key.status}</p>
                </div>
                <Button variant="outline" onClick={() => revokeKey(key.id)} disabled={key.status === "revoked"}>Revoke</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
