import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type Actor = { id: string; isAdmin: boolean };

async function getTeamIds(userId: string): Promise<string[]> {
  const memberships = await db.teamMember.findMany({ where: { userId }, select: { teamId: true } });
  return memberships.map((m) => m.teamId);
}

function subjectFilter(userId: string, teamIds: string[]) {
  return [
    { subjectType: "USER", subjectId: userId },
    ...teamIds.map((teamId) => ({ subjectType: "TEAM", subjectId: teamId })),
  ];
}

async function getToolGrantResourceIds(actor: Actor, teamIds: string[]): Promise<string[]> {
  const grants = await db.accessGrant.findMany({
    where: { resourceType: "TOOL", OR: subjectFilter(actor.id, teamIds) },
    select: { resourceId: true },
  });
  return grants.map((g) => g.resourceId);
}

// Servers where the actor can see *every* tool: ones they created, plus
// ones with a direct SERVER-level grant (to them or a team they're in).
// Deliberately excludes servers reachable only via a single TOOL-level
// grant — a grant on one tool must not leak its sibling tools.
async function computeFullyVisibleServerIds(actor: Actor, teamIds: string[]): Promise<string[]> {
  const [serverGrants, owned] = await Promise.all([
    db.accessGrant.findMany({
      where: { resourceType: "SERVER", OR: subjectFilter(actor.id, teamIds) },
      select: { resourceId: true },
    }),
    db.mcpServer.findMany({ where: { createdById: actor.id }, select: { id: true } }),
  ]);

  const serverIds = new Set(serverGrants.map((g) => g.resourceId));
  for (const server of owned) serverIds.add(server.id);
  return Array.from(serverIds);
}

// Server ids visible at all (for the server list/dashboard): fully visible
// servers, plus ones that merely own a tool the actor has a direct grant
// on — enough to know the server exists, not enough to see its other tools.
async function computeVisibleServerIds(actor: Actor): Promise<string[]> {
  const teamIds = await getTeamIds(actor.id);
  const [fullyVisible, toolGrantIds] = await Promise.all([
    computeFullyVisibleServerIds(actor, teamIds),
    getToolGrantResourceIds(actor, teamIds),
  ]);

  const serverIds = new Set(fullyVisible);
  if (toolGrantIds.length) {
    const tools = await db.mcpTool.findMany({ where: { id: { in: toolGrantIds } }, select: { serverId: true } });
    for (const tool of tools) serverIds.add(tool.serverId);
  }

  return Array.from(serverIds);
}

// "all" means "don't filter" (admins). Otherwise the explicit list of
// server ids this actor may see (in the dashboard sense — see above).
export async function getVisibleServerIds(actor: Actor): Promise<string[] | "all"> {
  if (actor.isAdmin) return "all";
  return computeVisibleServerIds(actor);
}

// A Prisma `where` fragment for McpTool selecting tools visible to the
// actor: their server is *fully* visible, or there's a direct TOOL-level
// grant on that specific tool. Deliberately narrower than
// getVisibleServerIds so a single tool grant doesn't expose its siblings.
export async function getVisibleToolWhere(actor: Actor): Promise<Prisma.McpToolWhereInput> {
  if (actor.isAdmin) return {};

  const teamIds = await getTeamIds(actor.id);
  const [fullyVisibleServerIds, toolGrantIds] = await Promise.all([
    computeFullyVisibleServerIds(actor, teamIds),
    getToolGrantResourceIds(actor, teamIds),
  ]);

  return {
    OR: [{ serverId: { in: fullyVisibleServerIds } }, { id: { in: toolGrantIds } }],
  };
}

// MANAGE-level check for a single server: admins, the creator, or anyone
// with a MANAGE AccessGrant on it (directly or via a team).
export async function canManageServer(actor: Actor, serverId: string): Promise<boolean> {
  if (actor.isAdmin) return true;

  const server = await db.mcpServer.findUnique({ where: { id: serverId }, select: { createdById: true } });
  if (server?.createdById === actor.id) return true;

  const teamIds = await getTeamIds(actor.id);
  const grant = await db.accessGrant.findFirst({
    where: {
      resourceType: "SERVER",
      resourceId: serverId,
      level: "MANAGE",
      OR: subjectFilter(actor.id, teamIds),
    },
  });
  return Boolean(grant);
}

export async function canViewServer(actor: Actor, serverId: string): Promise<boolean> {
  const visible = await getVisibleServerIds(actor);
  return visible === "all" || visible.includes(serverId);
}
