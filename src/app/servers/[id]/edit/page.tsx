import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canManageServer } from "@/lib/permissions";
import { toServerDto } from "@/lib/server-dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ServerForm } from "@/components/server-form";

export default async function EditServerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const actor = { id: session!.user.id, isAdmin: session!.user.isAdmin };

  if (!(await canManageServer(actor, id))) notFound();

  const server = await db.mcpServer.findUnique({ where: { id } });
  if (!server) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Edit {server.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerForm mode="edit" server={toServerDto(server)} />
        </CardContent>
      </Card>
    </div>
  );
}
