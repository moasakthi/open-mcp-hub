import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { syncServer } from "@/lib/mcp/sync";
import { canManageServer } from "@/lib/permissions";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actor = { id: session.user.id, isAdmin: session.user.isAdmin };
  if (!(await canManageServer(actor, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.mcpServer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result = await syncServer(id);
  return NextResponse.json(result, { status: result.status === "SUCCESS" ? 200 : 502 });
}
