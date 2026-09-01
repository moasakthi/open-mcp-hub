import type { McpServer } from "@/generated/prisma/client";
import { decodeArgs, decodeKv } from "@/lib/mcp-server-codec";

export function toServerDto(server: McpServer) {
  return {
    id: server.id,
    name: server.name,
    description: server.description,
    transport: server.transport,
    command: server.command,
    args: decodeArgs(server.args),
    env: decodeKv(server.env),
    url: server.url,
    headers: decodeKv(server.headers),
    status: server.status,
    ownerTeamId: server.ownerTeamId,
    createdById: server.createdById,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
  };
}

export type ServerDto = ReturnType<typeof toServerDto>;
