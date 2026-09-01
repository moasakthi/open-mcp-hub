import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { ServerDto } from "@/lib/server-dto";

// A registered STDIO server is an arbitrary local command the portal will
// spawn on sync — equivalent to what any MCP-aware app does with a
// claude_desktop_config.json entry. Treat "who can register/edit a STDIO
// server" as "who can run code on this host" (see AccessGrant MANAGE level,
// once Phase 4 lands).
export function createTransport(server: ServerDto): Transport {
  if (server.transport === "STDIO") {
    if (!server.command) {
      throw new Error(`Server "${server.name}" has no command configured`);
    }
    return new StdioClientTransport({
      command: server.command,
      args: server.args,
      env: Object.keys(server.env).length ? server.env : undefined,
    });
  }

  if (!server.url) {
    throw new Error(`Server "${server.name}" has no URL configured`);
  }
  return new StreamableHTTPClientTransport(new URL(server.url), {
    requestInit: Object.keys(server.headers).length ? { headers: server.headers } : undefined,
  });
}

export function createMcpClient() {
  return new Client({ name: "open-mcp-hub", version: "0.1.0" }, { capabilities: {} });
}
