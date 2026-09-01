import Link from "next/link";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTeamForm } from "@/components/admin/create-team-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function TeamsPage() {
  const teams = await db.team.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Teams</h1>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
        Teams can be granted scoped access to servers or tools together.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">New team</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTeamForm />
        </CardContent>
      </Card>

      {teams.length === 0 ? (
        <p className="text-sm text-zinc-500">No teams yet.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-100 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="px-4 py-3">
                    <Link href={`/admin/teams/${team.id}`} className="font-medium hover:underline">
                      {team.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{team._count.members}</td>
                  <td className="px-4 py-3 text-right">
                    <AdminDeleteButton
                      endpoint={`/api/teams/${team.id}`}
                      confirmMessage={`Remove team "${team.name}"? This also removes its access grants.`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
