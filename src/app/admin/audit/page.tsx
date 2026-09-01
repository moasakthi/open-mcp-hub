import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";

function formatMetadata(metadata: string | null): string {
  if (!metadata) return "—";
  try {
    const parsed = JSON.parse(metadata) as Record<string, unknown>;
    return Object.entries(parsed)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
  } catch {
    return "—";
  }
}

export default async function AuditLogPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { actor: { select: { email: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Audit log</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Registry and permission changes — who added, edited, or removed a server, team, member, or access grant.
        Sync runs are tracked separately on each server&rsquo;s detail page.
      </p>

      {logs.length === 0 ? (
        <p className="text-sm text-zinc-500">No changes recorded yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{log.createdAt.toLocaleString()}</td>
                  <td className="px-4 py-3">{log.actor?.email ?? "system"}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{log.action}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{formatMetadata(log.metadata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
