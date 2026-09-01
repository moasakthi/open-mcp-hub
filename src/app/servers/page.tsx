import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVisibleServerIds } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ServerTable } from "@/components/server-table";
import { PageHeader } from "@/components/page-header";

export default async function ServersPage() {
  const session = await auth();
  const actor = { id: session!.user.id, isAdmin: session!.user.isAdmin };
  const visibleServerIds = await getVisibleServerIds(actor);

  const servers = await db.mcpServer.findMany({
    where: visibleServerIds === "all" ? {} : { id: { in: visibleServerIds } },
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { email: true } }, _count: { select: { tools: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <PageHeader
        title="MCP servers"
        description="Servers registered in the hub, with their transport and tool count."
        action={
          <Button render={<Link href="/servers/new" />}>
            <Plus /> Add server
          </Button>
        }
      />

      {servers.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-muted-foreground">
          <p>No MCP servers registered yet.</p>
          <Button render={<Link href="/servers/new" />} size="sm">
            Add your first server
          </Button>
        </Card>
      ) : (
        <ServerTable
          servers={servers.map((server) => ({
            id: server.id,
            name: server.name,
            description: server.description,
            transport: server.transport,
            status: server.status,
            toolCount: server._count.tools,
            createdByEmail: server.createdBy.email,
          }))}
        />
      )}
    </div>
  );
}
