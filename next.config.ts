import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The MCP SDK spawns child processes (stdio transport, via cross-spawn)
  // and its own logic for that breaks if Turbopack/webpack bundles it —
  // keep it as a plain runtime require from node_modules.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
};

export default nextConfig;
