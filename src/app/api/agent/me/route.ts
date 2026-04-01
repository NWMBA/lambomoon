import { NextResponse } from "next/server";
import { authenticateAgentRequest } from "@/lib/agent-auth";

export async function GET(request: Request) {
  const auth = await authenticateAgentRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    agent: auth.agents,
    api_key: {
      id: auth.id,
      agent_id: auth.agent_id,
      status: auth.status,
    },
  });
}
