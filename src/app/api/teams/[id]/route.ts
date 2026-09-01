import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { recordAudit } from "@/lib/audit";

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.team.findUnique({ where: { id }, select: { name: true } });

  // AccessGrant.subjectId isn't a real FK, so clean up grants for this team
  // before removing it (TeamMember rows cascade via the schema's real FK).
  await db.$transaction([
    db.accessGrant.deleteMany({ where: { subjectType: "TEAM", subjectId: id } }),
    db.team.delete({ where: { id } }),
  ]);

  await recordAudit({
    actorId: session.user.id,
    action: "team.delete",
    targetType: "TEAM",
    targetId: id,
    metadata: { name: existing?.name },
  });

  return new NextResponse(null, { status: 204 });
}
