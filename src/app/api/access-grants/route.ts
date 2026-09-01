import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { accessGrantInputSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const grants = await db.accessGrant.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(grants);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = accessGrantInputSchema.parse(await request.json());

    const subjectExists =
      body.subjectType === "USER"
        ? await db.user.findUnique({ where: { id: body.subjectId }, select: { id: true } })
        : await db.team.findUnique({ where: { id: body.subjectId }, select: { id: true } });
    if (!subjectExists) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const resourceExists =
      body.resourceType === "SERVER"
        ? await db.mcpServer.findUnique({ where: { id: body.resourceId }, select: { id: true } })
        : await db.mcpTool.findUnique({ where: { id: body.resourceId }, select: { id: true } });
    if (!resourceExists) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 });
    }

    const grant = await db.accessGrant.create({ data: body });

    await recordAudit({
      actorId: session.user.id,
      action: "accessGrant.create",
      targetType: "ACCESS_GRANT",
      targetId: grant.id,
      metadata: body,
    });

    return NextResponse.json(grant, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That grant already exists" }, { status: 409 });
    }
    throw error;
  }
}
