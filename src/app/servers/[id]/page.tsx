import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageServer, canViewServer, getVisibleToolWhere } from "@/lib/permissions";
import { toServerDto } from "@/lib/server-dto";
import { summarizeInputSchema } from "@/lib/tool-schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteServerButton } from "@/components/delete-server-button";
import { SyncServerButton } from "@/components/sync-server-button";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ONLINE: "default",
  OFFLINE: "secondary",
  ERROR: "destructive",
  UNKNOWN: "outline",
};

export default async function ServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const actor = { id: session!.user.id, isAdmin: session!.user.isAdmin };

  if (!(await canViewServer(actor, id))) notFound();

  const toolWhere = await getVisibleToolWhere(actor);
  const server = await db.mcpServer.findUnique({
    where: { id },
    include: {
      createdBy: { select: { email: true } },
      tools: { where: toolWhere, orderBy: { name: "asc" } },
      syncLogs: { orderBy: { startedAt: "desc" }, take: 5 },
    },
  });

  if (!server) notFound();

  const dto = toServerDto(server);
  const lastSync = server.syncLogs[0];
  const canManage = await canManageServer(actor, id);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{dto.name}</h1>
            <Badge variant="outline">{dto.transport}</Badge>
          </div>
          {dto.description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dto.description}</p>}
        </div>
        {canManage && (
          <div className="flex items-start gap-2">
            <SyncServerButton serverId={dto.id} />
            <Button render={<Link href={`/servers/${dto.id}/edit`} />} variant="outline">
              Edit
            </Button>
            <DeleteServerButton serverId={dto.id} serverName={dto.name} />
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dto.transport === "STDIO" ? (
              <>
                <Field label="Command" value={dto.command ?? "—"} />
                <Field label="Arguments" value={dto.args.length ? dto.args.join(" ") : "—"} />
                <Field label="Env vars" value={Object.keys(dto.env).length ? Object.keys(dto.env).join(", ") : "—"} />
              </>
            ) : (
              <>
                <Field label="URL" value={dto.url ?? "—"} />
                <Field
                  label="Headers"
                  value={Object.keys(dto.headers).length ? Object.keys(dto.headers).join(", ") : "—"}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-zinc-500">Status</span>
              <Badge variant={STATUS_VARIANT[dto.status] ?? "outline"}>{dto.status}</Badge>
            </div>
            <Field label="Added by" value={server.createdBy.email} />
            <Field label="Added" value={dto.createdAt.toLocaleString()} />
            <Field label="Last synced" value={lastSync ? lastSync.startedAt.toLocaleString() : "Never"} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Tools ({server.tools.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {server.tools.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No tools synced yet. Click &ldquo;Sync now&rdquo; to connect to this server and list its tools.
            </p>
          ) : (
            <ul className="divide-y text-sm">
              {server.tools.map((tool) => (
                <li key={tool.id} className="py-2">
                  <p className="font-medium">{tool.name}</p>
                  {tool.description && <p className="text-zinc-500">{tool.description}</p>}
                  <p className="mt-1 font-mono text-xs text-zinc-400">{summarizeInputSchema(tool.inputSchema)}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {server.syncLogs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Sync history</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {server.syncLogs.map((log) => (
                <li key={log.id} className="flex items-start justify-between gap-4 py-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={log.status === "SUCCESS" ? "default" : log.status === "ERROR" ? "destructive" : "outline"}>
                        {log.status}
                      </Badge>
                      <span className="text-zinc-500">{log.startedAt.toLocaleString()}</span>
                    </div>
                    {log.error && <p className="mt-1 max-w-md text-xs text-red-600">{log.error}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-mono text-xs">{value}</span>
    </div>
  );
}
