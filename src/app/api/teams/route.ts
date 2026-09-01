import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { teamInputSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const teams = await db.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { members: true } } },
  });
  return NextResponse.json(teams);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = teamInputSchema.parse(await request.json());
    const team = await db.team.create({ data: { name: body.name } });

    await recordAudit({
      actorId: session.user.id,
      action: "team.create",
      targetType: "TEAM",
      targetId: team.id,
      metadata: { name: team.name },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A team with that name already exists" }, { status: 409 });
    }
    throw error;
  }
}
