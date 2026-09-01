import { db } from "@/lib/db";
import { AccessGrantsManager } from "@/components/admin/access-grants-manager";
import { PageHeader } from "@/components/page-header";

export default async function AccessGrantsPage() {
  const [grants, users, teams, servers, tools] = await Promise.all([
    db.accessGrant.findMany({ orderBy: { createdAt: "desc" } }),
    db.user.findMany({ orderBy: { email: "asc" }, select: { id: true, email: true } }),
    db.team.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.mcpServer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.mcpTool.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, server: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <PageHeader
        title="Access grants"
        description="Grant a user or team scoped access to a specific server or tool. Admins can always see everything; server creators can always manage their own servers."
      />

      <AccessGrantsManager
        grants={grants}
        users={users.map((u) => ({ id: u.id, label: u.email }))}
        teams={teams.map((t) => ({ id: t.id, label: t.name }))}
        servers={servers.map((s) => ({ id: s.id, label: s.name }))}
        tools={tools.map((t) => ({ id: t.id, label: `${t.name} (${t.server.name})` }))}
      />
    </div>
  );
}
