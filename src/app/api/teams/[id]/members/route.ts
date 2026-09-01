import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { teamMemberInputSchema } from "@/lib/validation";
import { recordAudit } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: teamId } = await params;

  try {
    const body = teamMemberInputSchema.parse(await request.json());

    const user = await db.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return NextResponse.json({ error: "No user with that email" }, { status: 404 });
    }

    const member = await db.teamMember.create({
      data: { teamId, userId: user.id, role: body.role },
      include: { user: { select: { email: true, name: true } } },
    });

    await recordAudit({
      actorId: session.user.id,
      action: "team.member.add",
      targetType: "TEAM_MEMBER",
      targetId: member.id,
      metadata: { teamId, email: user.email, role: body.role },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That user is already a member of this team" }, { status: 409 });
    }
    throw error;
  }
}
