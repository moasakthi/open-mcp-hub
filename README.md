# open-mcp-hub

A centralized portal for registering MCP (Model Context Protocol) servers and browsing the tools, resources, and prompts they expose — so you don't have to hunt through scattered `mcp.json` / `claude_desktop_config.json` files to know what's available.

**Scope (v1)**: a registry/catalog, not a live traffic gateway. The portal connects to registered MCP servers to introspect their tools and displays them with per-user/team scoped access — it does not proxy actual tool calls.

## Features

- **Server registry** — register STDIO (local command) or Streamable HTTP MCP servers, edit/remove them.
- **Tool sync** — "Sync now" on a server connects to it via the MCP SDK, lists its tools, and stores them; sync history and per-server status (online/error) are tracked.
- **Tool catalog** — a searchable, cross-server view of every synced tool, filterable by server.
- **Scoped access** — admins manage `Team`s and `AccessGrant`s (per-user or per-team, at `VIEW`/`USE`/`MANAGE` level, scoped to a specific server *or* a specific tool) under `/admin`. Non-admins only see what they created or were granted; a grant on one tool never exposes its sibling tools.
- **Audit log** — `/admin/audit` records who created/edited/removed a server, team, member, or access grant (sync runs get their own per-server sync history instead).
- **Scheduled re-sync** — `POST /api/cron/sync-all` re-syncs every registered server; meant to be hit by an external scheduler, not the browser (see below).

> A registered STDIO server is an arbitrary local command the portal will spawn on sync — treat "who can register/edit a STDIO server" as "who can run code on this host" when handing out `MANAGE` grants.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Prisma](https://www.prisma.io) — SQLite for local dev, Postgres-ready for production (see `docker-compose.yml`)
- [Auth.js](https://authjs.dev) (credentials login, RBAC via scoped `AccessGrant`s)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) — connects to registered servers (stdio or Streamable HTTP) to introspect tools
- Tailwind CSS + shadcn/ui

## Getting started

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the seeded admin user (see `prisma/seed.ts` / `.env`'s `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` for credentials). From `/admin` you can create teams and grant scoped access to other users.

### Switching to Postgres

The schema uses plain strings instead of native enums/arrays so it works unmodified on both SQLite and Postgres. To move to Postgres:

1. `docker compose up -d db` to run a local Postgres (or point at a hosted one).
2. Set `provider = "postgresql"` in `prisma/schema.prisma`'s `datasource` block.
3. Set `DATABASE_URL` to your Postgres connection string (`postgresql://openmcphub:openmcphub@localhost:5432/openmcphub` for the compose service above).
4. Swap the driver adapter in `src/lib/db.ts`: replace `@prisma/adapter-libsql`/`PrismaLibSql` with [`@prisma/adapter-pg`](https://www.npmjs.com/package/@prisma/adapter-pg)'s `PrismaPg` (Prisma 7 requires an explicit driver adapter per database).
5. Re-run `npx prisma migrate dev`.

### Scheduled re-sync

`POST /api/cron/sync-all` re-syncs every registered server and returns a per-server result. It's not gated by a browser session — it checks for `Authorization: Bearer $CRON_SECRET` instead, so it can be called by an external scheduler. It deliberately doesn't run on an in-process timer: that's fragile under serverless hosting and would double-fire if you ever run more than one instance. Point any scheduler at it, e.g. a crontab entry for every 15 minutes:

```cron
*/15 * * * * curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://your-hub.example.com/api/cron/sync-all
```

Set `CRON_SECRET` in `.env` (see `.env.example`) to whatever value you configure on the scheduler side.
