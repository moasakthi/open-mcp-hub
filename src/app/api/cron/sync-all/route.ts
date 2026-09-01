import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncServer } from "@/lib/mcp/sync";

// Not user-session-gated — this is meant to be hit by an external scheduler
// (cron, Vercel Cron, etc.) on a timer, authenticated with a shared secret
// instead. See README for how to wire it up.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const servers = await db.mcpServer.findMany({ select: { id: true, name: true } });

  // Sequential: each sync spawns a process (for STDIO servers) or opens a
  // connection, so run one at a time rather than piling them on at once.
  const results = [];
  for (const server of servers) {
    const result = await syncServer(server.id);
    results.push({ id: server.id, name: server.name, ...result });
  }

  return NextResponse.json({ synced: results.length, results });
}
