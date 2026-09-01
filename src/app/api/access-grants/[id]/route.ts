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
  const grant = await db.accessGrant.delete({ where: { id } });

  await recordAudit({
    actorId: session.user.id,
    action: "accessGrant.revoke",
    targetType: "ACCESS_GRANT",
    targetId: id,
    metadata: {
      subjectType: grant.subjectType,
      subjectId: grant.subjectId,
      resourceType: grant.resourceType,
      resourceId: grant.resourceId,
      level: grant.level,
    },
  });

  return new NextResponse(null, { status: 204 });
}
