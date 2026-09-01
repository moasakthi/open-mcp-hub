import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Admin</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/admin/teams">
          <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base">Teams</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              Create teams and manage their members.
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/access">
          <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base">Access grants</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              Grant users or teams scoped access to specific servers or tools.
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/audit">
          <Card className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-base">Audit log</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600 dark:text-zinc-400">
              See who changed servers, teams, members, or access grants.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
