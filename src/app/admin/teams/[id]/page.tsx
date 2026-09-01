import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddTeamMemberForm } from "@/components/admin/add-team-member-form";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const team = await db.team.findUnique({
    where: { id },
    include: { members: { include: { user: { select: { email: true, name: true } } } } },
  });

  if (!team) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{team.name}</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Add member</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTeamMemberForm teamId={team.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members ({team.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <p className="text-sm text-zinc-500">No members yet.</p>
          ) : (
            <ul className="divide-y text-sm">
              {team.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between gap-4 py-2">
                  <div>
                    <span>{member.user.email}</span>
                    <Badge variant="outline" className="ml-2">
                      {member.role}
                    </Badge>
                  </div>
                  <AdminDeleteButton
                    endpoint={`/api/teams/${team.id}/members/${member.userId}`}
                    confirmMessage={`Remove ${member.user.email} from ${team.name}?`}
                    label="Remove"
                  />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
