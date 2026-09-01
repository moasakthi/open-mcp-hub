import { hash } from "bcryptjs";
import { db } from "../src/lib/db";
import { encodeArgs, encodeKv } from "../src/lib/mcp-server-codec";

type SeedServer = {
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
};

// Well-known reference/community MCP servers, preloaded so the catalog
// isn't empty on first run. Most need real credentials (placeholders below)
// before they'll sync successfully — that's expected; edit them from the
// server detail page once you have the tokens.
const SEED_SERVERS: SeedServer[] = [
  {
    name: "Filesystem",
    description: "Read/write access to a local directory.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
  },
  {
    name: "Memory",
    description: "Persistent knowledge-graph memory across conversations.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
  },
  {
    name: "Everything",
    description: "Reference server exercising the full MCP feature set — useful for testing the hub itself.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-everything"],
  },
  {
    name: "Sequential Thinking",
    description: "Structured step-by-step reasoning tool.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
  },
  {
    name: "Fetch",
    description: "Fetches and converts web pages to markdown for a model to read.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
  },
  {
    name: "GitHub",
    description: "Repos, issues, and pull requests via the GitHub API.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: "replace-with-a-github-pat" },
  },
  {
    name: "GitLab",
    description: "Projects, issues, and merge requests via the GitLab API.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gitlab"],
    env: { GITLAB_PERSONAL_ACCESS_TOKEN: "replace-with-a-gitlab-pat" },
  },
  {
    name: "Slack",
    description: "Read and post messages in a Slack workspace.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-slack"],
    env: { SLACK_BOT_TOKEN: "xoxb-replace-me", SLACK_TEAM_ID: "T00000000" },
  },
  {
    name: "Google Drive",
    description: "Search and read files from Google Drive.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-gdrive"],
  },
  {
    name: "Postgres",
    description: "Read-only querying and schema inspection for a Postgres database.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:password@localhost:5432/mydb"],
  },
  {
    name: "Puppeteer",
    description: "Headless-browser automation: navigate, screenshot, and scrape pages.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
  },
  {
    name: "Brave Search",
    description: "Web and local search via the Brave Search API.",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    env: { BRAVE_API_KEY: "replace-with-a-brave-api-key" },
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-me-please";

  const passwordHash = await hash(password, 10);

  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      passwordHash,
      isAdmin: true,
    },
  });

  console.log(`Seeded admin user: ${admin.email}`);

  const existingServers = await db.mcpServer.count();
  if (existingServers > 0) {
    console.log(`Skipping server preload — ${existingServers} server(s) already registered.`);
  } else {
    await db.mcpServer.createMany({
      data: SEED_SERVERS.map((server) => ({
        name: server.name,
        description: server.description,
        transport: "STDIO",
        command: server.command,
        args: encodeArgs(server.args),
        env: encodeKv(server.env),
        createdById: admin.id,
      })),
    });
    console.log(`Preloaded ${SEED_SERVERS.length} MCP servers.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
