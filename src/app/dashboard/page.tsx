import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVisibleServerIds, getVisibleToolWhere } from "@/lib/permissions";
import { formatAuditMetadata } from "@/lib/audit-format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCards } from "@/components/stat-cards";

export default async function DashboardPage() {
  const session = await auth();
  const actor = { id: session!.user.id, isAdmin: session!.user.isAdmin };

  const visibleServerIds = await getVisibleServerIds(actor);
  const serverWhere = visibleServerIds === "all" ? {} : { id: { in: visibleServerIds } };

  const [servers, toolCount, recentAudit] = await Promise.all([
    db.mcpServer.findMany({ where: serverWhere, orderBy: { createdAt: "desc" } }),
    db.mcpTool.count({ where: await getVisibleToolWhere(actor) }),
    actor.isAdmin
      ? db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { actor: { select: { email: true } } } })
      : Promise.resolve([]),
  ]);

  const onlineCount = servers.filter((s) => s.status === "ONLINE").length;
  const errorServers = servers.filter((s) => s.status === "ERROR");

  const stats = {
    servers: servers.length,
    tools: toolCount,
    online: onlineCount,
    needsAttention: errorServers.length,
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <PageHeader
        title="Overview"
        description="What's registered in the hub and what's changed recently."
        action={
          <Button render={<Link href="/servers/new" />}>
            <Plus /> Add server
          </Button>
        }
      />

      <StatCards stats={stats} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent>
            {errorServers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Every server synced cleanly last time. Nothing to do.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {errorServers.map((server) => (
                  <li key={server.id} className="flex items-center justify-between gap-4 py-2.5">
                    <div>
                      <Link href={`/servers/${server.id}`} className="font-medium hover:underline">
                        {server.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">Last sync failed</p>
                    </div>
                    <Badge variant="destructive">ERROR</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {actor.isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAudit.length === 0 ? (
                <p className="text-sm text-muted-foreground">No registry changes recorded yet.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {recentAudit.map((log) => (
                    <li key={log.id} className="py-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-xs text-muted-foreground">{log.createdAt.toLocaleString()}</span>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {log.actor?.email ?? "system"} · {formatAuditMetadata(log.metadata)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
