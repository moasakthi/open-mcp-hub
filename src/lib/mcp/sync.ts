import { db } from "@/lib/db";
import { toServerDto } from "@/lib/server-dto";
import { createMcpClient, createTransport } from "@/lib/mcp/client";

const CONNECT_TIMEOUT_MS = 30_000;
const REQUEST_TIMEOUT_MS = 15_000;

export type SyncResult = { status: "SUCCESS"; toolCount: number } | { status: "ERROR"; error: string };

// Connects to a registered server, lists its tools, and reconciles McpTool
// rows to match (upsert current, drop ones no longer reported). Records a
// SyncLog entry either way and updates the server's status.
export async function syncServer(serverId: string): Promise<SyncResult> {
  const serverRow = await db.mcpServer.findUniqueOrThrow({ where: { id: serverId } });
  const server = toServerDto(serverRow);

  const syncLog = await db.syncLog.create({ data: { serverId, status: "RUNNING" } });
  const client = createMcpClient();

  try {
    const transport = createTransport(server);
    await client.connect(transport, { timeout: CONNECT_TIMEOUT_MS });

    const { tools } = await client.listTools(undefined, { timeout: REQUEST_TIMEOUT_MS });
    const names = tools.map((tool) => tool.name);

    await db.$transaction([
      ...tools.map((tool) =>
        db.mcpTool.upsert({
          where: { serverId_name: { serverId, name: tool.name } },
          create: {
            serverId,
            name: tool.name,
            description: tool.description ?? null,
            inputSchema: JSON.stringify(tool.inputSchema),
          },
          update: {
            description: tool.description ?? null,
            inputSchema: JSON.stringify(tool.inputSchema),
            lastSeenAt: new Date(),
          },
        }),
      ),
      db.mcpTool.deleteMany({ where: { serverId, name: { notIn: names } } }),
      db.mcpServer.update({ where: { id: serverId }, data: { status: "ONLINE" } }),
      db.syncLog.update({ where: { id: syncLog.id }, data: { status: "SUCCESS", finishedAt: new Date() } }),
    ]);

    return { status: "SUCCESS", toolCount: tools.length };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await db.$transaction([
      db.mcpServer.update({ where: { id: serverId }, data: { status: "ERROR" } }),
      db.syncLog.update({
        where: { id: syncLog.id },
        data: { status: "ERROR", finishedAt: new Date(), error: message },
      }),
    ]);

    return { status: "ERROR", error: message };
  } finally {
    await client.close().catch(() => {});
  }
}
