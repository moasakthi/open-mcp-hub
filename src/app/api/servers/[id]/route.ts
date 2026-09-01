import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { serverInputSchema } from "@/lib/validation";
import { encodeArgs, encodeKv } from "@/lib/mcp-server-codec";
import { toServerDto } from "@/lib/server-dto";
import { canManageServer, canViewServer } from "@/lib/permissions";
import { recordAudit } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actor = { id: session.user.id, isAdmin: session.user.isAdmin };
  if (!(await canViewServer(actor, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const server = await db.mcpServer.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toServerDto(server));
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actor = { id: session.user.id, isAdmin: session.user.isAdmin };
  if (!(await canManageServer(actor, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = serverInputSchema.parse(await request.json());

    const server = await db.mcpServer.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description || null,
        transport: body.transport,
        command: body.transport === "STDIO" ? body.command ?? null : null,
        args: body.transport === "STDIO" ? encodeArgs(body.args) : null,
        env: body.transport === "STDIO" ? encodeKv(body.env) : null,
        url: body.transport === "HTTP" ? body.url || null : null,
        headers: body.transport === "HTTP" ? encodeKv(body.headers) : null,
      },
    });

    await recordAudit({
      actorId: session.user.id,
      action: "server.update",
      targetType: "SERVER",
      targetId: server.id,
      metadata: { name: server.name, transport: server.transport },
    });

    return NextResponse.json(toServerDto(server));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const actor = { id: session.user.id, isAdmin: session.user.isAdmin };
  if (!(await canManageServer(actor, id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await db.mcpServer.findUnique({ where: { id }, select: { name: true } });

  // AccessGrant.resourceId isn't a real FK (it's polymorphic across
  // servers/tools), so it won't cascade — clean up grants pointing at this
  // server or its tools before removing it.
  const tools = await db.mcpTool.findMany({ where: { serverId: id }, select: { id: true } });
  await db.$transaction([
    db.accessGrant.deleteMany({
      where: {
        OR: [
          { resourceType: "SERVER", resourceId: id },
          { resourceType: "TOOL", resourceId: { in: tools.map((t) => t.id) } },
        ],
      },
    }),
    db.mcpServer.delete({ where: { id } }),
  ]);

  await recordAudit({
    actorId: session.user.id,
    action: "server.delete",
    targetType: "SERVER",
    targetId: id,
    metadata: { name: existing?.name },
  });

  return new NextResponse(null, { status: 204 });
}
