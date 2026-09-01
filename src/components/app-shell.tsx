"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export function AppShell({
  user,
  children,
}: {
  user: { email: string; isAdmin: boolean };
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar isAdmin={user.isAdmin} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background/60 px-4 dark:backdrop-blur-xl">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
            <span>{user.email}</span>
            <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
              <LogOut /> Sign out
            </Button>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
