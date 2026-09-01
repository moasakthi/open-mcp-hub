import { db } from "@/lib/db";
import { formatAuditMetadata } from "@/lib/audit-format";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export default async function AuditLogPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <PageHeader
        title="Audit log"
        description="Registry and permission changes — who added, edited, or removed a server, team, member, or access grant. Sync runs are tracked separately on each server's detail page."
      />

      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No changes recorded yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card dark:backdrop-blur-xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-muted/40">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{log.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3">{log.actor?.email ?? "system"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {formatAuditMetadata(log.metadata)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
