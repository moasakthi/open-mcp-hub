import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVisibleServerIds } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ONLINE: "default",
  OFFLINE: "secondary",
  ERROR: "destructive",
  UNKNOWN: "outline",
};

export default async function DashboardPage() {
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">MCP servers</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Servers registered in the hub, with their transport and tool count.
          </p>
        </div>
        <Button render={<Link href="/servers/new" />}>Add server</Button>
      </div>

      {servers.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <p>No MCP servers registered yet.</p>
          <Button render={<Link href="/servers/new" />} size="sm">
            Add your first server
          </Button>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Transport</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Tools</th>
                <th className="px-4 py-3 font-medium">Added by</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {servers.map((server) => (
                <tr key={server.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <Link href={`/servers/${server.id}`} className="font-medium hover:underline">
                      {server.name}
                    </Link>
                    {server.description && (
                      <p className="text-xs text-zinc-500">{server.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">{server.transport}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[server.status] ?? "outline"}>{server.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{server._count.tools}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{server.createdBy.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
