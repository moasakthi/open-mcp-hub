import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serverInputSchema } from "@/lib/validation";
import { encodeArgs, encodeKv } from "@/lib/mcp-server-codec";
import { toServerDto } from "@/lib/server-dto";
import { getVisibleServerIds } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const visibleServerIds = await getVisibleServerIds({ id: session.user.id, isAdmin: session.user.isAdmin });
  const servers = await db.mcpServer.findMany({
    where: visibleServerIds === "all" ? {} : { id: { in: visibleServerIds } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(servers.map(toServerDto));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = serverInputSchema.parse(await request.json());

    const server = await db.mcpServer.create({
      data: {
        name: body.name,
        description: body.description || null,
        transport: body.transport,
        command: body.transport === "STDIO" ? body.command ?? null : null,
        args: body.transport === "STDIO" ? encodeArgs(body.args) : null,
        env: body.transport === "STDIO" ? encodeKv(body.env) : null,
        url: body.transport === "HTTP" ? body.url || null : null,
        headers: body.transport === "HTTP" ? encodeKv(body.headers) : null,
        createdById: session.user.id,
      },
    });

    await recordAudit({
      actorId: session.user.id,
      action: "server.create",
      targetType: "SERVER",
      targetId: server.id,
      metadata: { name: server.name, transport: server.transport },
    });

    return NextResponse.json(toServerDto(server), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}
