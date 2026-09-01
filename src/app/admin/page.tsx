import Link from "next/link";
import { Users, ShieldCheck, History, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

const SECTIONS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  { href: "/admin/teams", title: "Teams", description: "Create teams and manage their members.", icon: Users },
  {
    href: "/admin/access",
    title: "Access grants",
    description: "Grant users or teams scoped access to specific servers or tools.",
    icon: ShieldCheck,
  },
  {
    href: "/admin/audit",
    title: "Audit log",
    description: "See who changed servers, teams, members, or access grants.",
    icon: History,
  },
];

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <PageHeader title="Admin" description="Manage teams, scoped access, and the change history." />
      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                  <section.icon className="size-4.5" />
                </div>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{section.description}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
