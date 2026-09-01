import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getVisibleToolWhere } from "@/lib/permissions";
import { ToolCatalog } from "@/components/tool-catalog";

export default async function ToolsPage() {
  const session = await auth();
  const actor = { id: session!.user.id, isAdmin: session!.user.isAdmin };
  const where = await getVisibleToolWhere(actor);

  const tools = await db.mcpTool.findMany({
    where,
    include: { server: { select: { id: true, name: true, transport: true } } },
    orderBy: [{ server: { name: "asc" } }, { name: "asc" }],
  });

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Tool catalog</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Every tool synced from a registered MCP server, searchable across servers.
        </p>
      </div>

      {tools.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No tools synced yet. Register a server and sync it from its detail page.
        </p>
      ) : (
        <ToolCatalog tools={tools} />
      )}
    </div>
  );
}
