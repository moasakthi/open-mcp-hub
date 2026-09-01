import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string; userId: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: teamId, userId } = await params;
  const member = await db.teamMember.delete({
    where: { userId_teamId: { userId, teamId } },
    include: { user: { select: { email: true } } },
  });

  await recordAudit({
    actorId: session.user.id,
    action: "team.member.remove",
    targetType: "TEAM_MEMBER",
    targetId: member.id,
    metadata: { teamId, email: member.user.email },
  });

  return new NextResponse(null, { status: 204 });
}
