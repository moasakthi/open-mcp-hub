"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { summarizeInputSchema } from "@/lib/tool-schema";

export type ToolCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  inputSchema: string;
  server: { id: string; name: string; transport: string };
};

export function ToolCatalog({ tools }: { tools: ToolCatalogItem[] }) {
  const [query, setQuery] = useState("");
  const [serverId, setServerId] = useState<string>("all");

  const servers = useMemo(() => {
    const map = new Map<string, string>();
    for (const tool of tools) map.set(tool.server.id, tool.server.name);
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [tools]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      if (serverId !== "all" && tool.server.id !== serverId) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        (tool.description ?? "").toLowerCase().includes(q) ||
        tool.server.name.toLowerCase().includes(q)
      );
    });
  }, [tools, query, serverId]);

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <Input
          placeholder="Search tools by name, description, or server..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />
        <Select value={serverId} onValueChange={(value) => setServerId(value ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All servers</SelectItem>
            {servers.map(([id, name]) => (
              <SelectItem key={id} value={id}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No tools match.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">Tool</th>
                <th className="px-4 py-3 font-medium">Server</th>
                <th className="px-4 py-3 font-medium">Parameters</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((tool) => (
                <tr key={tool.id} className="align-top hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <p className="font-medium">{tool.name}</p>
                    {tool.description && <p className="text-xs text-zinc-500">{tool.description}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/servers/${tool.server.id}`} className="hover:underline">
                      {tool.server.name}
                    </Link>
                    <Badge variant="outline" className="ml-2">
                      {tool.server.transport}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{summarizeInputSchema(tool.inputSchema)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
