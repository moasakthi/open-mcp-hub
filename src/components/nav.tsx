"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Nav({ userEmail, isAdmin }: { userEmail: string; isAdmin: boolean }) {
  return (
    <header className="border-b bg-white dark:bg-black">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            open-mcp-hub
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              Servers
            </Link>
            <Link href="/tools" className="hover:text-zinc-950 dark:hover:text-zinc-50">
              Tools
            </Link>
            {isAdmin && (
              <Link href="/admin/teams" className="hover:text-zinc-950 dark:hover:text-zinc-50">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{userEmail}</span>
          <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/login" })}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}
