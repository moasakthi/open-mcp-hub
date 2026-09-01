import { db } from "@/lib/db";
import type { AuditTargetType } from "@/lib/types";

// Records registry/permission changes for the admin audit log — not sync
// runs, which already have their own SyncLog per server.
export async function recordAudit(params: {
  actorId: string;
  action: string;
  targetType: AuditTargetType;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await db.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId ?? null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    },
  });
}
