"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Server, Blocks, Users, ShieldCheck, History, Boxes } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/tools", label: "Tools", icon: Blocks },
];

const ADMIN_NAV = [
  { href: "/admin/teams", label: "Teams", icon: Users },
  { href: "/admin/access", label: "Access grants", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit log", icon: History },
];

function NavLink({ href, label, icon: Icon, active }: { href: string; label: string; icon: ComponentType<{ className?: string }>; active: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link href={href} />} isActive={active} tooltip={label} className="relative">
        {active && (
          <motion.span
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-md bg-sidebar-primary/15 ring-1 ring-sidebar-primary/30"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <Icon className="relative z-10" />
        <span className="relative z-10">{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="dark:border-sidebar-border">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              size="lg"
              className="data-[slot=sidebar-menu-button]:hover:bg-transparent"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                <Boxes className="size-4.5" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate font-heading text-sm font-semibold">open-mcp-hub</span>
                <span className="truncate text-xs text-muted-foreground">MCP registry</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Registry</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {PRIMARY_NAV.map((item) => (
                <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ADMIN_NAV.map((item) => (
                  <NavLink key={item.href} {...item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
